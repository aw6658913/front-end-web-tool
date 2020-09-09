import request from 'umi-request';
import { FormDataType } from './index';

export async function getFakeCaptcha(mobile: string) {
    return request(`/mock/api/login/captcha?mobile=${mobile}`);
}

export async function apiAccountLogin(params: FormDataType) {
    return request('/api/user/v1/account/login', {
        method: 'POST',
        data: {
            loginName: params.userName,
            organizeType: '4',
            password: params.password
        }
    })
        .then(response => {
            const newResponse = {
                ...response,
                loginType: params.loginType
            };
            if (response && response.code === 10000) {
                const { data } = newResponse;

                return {
                    ...newResponse,
                    data: {
                        name: data.loginName, // loginName
                        userId: data.userCode, // userCode
                        organizeType: data.organizeType, // 账号类型
                        pwdUpdateTime: data.pwdUpdateTime, // 密码修改时间
                        thirdOpenId: data.thirdOpenId, // 第三方登录id
                        thirdOpenType: data.thirdOpenType // 第三方登录类型
                    }
                };
            }

            return newResponse;
        })
        .catch(e => {
            console.log('e :', e);
        });
}
