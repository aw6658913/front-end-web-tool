import * as React from 'react';
import { Upload, message, notification, Modal } from 'antd';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import fetch from 'isomorphic-fetch';
import { formatMessage } from 'umi-plugin-react/locale';

let errorState = true;
// const codeMessage = {
//     200: '服务器成功返回请求的数据。',
//     201: '新建或修改数据成功。',
//     202: '一个请求已经进入后台排队（异步任务）。',
//     204: '删除数据成功。',
//     400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//     401: '用户没有权限（令牌、用户名、密码错误）。',
//     403: '用户得到授权，但是访问是被禁止的。',
//     404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//     406: '请求的格式不可得。',
//     410: '请求的资源被永久删除，且不会再得到的。',
//     422: '当创建一个对象时，发生一个验证错误。',
//     500: '服务器发生错误，请检查服务器。',
//     502: '网关错误。',
//     503: '服务不可用，服务器暂时过载或维护。',
//     504: '网关超时。'
// };

const checkStatus = response => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const errortext = formatMessage({ id: `component.upload.response.code${response.status}` }) || response.statusText;
    notification.error({
        message: `${formatMessage({ id: 'component.upload.request.err' })} ${response.status}`,
        description: errortext
    });
    // const error = new Error(errortext);
    // error.name = response.status;
    // error.response = response;
    // throw error;
    return Promise.reject();
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
// 校验图片宽高
// function checkImageWH(file, width, height) {
//     return new Promise((resolve, reject) => {
//         const filereader = new FileReader();
//         const image = new Image();
//         filereader.readAsDataURL(file);
//         filereader.onload = () => {
//             image.src = filereader.result;
//             image.onload = () => {
//                 console.log(image.naturalWidth, image.naturalHeight);
//                 if (image.naturalWidth === Number(width) && image.naturalHeight === Number(height)) {
//                     resolve();
//                 } else {
//                     message.error(`${formatMessage({ id: 'component.upload.checkImageSize' })} ${width}*${height}`);
//                     reject();
//                 }
//                 image.onerror = reject;
//             };
//         };
//     });
// }

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
        .catch(e => {
            errorState = false;
            return e;
        });
}

function dataURItoBlob(dataURI, name, type) {
    const arr = dataURI.split(',');
    // const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let n = bstr.length - 1; n >= 0; n -= 1) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], name, { type });
}

class UploadAws extends React.PureComponent {
    static defaultProps = {
        fileList: [],
        categoryCode: '',
        checkFileType: '',
        checkFileSize: 0,
        sysCode: '',
        businessCode: '',
        uploadUrl: '',
        dragAble: false,
        isSingle: false,
        isWait: true,
        uploadResource: null,
        checkFileTypeMsg: null,
        checkFileSizeMsg: null,
        setFileList: () => {},
        srcCropper: ''
    };

    state = {
        // loading: true,
        visible: false,
        // w: 1024,
        // h: 1024,
        srcCropper: '',
        selectImgName: '',
        imgType: '',
        imgUid: '',
        base64Img: '',
        confirmLoading: false
    };

    cropper = React.createRef();

    // 弹层取消
    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    // 校验上传文件类型
    checkUpload = (file, fileList) => {
        const {
            checkFileType = '',
            checkFileSize = 0,
            checkFileTypeMsg = null,
            checkFileSizeMsg = null,
            // checkImgSize = null,
            isCropper
        } = this.props;

        if (checkFileType.length > 0) {
            const fileType = file.name.substring(file.name.lastIndexOf('.') + 1);
            if (!checkFileType.toLocaleLowerCase().includes(fileType.toLocaleLowerCase())) {
                if (checkFileTypeMsg) {
                    message.error(checkFileTypeMsg);
                } else {
                    message.error(`${formatMessage({ id: 'component.upload.checkTypeMessage' })} ${checkFileType}`);
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
                    message.error(
                        `${formatMessage({ id: 'component.upload.checkImageFileSize' })} ${checkFileSize}MB!`
                    );
                }

                fileList.splice(fileList.indexOf(file), 1);
                return false;
            }
        }

        // if (checkImgSize) {
        //     const [width, height] = checkImgSize.split(',');
        //     return checkImageWH(file, width, height);
        // }

        if (isCropper && errorState) {
            // 当打开同一张图片的时候清除上一次的缓存
            // const { w, h } = this.state;
            // console.log(this.cropper, 'cropper');
            if (this.cropper) {
                console.log(this.cropper, 'cropper');
                // this.cropper.reset();
                // this.cropper.setData({
                //     width: w,
                //     height: h
                // });
            }
            const reader = new FileReader();
            const image = new Image();
            // let imgHeight;
            // let imgWidth;
            // 因为读取文件需要时间,所以要在回调函数中使用读取的结果
            reader.readAsDataURL(file);
            reader.onload = e => {
                image.src = reader.result;
                image.onload = () => {
                    // imgHeight = image.naturalHeight;
                    // imgWidth = image.naturalWidth;
                    this.setState({
                        srcCropper: e.target.result, // cropper的图片路径
                        selectImgName: file.name, // 文件名称
                        imgType: file.type, // 文件类型
                        imgUid: file.uid
                    });
                    // if (this.cropper) {
                    //     this.cropper.replace(e.target.result);
                    // }
                    this.setState({ visible: true });
                    // if (imgHeight > h || imgWidth > w) {
                    //     message.error(formatMessage({ id: 'component.upload.check' }));
                    // } else {

                    // }
                };
            };

            return false;
        }
        return true;
    };

