import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';

import { NoticeIconData } from '@/components/NoticeIcon';
import { queryNotices } from '@/services/user';
import { getOrderExceptionNum } from '@/services/order';
import { ConnectState } from './connect.d';

export interface NoticeItem extends NoticeIconData {
    id: string;
    type: string;
    status: string;
}

export interface tabItem {
    key: string;
    title: string;
    content: any;
}

export interface GlobalModelState {
    collapsed: boolean;
    notices: NoticeItem[];
    exceptionNumber: Number;
    tabList: tabItem[];
}

export interface GlobalModelType {
    namespace: 'global';
    state: GlobalModelState;
    effects: {
        fetchNotices: Effect;
        clearNotices: Effect;
        changeNoticeReadState: Effect;
        fetchNumber: Effect;
    };
    reducers: {
        saveTabList: Reducer<GlobalModelState>;
    };
    subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
    namespace: 'global',

    state: {
        collapsed: false,
        notices: [],
        tabList: [],
        exceptionNumber: 0
    },

    effects: {
        *fetchNotices(_, { call, put, select }) {
            const data = yield call(queryNotices);
            yield put({
                type: 'saveNotices',
                payload: data
            });
            const unreadCount: number = yield select(
                (state: ConnectState) => state.global.notices.filter(item => !item.read).length
            );
            yield put({
                type: 'user/changeNotifyCount',
                payload: {
                    totalCount: data.length,
                    unreadCount
                }
            });
        },
        *clearNotices({ payload }, { put, select }) {
            yield put({
                type: 'saveClearedNotices',
                payload
            });
            const count: number = yield select((state: ConnectState) => state.global.notices.length);
            const unreadCount: number = yield select(
                (state: ConnectState) => state.global.notices.filter(item => !item.read).length
            );
            yield put({
                type: 'user/changeNotifyCount',
                payload: {
                    totalCount: count,
                    unreadCount
                }
            });
        },
        *changeNoticeReadState({ payload }, { put, select }) {
            const notices: NoticeItem[] = yield select((state: ConnectState) =>
                state.global.notices.map(item => {
                    const notice = { ...item };
                    if (notice.id === payload) {
                        notice.read = true;
                    }
                    return notice;
                })
            );

            yield put({
                type: 'saveNotices',
                payload: notices
            });

            yield put({
                type: 'user/changeNotifyCount',
                payload: {
                    totalCount: notices.length,
                    unreadCount: notices.filter(item => !item.read).length
                }
            });
        },
        *fetchNumber(_, { call, put }) {
            const res = yield call(getOrderExceptionNum);
            if (res && res.code === 10000) {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const num = (res.data[0] && res.data[0].count) || 0;
                    yield put({
                        type: 'saveNumber',
                        payload: num
                    });
                }
            }
        }
    },

    reducers: {
        saveTabList(state, { payload }): GlobalModelState {
            return {
                ...state,
                tabList: payload
            };
        }
    },

    subscriptions: {
        setup({ history }): void {
            // Subscribe history(url) change, trigger `load` action if pathname is `/`
            history.listen(({ pathname, search }): void => {
                if (typeof window.ga !== 'undefined') {
                    window.ga('send', 'pageview', pathname + search);
                }
            });
        }
    }
};

export default GlobalModel;
