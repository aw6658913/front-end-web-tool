import * as React from 'react';
import { Upload, message, notification } from 'antd';
import fetch from 'isomorphic-fetch';
import { formatMessage } from 'umi/locale';

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。'
};

const checkStatus = response => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const errortext = codeMessage[response.status] || response.statusText;
    notification.error({
        message: `请求错误 ${response.status}: ${response.url}`,
        description: errortext
    });
    const error = new Error(errortext);
    error.name = response.status;
    error.response = response;
    throw error;
};

function request(url, option) {
    const defaultOptions = {
        credentials: 'include'
    };
    const newOptions = { ...defaultOptions, ...option };
    if (newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'DELETE') {
        if (!(newOptions.body instanceof FormData)) {
            newOptions.headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                ...newOptions.headers
            };
            newOptions.body = JSON.stringify(newOptions.body);
        } else {
            // newOptions.body is FormData
            newOptions.headers = {
                Accept: 'application/json',
                ...newOptions.headers
            };
        }
    }
    return fetch(url, newOptions)
        .then(checkStatus)
        .then(response => {
            // DELETE and 204 do not return data by default
            // using .json will report an error.
            if (newOptions.method === 'DELETE' || response.status === 204) {
                return response.text();
            }
            return response.json();
        });
}

// 上传至服务器
function uploadToServer(params) {
    const defaultOptions = { method: 'PUT', mode: 'cors' };
    defaultOptions.headers = {
        Accept: 'application/json'
    };
    defaultOptions.body = params.file;
    return fetch(params.preUrl, defaultOptions)
        .then(checkStatus)
        .then(response => response)
        .catch(e => e);
}

class UploadAws extends React.PureComponent {
    static defaultProps = {
        fileList: [],
        categoryCode: '',
        checkFileType: '',
        checkFileSize: 0,
        uploadUrl: '',
        dragAble: false,
        isSingle: false,
        isWait: false,
        disabled: false,
        uploadResource: null,
        checkFileTypeMsg: null,
        checkFileSizeMsg: null,
        setFileList: () => {}
    };

    state = {
        disabled: false
    };

    // 校验上传文件类型
    checkUpload = (file, fileList) => {
        const {
            checkFileType = '',
            checkFileSize = 0,
            // creativeSize = {},
            checkFileTypeMsg = null,
            checkFileSizeMsg = null
        } = this.props;

        if (checkFileType.length > 0) {
            const fileType = file.name.substring(file.name.lastIndexOf('.') + 1);
            if (!checkFileType.toLocaleLowerCase().includes(fileType.toLocaleLowerCase())) {
                if (checkFileTypeMsg) {
                    message.error(checkFileTypeMsg);
                } else {
                    message.error(`${formatMessage({ id: 'sysCs.global.upload.tip' })} ${checkFileType}`);
                }

                fileList.splice(fileList.indexOf(file), 1);
                return false;
            }
        }

        if (checkFileSize > 0) {
            const isLess = file.size / 1024 / 1024 < checkFileSize;
            if (!isLess) {
                if (checkFileSizeMsg) {
                    message.error(checkFileSizeMsg);
                } else {
                    message.error(`${formatMessage({ id: 'sysCs.global.upload.size' })} ${checkFileSize}MB!`);
                }

                fileList.splice(fileList.indexOf(file), 1);
                return false;
            }
        }

        // if (creativeSize && file.type && file.type.includes('image')) {
        //     const reader = new FileReader();
        //     reader.readAsDataURL(file);
        //     return new Promise((resolve, reject) => {
        //         reader.onload = theFile => {
        //             const image = new Image();
        //             image.src = theFile.target.result;
        //             // eslint-disable-next-line func-names
        //             image.onload = function() {
        //                 if (creativeSize.width < this.width) {
        //                     message.error(`${file.name} wrong width, please upload again！`);
        //                     fileList.splice(fileList.indexOf(file), 1);
        //                     return reject();
        //                 }
        //                 if (creativeSize.height < this.height) {
        //                     message.error(`${file.name} wrong height, please upload again！`);
        //                     fileList.splice(fileList.indexOf(file), 1);
        //                     return reject();
        //                 }
        //                 return resolve();
        //             };
        //         };
        //     });
        // }
        return true;
    };

    // 上传
    customUpload = async file => {
        const { uploadUrl, isWait } = this.props;
        const params = {
            fileNames: [file.name]
        };
        // 设置 禁用
        this.setState({ disabled: true });
        // 获取预签名路径
        const response = await request(uploadUrl, {
            method: 'POST',
            body: params
        });
        // 返回内容
        if (response.data && response.data.length > 0) {
            const { keyName, preUrl, url } = response.data[0];
            const uploadParams = { preUrl, file };
            const uploadObj = {
                keyName: `ADD:${keyName}`,
                url
            };
            const fileChange = { ...file, ...uploadObj };
            Object.assign(file, fileChange);
            // 上传至服务器
            try {
                // 上传至服务器
                if (isWait) {
                    await uploadToServer(uploadParams);
                } else {
                    uploadToServer(uploadParams);
                }
                // 解除 禁用
                this.setState({ disabled: false });
            } catch (e) {
                message.warning(`${formatMessage({ id: 'sysCs.global.upload.timeout' })}`);
            }
        }
        return '';
    };

