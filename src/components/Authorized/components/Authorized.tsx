import React from 'react';
import { connect } from 'dva';
import check, { IAuthorityType } from './CheckPermissions';

import AuthorizedRoute from './AuthorizedRoute';
import Secured from './Secured';
import { ConnectState } from '@/models/connect';
import { PermissionModelState } from '@/models/permission';

interface AuthorizedProps {
    authority: IAuthorityType;
    noMatch?: React.ReactNode;
    permission?: PermissionModelState;
}

type IAuthorizedType = React.FunctionComponent<AuthorizedProps> & {
    Secured: typeof Secured;
    check: typeof check;
    AuthorizedRoute: typeof AuthorizedRoute;
    hasPermissions: Function;
};

let Authorized: React.FunctionComponent<AuthorizedProps> = ({
    children,
    authority,
    noMatch = null,
    permission = {}
}) => {
    const { ready: permissionReady } = permission;

    const childrenRender: React.ReactNode = typeof children === 'undefined' ? null : children;
    // 权限数据还未准备好的时候不做任何渲染
    if (permissionReady === false) return null;

    const dom = check(authority, childrenRender, noMatch);
    return <>{dom}</>;
};

Authorized = connect(({ permission }: ConnectState) => ({
    permission
}))(Authorized);

export default Authorized as IAuthorizedType;
