import request from '@/utils/request';
import { PermissionItem, PermissionItemType } from '@/models/permission';

function transformData(data: Array<any>): Array<PermissionItem> {
    return data.map((item: any) => ({
        id: item.id,
        code: item.code,
        parentCode: item.parentCode,
        // permission: item.permission,
        name: item.name,
        url: item.url,
        type: <PermissionItemType>item.resourceType,
        // enable: item.available,
        sort: item.sort,
        loadedOperations: false
    }));
}

/**
 * 获取经授权的路由，对应页面左侧的菜单列表，废弃，authorizedRoutesAllCode代替
 */
export async function authorizedRoutes(): Promise<any> {
    return request('/api/vos/auth/v1/getLeftMenus', {
        method: 'GET'
    })
        .then(response => {
            if (response && response.code === 10000) {
                const { data = [] } = response;

                return {
                    ...response,
                    data: transformData(data)
                };
            }

            return response;
        })
        .catch(error => {
            console.log('authorizedRoutes: ', error);
        });
}
/**
 * 获取经授权的路由，及所有授权码
 */
export async function authorizedRoutesAllCode(): Promise<any> {
    return request('/api/vos/auth/v1/getAllMenus', {
        method: 'GET'
    })
        .then(response => {
            if (response && response.code === 10000) {
                const { data = [] } = response;

                return {
                    ...response,
                    data: transformData(data)
                };
            }

            return response;
        })
        .catch(error => {
            console.log('authorizedRoutes: ', error);
        });
}

interface authorizedOperationsParams {
    code: string;
}

/**
 *
 * @param params<authorizedOperationsParams>: {
 *     code<string>: 要查询的权限编码，唯一标识，对应与models/permission的PermissionItem的code字段
 * }
 */
export async function authorizedOperations(params: authorizedOperationsParams): Promise<any> {
    return request('/api/vos/auth/v1/subPermissionByCode', {
        method: 'GET',
        params
    })
        .then(response => {
            if (response && response.code === 10000) {
                const { data = [] } = response;

                return {
                    ...response,
                    data: transformData(data)
                };
            }

            return response;
        })
        .catch(error => {
            console.log('authorizedOperations: ', error);
        });
}
