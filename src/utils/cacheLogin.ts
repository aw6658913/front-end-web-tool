import Cookies from 'js-cookie';
import { encrypt, decrypt } from './encryption';

/**
 * token: 用于标记登录状态，http请求头必须携带Authorization，将token设置为Authorization的值
 * user: 用户信息，比如用户名、用户类型
 */
interface LoginStates {
    token?: string | Object;
    user?: Object;
}

const cookieNameOfAutoLoginAccount: string = encrypt('autoLoginAccount');
const cookieNameOfToken: string = encrypt('token');
const cookieNameOfUser: string = encrypt('user');

/**
 * 缓存登录状态的数据
 * @param data<LoginStates>
 */
export const cacheLoginStates = (data: LoginStates): void => {
    const { token, user } = data;

    if (token) {
        Cookies.set(cookieNameOfToken, token, { expires: 3 });
    }
    if (user) {
        Cookies.set(cookieNameOfUser, encrypt(user), { expires: 3 });
    }
    if (typeof data[cookieNameOfAutoLoginAccount] !== 'undefined') {
        Cookies.set(cookieNameOfAutoLoginAccount, encrypt(data[cookieNameOfAutoLoginAccount]), { expires: 3 });
    }
};

/**
 * 清空登录状态的缓存数据
 */
export const clearLoginStates = (key?: string): void => {
    if (key) {
        Cookies.remove(cookieNameOfAutoLoginAccount);
    } else {
        Cookies.remove(cookieNameOfToken);
        Cookies.remove(cookieNameOfUser);
        const { _store: store } = window.g_app;
        store.dispatch({
            type: 'user/clearCurrentUser'
        });
        store.dispatch({
            type: 'permission/clear'
        });
    }
};

/**
 * 获取登录状态数据
 */
export const getLoginStates = (key: string): string | Object => {
    const value = Cookies.get(['user', 'token'].includes(key) ? encrypt(key) : key);

    if (key === cookieNameOfUser || key === cookieNameOfAutoLoginAccount) {
        return decrypt(value);
    }

    return value || '';
};
