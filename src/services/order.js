import request from '@/utils/request';
/**
 * 获取预订订单状态 参数为空为了获取总数展示在菜单
 * @param {data} data
 */
export function getOrderExceptionNum() {
    return request('/vvgw/VV-ORDER-WEB/api/web/orderfailure/v7/getstatus', {
        method: 'post',
        data: {}
    });
}