    // 删除文件
    removeUpload = file => {
        const { setFileList, fileList: showFileList, categoryCode, uploadResource } = this.props;
        const showFileListCopy = showFileList.slice(); // 获取数组的副本
        const { keyName } = file;

        let keyNameAndOptListCopy = [];
        if (uploadResource) {
            const { keyNameAndOpt: keyNameAndOptList } = uploadResource;
            keyNameAndOptListCopy = [...keyNameAndOptList];
        }

        let keyNameAndOptListResult = [];

        if (keyName.startsWith('ADD:')) {
            keyNameAndOptListResult = keyNameAndOptListCopy
                .map(item => {
                    if (item === keyName) {
                        return null;
                    }
                    return item;
                })
                .filter(item => item);
        } else if (!keyName.startsWith('DELETE:') && !keyName.startsWith('ADD:')) {
            keyNameAndOptListResult = [...keyNameAndOptListCopy, `DELETE:${keyName}`];
        }

        const showFileListResult = showFileListCopy.filter(item => !(item.keyName === keyName));
        const uploadResourceResult = {
            categoryCode,
            keyNameAndOpt: keyNameAndOptListResult
        };
        // 回调
        setFileList(showFileListResult, uploadResourceResult);
    };

    /* eslint no-param-reassign: ["error", { "props": false }] */
    changeUpload = changeInfo => {
        const { setFileList, categoryCode, uploadResource, isSingle, maxNumber } = this.props;
        if (changeInfo.file.status === 'error') message.error(`${formatMessage({ id: 'sysCs.global.upload.failed' })}`);
        let fileListCopy = [...changeInfo.fileList].filter(item => item.status !== 'error');
        if (maxNumber) {
            if (fileListCopy.length > maxNumber) {
                message.error(
                    `${formatMessage({ id: 'sysCs.global.upload.most' })} ${maxNumber} ${formatMessage({
                        id: 'sysCs.global.upload.danwei'
                    })}`
                );
                return;
            }
        }

        const fileKeyNameList = fileListCopy
            .map(item => {
                // 单张图 需要对已存在的 resource 修改为 delete 等于做一次删除覆盖操作。
                if (isSingle) {
                    if (item.keyName !== changeInfo.file.keyName) {
                        if (item.keyName.startsWith('ADD:')) {
                            if (uploadResource) {
                                const { keyNameAndOpt: keyNameAndOptList } = uploadResource;
                                const keyNameFilter = keyNameAndOptList.filter(itemKey => itemKey !== item.keyName);
                                uploadResource.keyNameAndOpt = keyNameFilter;
                            }
                            item.keyName = item.keyName.substr(4);
                        } else if (
                            !item.keyName.startsWith('DELETE:') &&
                            !item.keyName.startsWith('ADD:') &&
                            !item.originFileObj
                        ) {
                            item.keyName = `DELETE:${item.keyName}`;
                        }
                    }
                }

                if (item.keyName.startsWith('ADD:') || item.keyName.startsWith('DELETE:')) {
                    return item.keyName;
                }
                return null;
            })
            .filter(item => item);

        // 单张图 修改显示文件列表
        if (isSingle) {
            fileListCopy = fileListCopy.filter(item => item.keyName === changeInfo.file.keyName);
        }

        let keyNameAndOptListCopy = [];
        if (uploadResource) {
            const { keyNameAndOpt: keyNameAndOptList } = uploadResource;
            keyNameAndOptListCopy = [...new Set([...keyNameAndOptList, ...fileKeyNameList])];
        } else {
            keyNameAndOptListCopy = [...new Set([...fileKeyNameList])];
        }
        const uploadResourceResult = {
            categoryCode,
            keyNameAndOpt: keyNameAndOptListCopy
        };

        // 单图 文件数组直接返回当前上传对象。
        // eslint-disable-next-line consistent-return
        return setFileList(fileListCopy, uploadResourceResult);
    };

    render() {
        const { children, dragAble, disabledUpload } = this.props;
        const { disabled } = this.state;
        if (dragAble) {
            return (
                <Upload.Dragger
                    {...this.props}
                    action={this.customUpload}
                    beforeUpload={this.checkUpload}
                    onRemove={this.removeUpload}
                    onChange={this.changeUpload}
                    disabled={disabled || disabledUpload}
                >
                    {children}
                </Upload.Dragger>
            );
        }
        return (
            <Upload
                {...this.props}
                action={this.customUpload}
                beforeUpload={this.checkUpload}
                onRemove={this.removeUpload}
                onChange={this.changeUpload}
                disabled={disabled || disabledUpload}
            >
                {children}
            </Upload>
        );
    }
}

export default UploadAws;
