import React from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';
import { stringify } from 'querystring';
import { ConnectState, ConnectProps } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import PageLoading from '@/components/PageLoading';
import { generateRedirectUrl } from '@/utils/utils';
import { getLoginStates } from '@/utils/cacheLogin';

interface SecurityLayoutProps extends ConnectProps {
    loading: boolean;
    loadingPermissionRoutes: boolean;
    currentUser: CurrentUser;
}

interface SecurityLayoutState {
    isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
    /**
     * 这个字段的作用是用于标记是否处于挂载状态,
     * 我们不能在组件销毁后设置state，防止出现内存泄漏的情况,
     * 主要针对底下dispatch的callback内需要调用setState({isReady: true})
     */
    mountedFlag: boolean = false;

    state: SecurityLayoutState = {
        isReady: false
    };

    loginPathname: string = '/user/login';

    componentDidMount() {
        this.mountedFlag = true;
        const { dispatch, route = { routes: [] }, location = { pathname: '' } } = this.props;
        const { routes } = route;
        const { pathname = '' } = location;
        if (dispatch && !(pathname === '/' && !getLoginStates('token'))) {
            dispatch({
                type: this.isLoginPathname() ? 'user/fetchCurrentFromCookie' : 'user/fetchCurrent',
                callback: () => {
                    if (this.mountedFlag) {
                        this.setState({
                            isReady: true
                        });
                    }

                    const isLogin = this.isLogin();

                    if (isLogin) {
                        dispatch({
                            type: 'permission/fetchRoutes',
                            payload: {
                                routeData: routes,
                                pathname
                            }
                        });
                    }
                }
            });
        } else {
            this.setState({
                isReady: true
            });
        }
    }

    componentWillUnmount() {
        this.mountedFlag = false;
    }

    isLoginPathname = (): boolean => {
        const { location } = this.props;

        return !!(location && location.pathname === this.loginPathname);
    };

    isLogin = (): boolean => {
        // const { currentUser } = this.props;
        // const isLogin = currentUser && currentUser.userId;
        const isLogin = true;
        return !!isLogin;
    };

    render() {
        const { isReady } = this.state;
        const { children, loading, loadingPermissionRoutes } = this.props;

        const isLogin = this.isLogin();
        const queryString = stringify({
            redirect: generateRedirectUrl()
        });

        const isLoginPathname: boolean = this.isLoginPathname();

        if (!isLogin) {
            return children;
        }

        if ((!isLogin && loading) || loadingPermissionRoutes || !isReady) {
            return <PageLoading />;
        }
        if (!isLogin && !isLoginPathname) {
            return <Redirect to={`${this.loginPathname}?${queryString}`} />;
        }

        if (isLoginPathname) {
            return <Redirect to="/" />;
        }

        return children;
    }
}

export default connect(({ user, loading, global }: ConnectState) => ({
    currentUser: user.currentUser,
    global,
    loading: loading.models.user,
    loadingPermissionRoutes: loading.effects['permission/fetchRoutes']
}))(SecurityLayout);
