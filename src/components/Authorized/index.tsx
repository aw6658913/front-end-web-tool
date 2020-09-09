import React from 'react';
import Redirect from 'umi/redirect';
import { connect } from 'dva';
import pathToRegexp from 'path-to-regexp';
import Authorized from './utils/Authorized';
import { ConnectProps, ConnectState, Route, UserModelState } from '@/models/connect';

interface AuthComponentProps extends ConnectProps {
    user: UserModelState;
}

export const getRouteAuthority = (path: string, routeData: Route[]) => {
    let authorities: string[] | string | undefined;
    for (let i = 0, len = routeData.length; i < len; i += 1) {
        const route = routeData[i];
        // match prefix
        if (pathToRegexp(`${route.path}(.*)`).test(path)) {
            if (route.authority) {
                authorities = route.authority;
            }
            // exact match
            if (route.path === path) {
                authorities = route.authority || authorities;
                break;
            }
            // get children authority recursively
            if (route.routes) {
                authorities = getRouteAuthority(path, route.routes) || authorities;
            }
        }
    }
    return authorities;
};

const AuthComponent: React.FC<AuthComponentProps> = ({
    children,
    route = {
        routes: []
    },
    location = {
        pathname: ''
    },
    user
}) => {
    const { currentUser } = user;
    const { routes = [] } = route;
    const isLogin = currentUser && currentUser.userId;
    return (
        <Authorized
            authority={getRouteAuthority(location.pathname, routes) || ''}
            noMatch={isLogin ? <Redirect to="/exception/403" /> : <Redirect to="/user/login" />}
        >
            {children}
        </Authorized>
    );
};

export default connect(({ user }: ConnectState) => ({
    user
}))(AuthComponent);
