import * as React from 'react';
import { Upload, message, notification } from 'antd';
import validateRules from './validate';
// import { fileToObject } from 'antd/lib/upload/utils';
// import fetch from 'isomorphic-fetch';

export interface Props {
    /**
     * 同原组件Upload中的fileList.用于展示上传的文件
     */
    fileList: Array<any>;
    /**
     * 系统代号.如果商家为"Merchant".必传,后端接口需要.
     */
    sysCode: string;
    /**
     * 业务归属编号.如门店为 "Branch".目前可不传，后端接口需要.
     */
    businessCode: string;
    /**
     * 业务类目.如门店头图为 "BranchHead".
     * 营业资质中有两个分别为"acraFile" 及 "acraImage"
     * 必传,后端接口需要.
     */
    categoryCode: string;
    /**
     * uploadUrl:上传url接口,目前统一接口路径为 "/api/resource/producePutPreSignUrls"
     */
    uploadUrl: string;
    /**
     * 是否支持拖拽上传
     */
    draggable: boolean;
    /**
     * 回调函数,返回业务页面需要的保存跟展示的数据.
     * 返回参数为: showFileList及 uploadResource,
     * 分别为修改后的展示的文件列表及需要上传的资源文件.
     */
    onFileChange: (Array, Object) => void;

    /**
     * 校验规则配置
     */
    rules: Array<any>;

    /**
     * 回调校验错误
     */
    onError: (errors) => void;

    /**
     * 是否展示错误消息
     */
    showErrorMsg: boolean;

    onRef: (Array) => void;
}

const codeMessage: { [key: number]: string } = {
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

const checkStatus = (response: Response) => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const errorText = codeMessage[response.status] || response.statusText;
    notification.error({
        message: `请求错误 ${response.status}: ${response.url}`,
        description: errorText
    });
    const error: any = new Error(errorText);
    error.name = response.status;
    error.response = response;
    throw error;
};

/**
 * 原生ajax上传，用以显示上传进度
 * @param url 上传路径
 * @param opts 上传配置项
 * @param progressOptions 上传文件的进度配置
 */
// eslint-disable-next-line arrow-body-style
const fetch = (url: string, opts: any = {}, progressOptions: any = null) => {
    /* eslint-disable compat/compat */
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(opts.method || 'GET', url);
        Object.keys(opts.headers || {}).forEach(key => {
            xhr.setRequestHeader(key, opts.headers[key]);
        });
        xhr.onload = (e: any) => {
            const {
                target: { responseText, status }
            } = e;
            resolve({
                text: () => responseText,
                json: () => JSON.parse(responseText) || {},
                status
            });
        };
        xhr.onerror = reject;
        if (xhr.upload && progressOptions) {
            const { file, onProgress } = progressOptions;
            xhr.upload.onprogress = e => {
                const { loaded, total } = e;
                onProgress({ percent: Math.round((loaded / total) * 100) }, file);
            };
        }
        xhr.send(opts.body);
    });
};

const request = (url: string, option: any) => {
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
        .then((response: Response) => {
            // DELETE and 204 do not return data by default
            // using .json will report an error.
            if (newOptions.method === 'DELETE' || response.status === 204) {
                return response.text();
            }
            return response.json();
        });
};

// 上传至服务器
const uploadToServer = (params: { preUrl: string; file: File; onProgress: any }) => {
    const defaultOptions: any = { method: 'PUT', mode: 'cors' };
    defaultOptions.headers = {
        Accept: 'application/json'
    };
    defaultOptions.body = params.file;

    // 上传进度
    const progressOptions = {
        file: params.file,
        onProgress: params.onProgress
    };
    return fetch(params.preUrl, defaultOptions, progressOptions)
        .then(checkStatus)
        .then(response => response)
        .catch(e => e);
};

class UploadAwsPlus extends React.PureComponent<Props, any> {
    static defaultProps = {
        fileList: [],
        categoryCode: '',
        sysCode: '',
        businessCode: '',
        uploadUrl: '',
        draggable: false,
        rules: [],
        onFileChange: () => {},
        onError: () => {},
        showErrorMsg: true,
        triggerValidate: () => {},
        onRef: () => {}
    };

    // 获取文件的aws接口返回的key值
    // 允许多个同名文件上传
    keyMap = {};

    // 后端需要的resource资源
    uploadResource = null;