    // 上传
    customUpload = async file => {
        const { sysCode, businessCode, uploadUrl, isWait } = this.props;
        const params = {
            sysCode,
            businessCode,
            fileNames: [file.name],
            file
        };
        // 设置 禁用
        // this.setState({ loading: true });
        // 获取预签名路径
        const response = await request(uploadUrl, {
            method: 'POST',
            body: params
        });
        // 返回内容
        if (response.data && response.data.length > 0) {
            const { keyName, preUrl, fileUrl } = response.data[0];
            const uploadParams = { preUrl, file };
            // 上传至服务器

            if (isWait) {
                await uploadToServer(uploadParams);
            } else {
                uploadToServer(uploadParams);
            }
            // 解除 禁用
            // this.setState({ loading: false });

            const uploadObj = {
                keyName: `ADD:${keyName}`,
                url: fileUrl
            };
            const fileChange = { ...file, ...uploadObj };
            Object.assign(file, fileChange);
        }
        return '';
    };

    // 上传
    cropperUpload = async () => {
        const { sysCode, businessCode, uploadUrl, isWait, isCropper } = this.props;
        const { selectImgName, imgType, imgUid } = this.state;
        const baseDataUrl = this.cropper.getCroppedCanvas().toDataURL();
        const Filed = dataURItoBlob(baseDataUrl, selectImgName, imgType, imgUid) || '';
        this.setState({ base64Img: baseDataUrl, confirmLoading: true });
        const params = {
            sysCode,
            businessCode,
            fileNames: [selectImgName],
            file: {
                uid: imgUid
            }
        };
        // 设置 禁用
        // this.setState({ loading: true });
        // 获取预签名路径
        const response = await request(uploadUrl, {
            method: 'POST',
            body: params
        });
        // 返回内容
        if (response.data && response.data.length > 0) {
            this.setState({ confirmLoading: false });
            const { keyName, preUrl, fileUrl } = response.data[0];
            const uploadParams = { preUrl, file: Filed };
            const uploadObj = {
                keyName: `ADD:${keyName}`,
                url: fileUrl
            };
            const fileChange = { ...Filed, ...uploadObj };
            Object.assign(Filed, fileChange);
            // 上传至服务器
            if (isWait) {
                await uploadToServer(uploadParams);
            } else {
                uploadToServer(uploadParams);
            }
            // 解除 禁用
            // this.setState({ loading: false });
            if (isCropper) {
                this.changeUpload({
                    file: { ...uploadObj, url: null, originFileObj: Filed, ...Filed, uid: imgUid },
                    fileList: [{ keyName: uploadObj.keyName, uid: imgUid, originFileObj: Filed, ...Filed }]
                });
            }
        } else {
            this.setState({ confirmLoading: true });
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
        // 修复删除逻辑bug，多次提交时，没有把上一条ADD删除，导致新增了多条
        const currentFile = keyName.replace('ADD:', '');
        if (uploadResourceResult.keyNameAndOpt instanceof Array && uploadResourceResult.keyNameAndOpt.length) {
            uploadResourceResult.keyNameAndOpt.forEach(elem => {
                if (elem.indexOf(currentFile) === -1) uploadResourceResult.keyNameAndOpt.push(`DELETE:${currentFile}`);
            });
        }
        // 回调
        setFileList(showFileListResult, uploadResourceResult);
    };

    /* eslint no-param-reassign: ["error", { "props": false }] */
    changeUpload = changeInfo => {
        const { base64Img } = this.state;
        const { setFileList, categoryCode, uploadResource, isSingle, isCropper } = this.props;
        let info;
        if (isCropper) {
            info = changeInfo.fileList;
            if (info && info.length) {
                info[0].thumbUrl = base64Img;
            }
        }
        let fileListCopy = isCropper ? [...info] : [...changeInfo.fileList];
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
        setFileList(fileListCopy, uploadResourceResult);
        this.setState({ visible: false });
    };

    render() {
        const { children, isCropper, fileList, aspectRatio, disabled, viewMode } = this.props;
        const { confirmLoading } = this.state;
        if (isCropper) {
            return (
                <React.Fragment>
                    <Upload
                        name="files"
                        {...this.props}
                        beforeUpload={this.checkUpload}
                        listType="picture-card"
                        fileList={fileList}
                        disabled={disabled}
                        onRemove={this.removeUpload}
                    >
                        {children}
                    </Upload>
                    <Modal
                        width={720}
                        title={formatMessage({ id: 'component.upload.title' })}
                        visible={this.state.visible}
                        onOk={this.cropperUpload}
                        onCancel={this.handleCancel}
                        customRequest={() => {}}
                        confirmLoading={confirmLoading}
                    >
                        <div style={{ height: 600 }}>
                            <Cropper
                                src={this.state.srcCropper} // 图片路径，即是base64的值，在Upload上传的时候获取到的
                                pattern={1} // 模式分为三种，1为只能上传一张图片，2为上传多张图片
                                ref={val => {
                                    this.cropper = val;
                                }}
                                scaleX={1}
                                scaleY={1}
                                viewMode={viewMode} // 定义cropper的视图模式
                                zoomable // 是否允许放大图像
                                movable
                                guides // 显示在裁剪框上方的虚线
                                rotatable={false} // 是否旋转
                                aspectRatio={aspectRatio}
                                style={{ height: '100%', width: '100%' }}
                                cropBoxResizable={false} // 是否可以拖拽
                                cropBoxMovable // 是否可以移动裁剪框
                                dragMode="move"
                                center
                            />
                        </div>
                    </Modal>
                </React.Fragment>
            );
        }
        return (
            <Upload
                {...this.props}
                action={this.customUpload}
                beforeUpload={this.checkUpload}
                onRemove={this.removeUpload}
                disabled={disabled}
                onChange={this.changeUpload}
            >
                {children}
            </Upload>
        );
    }
}
export default UploadAws;
