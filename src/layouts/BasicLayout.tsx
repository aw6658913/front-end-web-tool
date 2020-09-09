/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, { MenuDataItem, BasicLayoutProps as ProLayoutProps, Settings } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import Link from 'umi/link';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';

import GlobalFooter from '@/components/GlobalFooter';
import Authorized from '@/components/Authorized/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState, Route } from '@/models/connect';
import logo from '../assets/logo.png';
import { getRouteAuthority } from '@/components/Authorized';

interface PermissionMapping {
    [propName: string]: any;
}
export interface BasicLayoutProps extends ProLayoutProps {
    breadcrumbNameMap: {
        [path: string]: MenuDataItem;
    };
    settings: Settings;
    dispatch: Dispatch;
    permissionMapping: PermissionMapping;
    exceptionNumber: Number;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
    breadcrumbNameMap: {
        [path: string]: MenuDataItem;
    };
};

/**
 * 获取权限编码排序值sort
 * 1. 根据权限编码，从权限字典中获取sort
 * 2. 如果sort不存在，就采用路由配置项的sort
 * 3. 如果路由配置项依然不存在，则默认取0
 * --------
 * 4. 如果权限编码是一个数组的情况，那么先排序权限编码自身的顺序，然后取最前面的sort
 * 5. 如果最前面的不存在，则默认取0
 * @param authority 权限编码
 * @param permissionMapping 权限字典
 */
const getPermissionItemSort = (
    authority: string | string[] | undefined,
    permissionMapping: PermissionMapping
): number | undefined => {
    let sort: number | undefined;
    if (typeof authority === 'string') {
        sort =
            permissionMapping[authority] && typeof permissionMapping[authority].sort !== 'undefined'
                ? permissionMapping[authority].sort
                : undefined;
    } else if (Object.prototype.toString.call(authority) === '[object Array]') {
        // 如果是数组，以排名最先的优先
        const permissionList: any[] = (authority || []).map(key => permissionMapping[key]);
        permissionList.sort((a, b) => a.sort - b.sort);
        sort = permissionList[0] && typeof permissionList[0].sort !== 'undefined' ? permissionList[0].sort : undefined;
    }
    return sort;
};
/**
 * 排序是以sort数值从小到大的顺序排列，越小越排前
 * @param list
 * @param permissionMapping
 */
const sortMenuList = (list: MenuDataItem[], permissionMapping: PermissionMapping): MenuDataItem[] => {
    const newList = [...list];

    newList.sort((a: MenuDataItem, b: MenuDataItem) => {
        let sortA = 0;
        if (a) {
            // a could not be null
            sortA = getPermissionItemSort(a.authority, permissionMapping) || a.sort || 0;
        }
        let sortB = 0;
        if (b) {
            // b could not be null
            sortB = getPermissionItemSort(b.authority, permissionMapping) || b.sort || 0;
        }

        return sortA - sortB;
    });

    return newList;
};
/**
 * menuDataRender的生成器
 * 返回一个函数，应用于ProLayout的props.menuDataRender
 * @param routeData
 * @param permissionMapping
 * @return Function
 */
const menuDataRenderGenerator = (routeData: Route[] = [], permissionMapping: PermissionMapping) => {
    const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] => {
        let newMenuList = menuList.map(item => {
            const authority = getRouteAuthority(item.path, routeData);
            const localItem = {
                ...item,
                authority,
                children: item.children ? menuDataRender(item.children) : []
            };
            return Authorized.check(item.authority, localItem, null) as MenuDataItem;
        });

        newMenuList = sortMenuList(newMenuList, permissionMapping);

        return newMenuList;
    };
    return menuDataRender;
};

const footerRender: BasicLayoutProps['footerRender'] = () => <GlobalFooter />;

const BasicLayout: React.FC<BasicLayoutProps> = props => {
    const {
        dispatch,
        children,
        settings,
        route: routeList = { routes: [] },
        permissionMapping = {},
        exceptionNumber
    } = props;
    /**
     * constructor
     */

    useEffect(() => {
        if (dispatch) {
            dispatch({
                type: 'settings/getSetting'
            });
        }
    }, []);

    /**
     * init variables
     */
    const handleMenuCollapse = (payload: boolean): void => {
        if (dispatch) {
            dispatch({
                type: 'global/changeLayoutCollapsed',
                payload
            });
        }
    };

    /**
     * use Authorized check all menu item
     */
    const menuDataRender = menuDataRenderGenerator(routeList.routes, permissionMapping);

    return (
        <ProLayout
            logo={
                <Link to="/">
                    <img src={logo} alt="eomp" />
                </Link>
            }
            onCollapse={handleMenuCollapse}
            menuHeaderRender={(_, titleDom) => (
                <Link to="/">
                    <img style={{ width: '45px', height: '45px' }} src={logo} alt="eomp" />
                    {titleDom}
                </Link>
            )}
            menuItemRender={(menuItemProps, defaultDom) => {
                if (menuItemProps.isUrl || menuItemProps.children) {
                    return defaultDom;
                }
                // 需求需要显示下异常单的数量
                if (menuItemProps.path === '/ordercenter/exceptions') {
                    return (
                        <Link to={menuItemProps.path}>
                            {defaultDom}
                            <span style={{ marginLeft: '5px', color: 'red' }}>{`(${exceptionNumber})`}</span>
                        </Link>
                    );
                }
                return (
                    <Link
                        style={{
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                        }}
                        to={menuItemProps.path}
                    >
                        {defaultDom}
                    </Link>
                );
            }}
            breadcrumbRender={(routers = []) => [
                {
                    path: '/',
                    breadcrumbName: formatMessage({
                        id: 'menu.home',
                        defaultMessage: 'Home'
                    })
                },
                ...routers
            ]}
            itemRender={(route, params, routes, paths) => {
                const first = routes.indexOf(route) === 0;
                return first ? (
                    <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
                ) : (
                    <span>{route.breadcrumbName}</span>
                );
            }}
            footerRender={footerRender}
            menuDataRender={menuDataRender}
            formatMessage={formatMessage}
            rightContentRender={rightProps => <RightContent {...rightProps} />}
            {...props}
            {...settings}
        >
            {children}
        </ProLayout>
    );
};

export default connect(({ global, settings, permission }: ConnectState) => ({
    collapsed: global.collapsed,
    exceptionNumber: global.exceptionNumber,
    settings,
    permissionMapping: permission.mapping
}))(BasicLayout);
