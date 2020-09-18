import { IConfig, IPlugin } from 'umi-types';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/
import getParams from './params';
import proxyConfig from './proxy';

import slash from 'slash2';
import webpackPlugin from './plugin.config';
const { pwa, primaryColor } = defaultSettings;
const plugins: IPlugin[] = [
    [
        'umi-plugin-react',
        {
            antd: true,
            dva: {
                hmr: true
            },
            locale: {
                // default false
                enable: true,
                // default en-US
                default: 'en-US',
                // default true, when it is true, will use `navigator.language` overwrite default
                baseNavigator: false
            },
            dynamicImport: {
                loadingComponent: './components/PageLoading/index'
                // webpackChunkName: true,
                // level: 3,
            },
            pwa: pwa
                ? {
                      workboxPluginMode: 'InjectManifest',
                      workboxOptions: {
                          importWorkboxFrom: 'local'
                      }
                  }
                : false // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
            // dll features https://webpack.js.org/plugins/dll-plugin/
            // dll: {
            // include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
            // exclude: ['@babel/runtime', 'netlify-lambda'],
            // }
        }
    ],
    [
        'umi-plugin-pro-block',
        {
            moveMock: false,
            moveService: false,
            modifyRequest: true,
            autoAddMenu: true
        }
    ]
];

// 获取命令参数
const { pathPrefix: originalPathPrefix = '', routerPrefix: originalRouterPrefix, publishEnv = '' } = getParams();

/**
 * 组合修正路径，前后以/包裹，实现绝对路径
 * 例如：
 * 参数值为vvweb，修正后为/vvweb/
 * 参数值为http://domain.com/vvweb，修正后为http://domain.com/vvweb/
 */
const pathPrefix = originalPathPrefix
    ? `/${originalPathPrefix}/`.replace(/\/+/g, '/').replace(/^\/(https?:\/)(.*)$/, '$1/$2')
    : '';
const routerPrefix = originalRouterPrefix ? `/${originalRouterPrefix}/`.replace(/\/+/g, '/') : '';

export default {
    plugins,
    block: {
        // 国内用户可以使用码云
        // defaultGitUrl: 'https://gitee.com/ant-design/pro-blocks',
        defaultGitUrl: 'https://github.com/ant-design/pro-blocks'
    },
    hash: true,
    targets: {
        ie: 11
    },
    devtool: false,
    // umi routes: https://umijs.org/zh/guide/router.html
    routes: [
        {
            path: '/user',
            component: '../layouts/SecurityLayout',
            routes: [
                {
                    path: '/user',
                    component: '../layouts/UserLayout',
                    routes: [
                        {
                            name: 'login',
                            path: '/user/login',
                            component: './user/login'
                        },
                        {
                            component: './exception/404'
                        }
                    ]
                }
            ]
        },
        {
            path: '/exception',
            component: '../layouts/BlankLayout',
            routes: [
                {
                    name: '403',
                    icon: 'smile',
                    path: '/exception/403',
                    component: './exception/403'
                },
                {
                    name: '500',
                    icon: 'smile',
                    path: '/exception/500',
                    component: './exception/500'
                },
                {
                    name: '404',
                    icon: 'smile',
                    path: '/exception/404',
                    component: './exception/404'
                },
                {
                    component: './exception/404'
                }
            ]
        },
        {
            path: '/',
            component: '../layouts/SecurityLayout',
            routes: [
                {
                    path: '/',
                    component: '../layouts/BasicLayout',
                    Routes: ['src/components/Authorized'],
                    routes: [
                        {
                            path: '/',
                            redirect: '/workbench'
                        },
                        {
                            path: '/workbench',
                            name: 'workbench',
                            title: '工作台',
                            component: './workbench',
                            authority: ''
                        },
                        {
                            path: '/home',
                            name: 'home',
                            title: '个人中心',
                            icon: 'setting',
                            authority: '',
                            routes: [
                                {
                                    path: 'welcome',
                                    name: 'welcome',
                                    title: '欢迎',
                                    icon: 'smile',
                                    component: './Welcome'
                                    // sort: 9999
                                },
                                {
                                    component: './exception/404'
                                }
                            ]
                        },
                        {
                            component: './exception/404'
                        }
                    ]
                }
            ]
        }
    ],
    // Theme for antd: https://ant.design/docs/react/customize-theme-cn
    theme: {
        'primary-color': primaryColor
    },
    define: {
        PUBLISH_ENV: publishEnv,
        ENV: process.env.NODE_ENV,
        MOCK_API_PREFIX: process.env.MOCK !== 'none' ? '/mock' : '',
        PATH_PREFIX: routerPrefix
    },
    base: process.env.NODE_ENV === 'production' ? routerPrefix : '',
    publicPath: process.env.NODE_ENV === 'production' ? pathPrefix : '',
    ignoreMomentLocale: true,
    lessLoaderOptions: {
        javascriptEnabled: true
    },
    disableRedirectHoist: true,
    cssLoaderOptions: {
        modules: true,
        getLocalIdent: (
            context: {
                resourcePath: string;
            },
            _: string,
            localName: string
        ) => {
            if (
                context.resourcePath.includes('node_modules') ||
                context.resourcePath.includes('ant.design.pro.less') ||
                context.resourcePath.includes('global.less')
            ) {
                return localName;
            }

            const match = context.resourcePath.match(/src(.*)/);

            if (match && match[1]) {
                const antdProPath = match[1].replace('.less', '');
                const arr = slash(antdProPath)
                    .split('/')
                    .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
                    .map((a: string) => a.toLowerCase());
                return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
            }

            return localName;
        }
    },
    manifest: {
        basePath: '/'
    },
    chainWebpack: webpackPlugin,
    proxy: proxyConfig
} as IConfig;
