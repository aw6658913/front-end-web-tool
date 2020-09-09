import { Effect } from 'dva';
import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';

import { queryCurrent, apiLogout } from '@/services/user';
import { getLoginStates, clearLoginStates } from '@/utils/cacheLogin';

export interface CurrentUser {
    name?: string; // loginName
    userId?: string; // userCode
    organizeType?: number; // 账号类型
    pwdUpdateTime?: string; // 密码修改时间
    thirdOpenId?: string; // 第三方登录id
    thirdOpenType?: string; // 第三方登录类型

    // -------------------------

    avatar?: string;
    title?: string;
    group?: string;
    signature?: string;
    tags?: {
        key: string;
        label: string;
    }[];
    unreadCount?: number; // 未读消息数
}

export interface UserModelState {
    currentUser?: CurrentUser;
}

export interface UserModelType {
    namespace: 'user';
    state: UserModelState;
    effects: {
        fetchCurrent: Effect;
        fetchCurrentFromCookie: Effect;
        logout: Effect;
    };
    reducers: {
        saveCurrentUser: Reducer<UserModelState>;
        clearCurrentUser: Reducer<UserModelState>;
        changeNotifyCount: Reducer<UserModelState>;
    };
}

const UserModel: UserModelType = {
    namespace: 'user',

    state: {
        currentUser: {}
    },

    effects: {
        *fetchCurrent({ callback }, { call, put }) {
            const response = yield call(queryCurrent);
            if (response && response.code === 10000) {
                yield put({
                    type: 'saveCurrentUser',
                    payload: response.data
                });
            } else {
                clearLoginStates();

                yield put({
                    type: 'saveCurrentUser',
                    payload: {}
                });
            }

            if (callback) {
                callback();
            }
        },
        *fetchCurrentFromCookie({ callback }, { put }) {
            const user = getLoginStates('user');

            yield put({
                type: 'saveCurrentUser',
                payload: user
            });

            if (callback) {
                callback();
            }
        },
        *logout(_, { call, put }) {
            const response = yield call(apiLogout);
            if (response && response.code === 10000) {
                clearLoginStates();
                // redirect
                yield put(
                    routerRedux.replace({
                        pathname: '/user/login',
                        search: stringify({
                            redirect: window.location.href
                        })
                    })
                );
            } else {
                // console.log('登出失败！');
            }
        }
    },

    reducers: {
        saveCurrentUser(state, action) {
            return {
                ...state,
                currentUser: action.payload || {}
            };
        },
        clearCurrentUser(state) {
            return {
                ...state,
                currentUser: {}
            };
        },
        changeNotifyCount(
            state = {
                currentUser: {}
            },
            action
        ) {
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    notifyCount: action.payload.totalCount,
                    unreadCount: action.payload.unreadCount
                }
            };
        }
    }
};

export default UserModel;
