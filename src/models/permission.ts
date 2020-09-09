import { Effect, Subscription } from 'dva';
import { Reducer } from 'redux';

import { authorizedRoutesAllCode, authorizedOperations } from '@/services/permission';
import { setAuthority } from '@/components/Authorized/utils/authority';
import { getRouteAuthority } from '@/components/Authorized';
import { Route, ConnectState } from '@/models/connect';

/**
 * system 第一级菜单 按照项目划分
 * menu 第二级菜单 项目的实际菜单
 * button 操作级别的按钮
 */
export enum PermissionItemType {
    system,
    menu,
    button
}

export interface PermissionItem {
    id: number; // ID编码
    code: string; // 唯一标识，用于查询models/permission.ts: authorizedOperations(code)的参数
    parentCode: string; // 父级权限编码，与父级的code是对应的(暂时也没用)
    // permission: string; // 权限编码，是唯一的(这个字段等同于code字段，区别在于code采用大驼峰形式，permission采用:分割的小写形式)
    name: string; // 名称，某个菜单的名称或者是某个按钮的名称，如：个人管理(暂时没有除了用作备注辅助开发人员理解对应的意思外，没其他用)
    url: string; // 路由(后端返回的暂时没用，由前端控制)
    type: PermissionItemType; // 权限的类型
    // enable: boolean; // 是否可用，有权限但是这个值是false的时候，是disabled状态(暂时没有用)
    sort: number; // 排序编码，数值越小越靠前 这个只针对与type不是PermissionItemType.button才有用
    loadedOperations: boolean; // 是否已经加载了子权限
}

interface ObjectType {
    [key: string]: any;
}
export interface PermissionModelState {
    ready?: boolean; // 是否从服务端获取到了权限数据
    routesReady?: boolean; // 是否从服务端获取到了菜单权限数据
    operationsReady?: boolean; // 是否从服务器端获取到了操作性的权限数据
    routes?: Array<PermissionItem>; // 路由的权限表，对应着页面的左侧菜单
    operations?: Array<PermissionItem>; // 操作性的权限表，对应着页面的右侧各种操作
    mapping?: ObjectType; // 所有权限表的字典
    mappingOfRoutes?: ObjectType; // 所有的路由与权限表的匹配字典
}

export interface PermissionModelType {
    namespace: 'permission';
    state: PermissionModelState;
    effects: {
        fetchRoutes: Effect;
        fetchOperations: Effect;
        updateOperations: Effect;
    };
    reducers: {
        saveRoutes: Reducer<PermissionModelState>;
        saveOperations: Reducer<PermissionModelState>;
        completeReady: Reducer<PermissionModelState>;
        generateMappingOfRoutes: Reducer<PermissionModelState>;
        flagLoadedOperations: Reducer<PermissionModelState>;
        clear: Reducer<PermissionModelState>;
    };
    subscriptions: {
        historyChanged: Subscription;
    };
}

function filterNewItems(
    list: Array<PermissionItem> = [],
    mapping: any,
    customConditions: Function = () => true
): Array<PermissionItem> {
    return list.filter(item => typeof mapping[item.code] === 'undefined' && customConditions(item));
}
function generateNewMapping(list: Array<PermissionItem> = []): ObjectType {
    const newMapping = {};
    list.forEach(item => {
        newMapping[item.code] = item;
    });

    return {
        ...newMapping
    };
}

/**
 * 根据路由配置列表生成所有的路由
 * @param routeData
 */
export function generateAllRoutes(routeData: Route[]): string[] {
    const allRoutes: string[] = [];

    const walk = (list: Route[]): void => {
        list.forEach((item: Route) => {
            if (!item.redirect && item.path) {
                allRoutes.push(item.path);

                if (item.routes) {
                    walk(item.routes);
                }
            }
        });
    };

    walk(routeData);

    return [...new Set(allRoutes)];
}

