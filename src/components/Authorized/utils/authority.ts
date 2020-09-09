import { reloadAuthorized } from './Authorized';

/**
 * 存储从服务端获取到的权限编码
 * 用于鉴权
 */
let currentAuthorities: string | string[];

/**
 * 获取当前权限编码
 */
export function getAuthority(authorities?: string | string[]): string | string[] {
    if (typeof authorities === 'string') {
        return [authorities];
    }
    if (Array.isArray(authorities) && authorities.length > 0) {
        return authorities;
    }

    return currentAuthorities;
}

/**
 * 设置当前权限编码，一般从服务端获取
 * @param authority
 */
export function setAuthority(authority: string | string[]): void {
    currentAuthorities = typeof authority === 'string' ? [authority] : authority;

    // auto reload
    reloadAuthorized();
}