    componentDidMount = () => {
        const { onRef } = this.props;
        onRef(this);
    };

    validateFiles = async ({ file = null, fileList = [], showError = false, returnError = false }) => {
        const { rules, showErrorMsg, onError, fileList: existFileList } = this.props;

        const errors = await validateRules({
            rules,
            file,
            fileList,
            existFileList
        });

        if (returnError) {
            return errors;
        }

        console.log('errors', errors);

        if (errors.length) {
            onError(errors);
            if (showErrorMsg && showError) {
                message.error(errors.join(','));
            }
            return Promise.reject();
        }
        return true;
    };

    triggerValidate = callback => {
        const errors = this.validateFiles({ returnError: true });
        setTimeout(() => {
            if (typeof callback === 'function') callback(errors);
        }, 0);
    };

    // 上传,使用antd相应的回调
    // action,
    // data,
    // file,
    // filename,
    // headers,
    // onError,
    // onProgress,
    // onSuccess,
    // withCredentials

    customUpload = ({ file, onError, onSuccess, onProgress }) => {
        const { sysCode, businessCode, uploadUrl } = this.props;

        const params = {
            sysCode,
            businessCode,
            fileNames: [file.name],
            file
        };

        const uploadFn = async () => {
            // 获取预签名路径
            const response = await request(uploadUrl, {
                method: 'POST',
                body: params
            });

            // 返回内容
            if (response.data && response.data.length > 0) {
                const { preUrl, keyName } = response.data[0];
                const uploadParams = { preUrl, file, onProgress };
                // 上传至服务器
                await uploadToServer(uploadParams);

                // 调用onSuccess出发
                this.keyMap[file.name] = keyName;
                onSuccess(response, file);
            } else {
                onError(new Error('sign error'));
            }
        };

        try {
            uploadFn();
        } catch (e) {
            onError(e);
        }
    };

    // 上传新文件的校验
    // 回调中的fileList和props中的fileList不同
    beforeUpload = (file, fileList) => this.validateFiles({ file, fileList, showError: true });

    // 删除文件
    removeUpload = (file: any) => {
        const { uploadResource } = this;
        const { fileList, onFileChange, categoryCode } = this.props;
        const keyName = file.keyName || this.keyMap[file.name];
        // 初始化
        const uploadResourceResult = uploadResource || {
            categoryCode,
            keyNameAndOpt: []
        };

        const { keyNameAndOpt } = uploadResourceResult;
        const existIndex = keyNameAndOpt.findIndex(item => item === `ADD:${keyName}`);
        if (existIndex > -1) {
            // 删除新增
            keyNameAndOpt.splice(existIndex, 1);
        } else {
            // 删除已有
            keyNameAndOpt.push(`DELETE:${keyName}`);
        }
        onFileChange(fileList, uploadResourceResult);
        return true;
    };

    changeUpload = ({ file, fileList }) => {
        if (!file.status) return;

        if (file.status === 'done' || file.status === 'removed') {
            setTimeout(() => {
                this.validateFiles({ showError: true });
            }, 0);
        }

        // before upload也会触发，但是没有status
        if (file.status === 'done' || file.status === 'removed' || file.status === 'uploading') {
            const { uploadResource } = this;
            const { categoryCode, onFileChange } = this.props;

            const uploadResourceResult = uploadResource || {
                categoryCode,
                keyNameAndOpt: []
            };
            const { keyNameAndOpt } = uploadResourceResult;
            keyNameAndOpt.push(`ADD:${this.keyMap[file.name]}`);
            onFileChange([...fileList], uploadResourceResult);
            // eslint-disable-next-line no-unused-expressions
            this.props.onChange && this.props.onChange([...fileList]);
        }
    };

    render() {
        const { children, draggable } = this.props;

        const customProps = {
            customRequest: this.customUpload,
            onRemove: this.removeUpload,
            onChange: this.changeUpload,
            beforeUpload: this.beforeUpload
        };

        let uploadContent;
        if (draggable) {
            uploadContent = (
                <Upload.Dragger {...this.props} {...customProps}>
                    {children}
                </Upload.Dragger>
            );
        } else {
            uploadContent = (
                <Upload {...this.props} {...customProps}>
                    {children}
                </Upload>
            );
        }

        return uploadContent;
    }
}

export default UploadAwsPlus;
