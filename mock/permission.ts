import { Request, Response } from 'express';

export default {
    'GET /mock/api/vos/auth/v1/getLeftMenus': (req: Request, res: Response) => {
        res.send({
            code: 10000,
            data: [
                {
                    id: 46,
                    code: 'OrderManager',
                    name: 'Order Manager',
                    permission: 'order:manager',
                    resourceType: 'system',
                    available: true,
                    url: '',
                    sort: 100,
                    parentCode: ''
                },
                {
                    id: 47,
                    code: 'OrderList',
                    name: 'Order List',
                    permission: 'order:list',
                    resourceType: 'menu',
                    available: true,
                    url: '/api/order/list',
                    sort: 101,
                    parentCode: 'OrderManager'
                },
                {
                    id: 49,
                    code: 'UscQuestionIndex',
                    name: 'Question-index',
                    permission: 'usc:question:index',
                    resourceType: 'system',
                    available: true,
                    url: '',
                    sort: 200,
                    parentCode: ''
                },
                {
                    id: 50,
                    code: 'UscSettingPrimaryCatalog',
                    name: 'Setting Primary Catalog',
                    permission: 'usc:setting:primary:catalog',
                    resourceType: 'menu',
                    available: true,
                    url: '/api/eomp/cs/customerserve/primary',
                    sort: 201,
                    parentCode: 'UscQuestionIndex'
                },
                {
                    id: 51,
                    code: 'UscSettingSecondaryCatalog',
                    name: 'Setting Secondary Catalog',
                    permission: 'usc:setting:secondary:catalog',
                    resourceType: 'menu',
                    available: true,
                    url: '/api/eomp/cs/customerserve/secondary',
                    sort: 202,
                    parentCode: 'UscQuestionIndex'
                },
                {
                    id: 52,
                    code: 'UscSettingQuestionIndex',
                    name: 'Setting Question-index',
                    permission: 'usc:setting:question:index',
                    resourceType: 'menu',
                    available: true,
                    url: '/api/eomp/cs/customerserve/question',
                    sort: 203,
                    parentCode: 'UscQuestionIndex'
                },
                {
                    id: 53,
                    code: 'ConsumerRecommendManagement',
                    name: 'RecommendManagement',
                    permission: 'consumer:recommend:management',
                    resourceType: 'system',
                    available: true,
                    url: '',
                    sort: 300,
                    parentCode: ''
                },
                {
                    id: 54,
                    code: 'ConsumerHomeBannerManagement',
                    name: 'HomeBannerManagement',
                    permission: 'consumer:home:banner:management',
                    resourceType: 'menu',
                    available: true,
                    url: '/api/eomp/uadmin/RecommendManagement/HomeManagement/BannerManagement',
                    sort: 301,
                    parentCode: 'ConsumerRecommendManagement'
                },
                {
                    id: 55,
                    code: 'ConsumerUserManagement',
                    name: 'UserManagement',
                    permission: 'consumer:use:management',
                    resourceType: 'system',
                    available: true,
                    url: '/api/eomp/uadmin/UserManagement',
                    sort: 303,
                    parentCode: ''
                },
                {
                    id: 56,
                    code: 'ConsumerMessageManagement',
                    name: 'MessageManagement',
                    permission: 'consumer:message:management',
                    resourceType: 'system',
                    available: true,
                    url: '/api/eomp/uadmin/MessageManagement',
                    sort: 304,
                    parentCode: ''
                },
                {
                    id: 57,
                    code: 'ConsumerMessageManagementMessageManagement',
                    name: 'MessageManagement',
                    permission: 'consumer:message:management:message:management',
                    resourceType: 'menu',
                    available: true,
                    url: '',
                    sort: 305,
                    parentCode: 'ConsumerMessageManagement'
                },
                {
                    id: 58,
                    code: 'ConsumerMessageManagementMessageTypeManagement',
                    name: 'MessageTypeManagement',
                    permission: 'consumer:message:management:message:type:management',
                    resourceType: 'menu',
                    available: true,
                    url: '/api/eomp/uadmin/MessageManagement',
                    sort: 206,
                    parentCode: 'ConsumerMessageManagement'
                }
            ],
            msg: '操作成功',
            timeStamp: new Date().getTime()
        });
    },
    'GET /mock/api/vos/auth/v1/subPermissionByCode': (req: Request, res: Response) => {
        const { code } = req.query;

        const data =
            {
                OrderManager: [
                    {
                        id: 17,
                        code: 'OrderList',
                        name: '订单列表',
                        permission: 'order:list',
                        resourceType: 'menu',
                        available: true,
                        url: '/api/order/list',
                        sort: 0,
                        parentCode: 'OrderManager'
                    }
                ],
                OrderList: [
                    {
                        id: 18,
                        code: 'OrderListQuery',
                        name: '查询',
                        permission: 'order:list:query',
                        resourceType: 'button',
                        available: true,
                        url: '',
                        sort: 0,
                        parentCode: 'OrderList'
                    }
                ]
            }[code] || [];

        res.send({
            code: 10000,
            data,
            msg: `操作成功${code}`,
            timeStamp: new Date().getTime()
        });
    }
};
