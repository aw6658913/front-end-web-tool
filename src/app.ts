// import router from 'umi/router';
// import { stringify } from 'querystring';
// import { getLoginStates } from '@/utils/cacheLogin';

/**
 * 运行时配置
 *
 * 运行时修改路由：patchRoutes(routes)
 * 改写整个应用render到dom树里的方法：render(oldRender)
 * 初始加载和路由切换时做一些事情：onRouteChange({ location, routes, action })
 * 封装root container，可以取一部分，或者外面套一层，等等：rootContainer(container)
 * 修改传给路由组件的props：modifyRouteProps(props, { route })
 */

// export function onRouteChange({ location }) {
// const isLogin = !!getLoginStates('user');

// if (!isLogin && location.pathname !== '/user/login') {
//     const queryString = stringify({
//         redirect: window.location.href
//     });

//     router.replace(`/user/login?${queryString}`);
//     return;
// }

// if (isLogin && location.pathname === '/user/login') {
//     router.push('/');
//     return;
// }
// }
