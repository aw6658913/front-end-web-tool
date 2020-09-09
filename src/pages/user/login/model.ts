import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import { apiAccountLogin, getFakeCaptcha } from './service';
import { getPageQuery } from './utils/utils';
import { cacheLoginStates } from '@/utils/cacheLogin';
import { isProduction } from '@/utils/utils';

export interface StateType {
    status?: 'ok' | 'error';
    message?: string; // login error message
    loginType?: string; // account | mobile
    // currentAuthority?: 'user' | 'guest' | 'admin';
}

export type Effect = (
    action: AnyAction,
    effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T }
) => void;

export interface ModelType {
    namespace: string;
    state: StateType;
    effects: {
        login: Effect;
        getCaptcha: Effect;
    };
    reducers: {
        changeLoginStatus: Reducer<StateType>;
    };
}

const Model: ModelType = {
    namespace: 'userAndlogin',

    state: {
        status: undefined
    },

    effects: {
        *login({ payload, failTimesCounter }, { call, put }) {
            const response = yield call(apiAccountLogin, payload);
            const status = response && response.code === 10000 ? 'ok' : 'error';
            if (response) {
                failTimesCounter(status);
                yield put({
                    type: 'changeLoginStatus',
                    payload: {
                        status,
                        loginType: response.loginType,
                        message: status === 'ok' ? '' : response.msg
                    }
                });
            }
            // Login successfully
            if (response && status === 'ok') {
                yield put({
                    type: 'saveCurrentUser',
                    payload: response.data
                });
                cacheLoginStates({
                    user: response.data
                });

                const urlParams = new URL(window.location.href);
                const params = getPageQuery();
                let { redirect } = params as { redirect: string };
                if (redirect) {
                    const redirectUrlParams = new URL(redirect);
                    if (redirectUrlParams.origin === urlParams.origin) {
                        redirect = redirect.substr(urlParams.origin.length);
                        if (redirect.match(/^\/.*#/)) {
                            redirect = redirect.substr(redirect.indexOf('#') + 1);
                        }
                    } else {
                        window.location.href = redirect;
                        return;
                    }
                }
                const re = new RegExp(`^.*${isProduction() ? PATH_PREFIX : ''}`.replace(/\//g, '\\/'));
                yield put(routerRedux.replace(redirect ? `/${redirect.replace(re, '')}` : '/'));
            }
        },

        *getCaptcha({ payload }, { call }) {
            yield call(getFakeCaptcha, payload);
        }
    },

    reducers: {
        changeLoginStatus(state, { payload }) {
            // setAuthority(payload.currentAuthority);
            const { status, loginType, message } = payload;
            return {
                ...state,
                status,
                loginType,
                message
            };
        }
    }
};

export default Model;
