import request from '@/utils/request';

export async function query(): Promise<any> {
    return request('/mock/api/users');
}

export async function queryNotices(): Promise<any> {
    return request('/mock/api/notices');
}

export async function queryCurrent(): Promise<any> {
    return request('/api/user/v1/account/getCurrent', {
        method: 'POST'
    })
        .then(response => {
            if (response && response.code === 10000) {
                const { data } = response;

                return {
                    ...response,
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

            return response;
        })
        .catch(error => {
            console.log('queryCurrent: ', error);
        });
}

export async function apiLogout() {
    return request('/api/user/v1/account/logout', {
        method: 'POST'
    });
}
