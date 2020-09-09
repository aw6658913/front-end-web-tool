/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 * 本文件国际化涉及较少且特殊情况，请勿效仿！
 */
import { extend, RequestOptionsInit } from 'umi-request';
import router from 'umi/router';
import { notification } from 'antd';
import { stringify } from 'querystring';
import { getLocale } from 'umi-plugin-react/locale';
import { encrypt, decrypt, getSign } from '@/utils/encryption';
import { isDevelopment, generateRedirectUrl } from '@/utils/utils';
import { cacheLoginStates, getLoginStates, clearLoginStates } from '@/utils/cacheLogin';
import whichGateway from './gateways';

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误或登录超时）。',
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

const codeMessageEn = {
    200: 'The server successfully returned the requested data.',
    201: 'New or modified data successfully.',
    202: 'A request has entered the background queue (asynchronous task).',
    204: 'Delete data successfully.',
    400: 'The request was issued with an error, and the server did not create or modify the data.',
    401: 'The user does not have permissions (token, username, password error, or login timeout).',
    403: 'The user is authorized, but access is blocked.',
    404: 'The request is made for a nonexistent record and the server is not operating.',
    406: 'The requested format is not available.',
    410: 'The requested resource is permanently deleted and will not be returned.',
    422: 'When an object is created, a validation error occurs.',
    500: 'Server error. Please check server.',
    502: 'Bad gateway.',
    503: 'Service unavailable, server temporarily overloaded or maintained.',
    504: 'Gateway Time out.'
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
    const { response } = error;
    if (response && response.status) {
        let errorText = codeMessageEn[response.status] || response.statusText;
        let errorTitle = 'Request Error';
        if (getLocale() === 'zh-CN') {
            errorText = codeMessage[response.status] || response.statusText;
            errorTitle = '请求错误';
        }
        const { status } = response;

        if (!/account\/getCurrent$/.test(response.url)) {
            notification.error({
                message: `${errorTitle} ${status}`,
                description: errorText
            });
        }
    } else if (!response) {
        let errorDescription = 'An exception has occurred on your network and you cannot connect to the server';
        let errorMessage = 'Network anomaly';
        if (getLocale() === 'zh-CN') {
            errorDescription = '您的网络发生异常，无法连接服务器';
            errorMessage = '网络异常';
        }
        notification.error({
            description: errorDescription,
            message: errorMessage
        });
    }
    return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
    errorHandler, // 默认错误处理
    credentials: 'include' // 默认请求是否带上cookie
});

/**
 * pureJSONData：用于决定data是否需要经过处理，默认是false，如果只是希望传递原始数据，可以将其设置为true
 *    当pureJSONData为false，将会创建新的数据结构：{
 *        params: '',
 *        timeStamp: ''
 *    } 或者 {
 *        params: '',
 *        sign: '',
 *        timeStamp: ''
 *    }
 *    反之将保持原有数据格式进行传递
 * encrypted: 用于决定接口的数据传输是否加密，默认是true，如果有些接口不需要加密，可以将encrypted设置为false，它只有当pureJSONData为false时才有用
 *    当encrypted设置为true时，将会创建新的数据结构：{
 *        params: '',
 *        sign: '',
 *        timeStamp: ''
 *    }
 */
export interface NewRequestOptionsInit extends RequestOptionsInit {
    isMock?: Boolean; // 是否是mock数据
    encrypted?: Boolean;
    pureJSONData?: Boolean; // 使用原始纯JSON进行数据传递，专门针对options传递的data属性
}
/**
 * request拦截器
 * 处理：请求头携带token
 * 处理：请求加密数据，默认都加密，
 */
request.interceptors.request.use((url, options: NewRequestOptionsInit) => {
    const timeStamp = new Date().getTime();
    const { pureJSONData = false, encrypted = true, data = {}, headers, method, params: optParams } = options;
    const params = encrypt(data);

    const isMock = /^\/mock\//.test(url);

    // 根据encrypted判断是否加密
    // 根据pureJSONData判断是否采用原始数据格式
    let newData;
    if (pureJSONData || isMock) {
        newData = data;
    } else if (encrypted) {
        newData = {
            params,
            sign: getSign(timeStamp, params),
            timeStamp
        };
    } else {
        newData = {
            params: JSON.stringify(data),
            timeStamp
        };
    }
    let lang = 'en-US,en;q=0.8';
    if (getLocale() === 'zh-CN') {
        lang = 'zh-CN,zh;q=0.8,en;q=0.1';
    }
    // 在请求头中携带token
    const newHeaders = {
        ...headers,
        Authorization: getLoginStates('token'),
        'Accept-Language': lang
    };

    return {
        url: whichGateway(url),
        options: <RequestOptionsInit>{
            ...options,
            params: method === 'get' ? { ...optParams, _: timeStamp } : optParams,
            data: newData,
            interceptors: true,
            headers: newHeaders,
            encrypted,
            isMock,
            pureJSONData,
            getResponse: true,
            timeout: 1000 * 60
        }
    };
});

request.interceptors.response.use(response => {
    // 处理 响应状态 401，跳转到登录界面
    if (response.status === 401) {
        clearLoginStates();

        const url = generateRedirectUrl();

        if (!/\/user\/login/.test(url)) {
            router.push({
                pathname: '/user/login',
                search: stringify({
                    redirect: url
                })
            });
        }
    }

    return response;
});

/**
 * response拦截器
 * 处理：数据解密
 * 处理：token更新
 */
request.interceptors.response.use(async (response, options: NewRequestOptionsInit) => {
    const { isMock = false, pureJSONData = false, encrypted = true, getResponse } = options;
    if (
        response &&
        (response.status === 200 || response.status === 201 || response.status === 202 || response.status === 204)
    ) {
        const result = await response.clone().json();

        // 处理数据解密
        const newResult = {
            ...result,
            data: !pureJSONData && !isMock && encrypted ? decrypt(result.data) : result.data
        };

        // 处理token更新
        const token = response.headers.get('Authorization');
        if (token && token !== getLoginStates('token')) {
            cacheLoginStates({
                token
            });
        }

        // 返回响应携带
        if (getResponse) {
            newResult.response = response;
        }

        if (isDevelopment()) {
            console.log('%c ----HTTP Request Log:', 'background:#802a00;color:#fff;', `url: ${response.url}`);
            console.log('%c request: ', 'background:#43ad7f;color:#fff;', options);
            console.log('%c data: ', 'background:#33AECC;color:#fff;', decrypt(options.data.params), {
                data: JSON.stringify(decrypt(options.data.params))
            });
            console.log('%c response: ', 'background:#43ad7f;color:#fff;', newResult);
            console.log('%c data: ', 'background:#2B2BD5;color:#fff;', newResult.data, {
                data: JSON.stringify(newResult.data)
            });
        }

        return Promise.resolve(newResult);
    }
    return response;
});

export default request;