const PermissionModel: PermissionModelType = {
    namespace: 'permission',

    state: {
        ready: false,
        routesReady: false,
        operationsReady: false,
        routes: [],
        operations: [],
        mapping: {},
        mappingOfRoutes: {}
    },

    effects: {
        *fetchRoutes({ payload, callback }, { call, put, select }) {
            const { routeData = [], pathname = '' } = payload;
            yield put({
                type: 'generateMappingOfRoutes',
                payload: {
                    routeData
                }
            });
            const response = yield call(authorizedRoutesAllCode);

            if (response && response.code === 10000) {
                yield put({
                    type: 'saveRoutes',
                    payload: response.data
                });
                yield put({
                    type: 'completeReady',
                    payload: 'routesReady'
                });
                yield put({
                    type: 'saveOperations',
                    payload: response.data
                });

                const mappingOfRoutes = yield select(({ permission }: ConnectState) => permission.mappingOfRoutes);

                yield put({
                    type: 'fetchOperations',
                    payload: {
                        code: mappingOfRoutes[pathname]
                    }
                });
                if (callback && typeof callback === 'function') callback(mappingOfRoutes); // 讲匹配之后的路由数组返回出去做判断用
            } else {
                yield put({
                    type: 'completeReady',
                    payload: 'routesReady'
                });
                yield put({
                    type: 'completeReady',
                    payload: 'operationsReady'
                });
            }
        },

        *fetchOperations({ payload, callback }, { call, put }) {
            if (!payload.code) {
                yield put({
                    type: 'completeReady',
                    payload: 'operationsReady'
                });
                return;
            }

            const response = yield call(authorizedOperations, payload);

            if (response && response.code === 10000) {
                yield put({
                    type: 'saveOperations',
                    payload: response.data
                });
                yield put({
                    type: 'completeReady',
                    payload: 'operationsReady'
                });
                yield put({
                    type: 'flagLoadedOperations',
                    payload
                });
                if (callback && typeof callback === 'function') callback();
            } else {
                yield put({
                    type: 'completeReady',
                    payload: 'operationsReady'
                });
                if (callback && typeof callback === 'function') callback();
            }
        },
        *updateOperations({ payload }, { select, put }) {
            const { ready: permissionReady, mapping, mappingOfRoutes } = yield select(
                ({ permission }: ConnectState) => permission
            );

            if (permissionReady) {
                const { pathname } = payload;
                const authority = mappingOfRoutes[pathname];
                const permissionItem = authority ? mapping[authority] : undefined;
                if (permissionItem && permissionItem.code && !permissionItem.loadedOperations) {
                    yield put({
                        type: 'fetchOperations',
                        payload: {
                            code: permissionItem.code
                        }
                    });
                }
            }
        }
    },

    reducers: {
        saveRoutes(state = {}, action) {
            const { routes = [], mapping = {} } = state;

            const newRoutes: Array<PermissionItem> = filterNewItems(
                <Array<PermissionItem>>action.payload,
                mapping,
                (item: any) => item.type === 'menu' || item.type === 'system'
            );
            const newMapping = generateNewMapping(newRoutes);

            const newState = {
                ...state,
                routes: [...routes, ...newRoutes],
                mapping: {
                    ...mapping,
                    ...newMapping
                }
            };

            setAuthority(Object.keys(newState.mapping));

            return newState;
        },
        saveOperations(state = {}, action) {
            const { operations = [], mapping = {} } = state;

            const newOperations: Array<PermissionItem> = filterNewItems(
                <Array<PermissionItem>>action.payload,
                mapping,
                (item: any) => item.type === 'button'
            );
            const newMapping = generateNewMapping(newOperations);

            const newState = {
                ...state,
                operations: [...operations, ...newOperations],
                mapping: {
                    ...mapping,
                    ...newMapping
                }
            };

            // 设置权限
            setAuthority(Object.keys(newState.mapping));

            return newState;
        },
        completeReady(state = {}, action) {
            const { payload = '' } = action;
            const newState = {
                ...state
            };
            if (['operationsReady', 'routesReady'].some(item => item === payload)) {
                newState[payload] = true;
            }
            newState.ready = newState.routesReady && newState.operationsReady;

            return newState;
        },
        /**
         * 生成路由与权限的字典表
         * @param state
         * @param action
         */
        generateMappingOfRoutes(state = {}, action) {
            const { routeData = [] } = action.payload;

            const allRoutes = generateAllRoutes(routeData);
            const mappingOfRoutes = {};
            allRoutes.forEach(pathname => {
                mappingOfRoutes[pathname] = getRouteAuthority(pathname, routeData);
            });

            return {
                ...state,
                mappingOfRoutes
            };
        },
        /**
         * 标记操作性的权限数据已经加载过
         */
        flagLoadedOperations(state = {}, action) {
            const { mapping = {} } = state;
            const { code } = action.payload;
            const permissionItem = mapping[code];
            if (permissionItem) {
                if (permissionItem) {
                    return {
                        ...state,
                        mapping: {
                            ...mapping,
                            [code]: {
                                ...permissionItem,
                                loadedOperations: true
                            }
                        }
                    };
                }
            }

            return state;
        },
        clear() {
            return {
                ready: false,
                routesReady: false,
                operationsReady: false,
                routes: [],
                operations: [],
                mapping: {},
                mappingOfRoutes: {}
            };
        }
    },
    subscriptions: {
        historyChanged({ dispatch, history }) {
            history.listen(location => {
                const { pathname } = location;
                dispatch({
                    type: 'updateOperations',
                    payload: {
                        pathname
                    }
                });
            });
        }
    }
};

export default PermissionModel;
