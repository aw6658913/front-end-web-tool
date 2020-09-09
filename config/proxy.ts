// dev 开发环境，默认；
// test 测试环境；
// uat 预发布环境；
// prod 生成环境；
// stress 压测（压力测试）环境
const proxyEnv = 'dev';
const envUrl = {
    dev: 'https://devvvlife.vvtechnology.cn',
    test: 'https://testvvlife.vvtechnology.cn:12980',
    uat: 'https://uatvvlife.vvtechnology.cn:20080',
    prod: 'https://vvlife.vvtechnology.cn:30080',
    stress: 'https://stressvvlife.vvtechnology.cn'
};

// 配置参考
// const diyConfig = {
//     代理 /vvgw/vv-payment-operation 到 http://172.115.11.1/，path可以不写或''或'/'
//     '/vvgw/vv-payment-operation': { target: 'http://172.115.11.1', path: '/' },
//     代理 /vvgw/vv-payment-operation/api 到 http://172.115.11.2/dev-api
//     '/vvgw/vv-payment-operation/api': { target: 'http://172.115.11.2', path: '/dev-api' },
//     代理 /vvgw/vv-payment-operation/api-xxx 到 envUrl[proxyEnv]/api-xxx
//     '/vvgw/vv-payment-operation/api-xxx': {},
//     代理 /vvgw/vv-payment-operation/api-xxx2 到 envUrl[proxyEnv]/api-xxx2
//     '/vvgw/vv-payment-operation/api-xxx2': { target: '', path: '' },
//     代理 /vvgw/vv-payment/api-xxx3 到 envUrl[proxyEnv]/api-xxx3
//     '/vvgw/vv-payment/api-xxx3': { target: '', path: '/' },
//     通用代理配置项没找到，也可以：代理 /vvgw/vv-pay 到 envUrl[proxyEnv]/
//     '/vvgw/vv-pay': { target: '', path: '/' }
// };
// ps: {} = {target: '', path: ''} = {target: '', path: '/'}，
const diyConfig = {};

// 通用代理配置项
let commonProxyConfig = {
    // http://wiki.vv.cn:8090/pages/viewpage.action?pageId=36680884
    // 开发环境  devvvlife.vvtechnology.cn 、内网ip: 172.16.6.104:80
    // 测试环境 (外网) testvvlife.vvtechnology.cn:12980  、内网ip: 172.16.6.129:80（120.42.36.30:12980）
    // UAT环境  uatvvlife.vvtechnology.cn:20080 、外网ip: 128.106.75.188:20080
    // 生产环境 vvlife.vvtechnology.cn:30080 、外网ip: 128.106.75.188:30080
    '/vvgw/vv-user': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-CONSUMER-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-TRADE-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-VOS-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-USC-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-LOGISTICS-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-BD-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-VDC-WEB': {
        target: 'http://devvdc.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/vvgw/VV-MERCHANTBIZ-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    '/api/resource': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },
    // 支付v1.0.3
    '/vvgw/vv-payment-operation': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    }, // 支付v1.0.2
    '/vvgw/vv-payment': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    },

    '/vvgw/VV-ORDER-WEB': {
        target: 'https://devvvlife.vvtechnology.cn',
        changeOrigin: true,
        secure: false
    }
};

let commonProxyConfigKeys = Object.keys(commonProxyConfig) || [];
// 根据当前代理环境生成相应环境地址
Object.keys(commonProxyConfig).forEach(item => {
    commonProxyConfig[item] = {
        ...commonProxyConfig[item],
        target: envUrl[proxyEnv]
    };
});
// 遍历自定义配置，根据自定配置修改配置文件
Object.keys(diyConfig).forEach(item => {
    // 兼容配置
    let { target = '', path = '/' } = diyConfig[item];
    if (path === '') path = '/';
    // 过滤所有匹配，因为可能有多个匹配，需要找到最匹配项
    let prefixArr =
        commonProxyConfigKeys.filter(kItem => {
            return item.indexOf(kItem) >= 0;
        }) || [];
    // 必须在通用配置找得到
    // if (prefixArr.length > 0) {
    // 排序，取出最长一个匹配，即最匹配项
    prefixArr.sort();
    let prefix = prefixArr.pop() || '';
    // 替换最匹配项，获取自定义代理后的路径
    let pathDiy = item.replace(prefix, '');
    // 存在则直接修改，不存在新增一个配置项
    commonProxyConfig[item] = {
        ...commonProxyConfig[item],
        target: target ? target : envUrl[proxyEnv],
        changeOrigin: true,
        secure: false,
        // path长度大于1使用path，否则用解析后的pathDiy
        pathRewrite: { [`^${item}`]: path.length > 1 ? path : pathDiy }
    };
    // }
});
console.log(`Current env: ${proxyEnv} ${envUrl[proxyEnv]}`);
export default commonProxyConfig;
