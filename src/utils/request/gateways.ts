/**
 * 网关字典列表
 */
const gatewaysMapping: Object = {
    '/api/user': '/vvgw/vv-user',
    '/api/vos': '/vvgw/VV-VOS-WEB',
    '/api/logistics': '/vvgw/VV-LOGISTICS-WEB',
    '/api/resource': '/vvgw/VV-RESOURCE-SERVICE',
    '/api/service/rider': '/vvgw/VV-LOGISTICS-WEB',
    '/api/consumer': '/vvgw/VV-CONSUMER-WEB',
    '/api/plan': '/vvgw/VV-CONSUMER-WEB',
    // 客服1.5
    '/api/usc': '/vvgw/VV-USC-WEB',
    '/api/im': '/vvgw/VV-IM-WEB',
    '/api/catalog': '/vvgw/VV-USC-WEB',

    '/api/web/merchant': '/vvgw/VV-MERCHANTBIZ-WEB',
    '/api/mdc': '/vvgw/VV-VDC-WEB',
    '/api/pdc': '/vvgw/VV-VDC-WEB',
    '/api/bd': '/vvgw/VV-BD-WEB',
    // 支付v1.0.2
    '/api/acc/v1/': '/vvgw/vv-payment',
    // 支付v1.0.3
    '/api/transaction/v1/': '/vvgw/vv-payment-operation',
    // 支付v1.0.4
    '/api/settlement/v1/': '/vvgw/vv-payment-operation'
};

/**
 * 提取所有的gateway，用于遍历查询
 */
const keysList: Array<string> = Object.keys(gatewaysMapping);

/**
 * 根据url进行选择
 * @param url
 */
export default function whichGateway(url: string): string {
    const matchedKey = keysList.find(key => {
        const re = new RegExp(`^${key.replace(/\//g, '\\/')}`);
        return re.test(url);
    });

    if (matchedKey) {
        return gatewaysMapping[matchedKey] + url;
    }

    return url;
}
