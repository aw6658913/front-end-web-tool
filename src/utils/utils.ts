import { parse } from 'querystring';
import moment from 'moment';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

export const isProduction = (): boolean => ENV === 'production';

export const isDevelopment = (): boolean => ENV === 'development';

export const generateRedirectUrl = (): any => window.location.href.replace(/redirect=.*$/, '').replace(/\?$/, '');

/**
 * 下载方法
 * @param fileObj
 * @param filename filename = 'xxx.png'
 */
export const download = async (fileObj: any, filename = 'xxx.png') => {
    if (fileObj) {
        let a: any = window.document.createElement('a');
        if (typeof fileObj === 'string') {
            a.href = fileObj;
            a.download = filename;
            a.click();
        } else {
            const blobUrl = window.URL.createObjectURL(fileObj);
            a.href = blobUrl;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            a = null;
        }
    }
};

export const getStatusColor = (statu: string | number) => {
    const map = {
        'To Pay': 'order-orange',
        'To Accept Order': 'order-orange',
        'Merchant Accepted': 'order-orange',
        'To Pick Up': 'order-orange',
        Completed: 'order-green',
        Cancelled: 'order-red',
        Declined: 'order-red',
        Refunding: 'order-orange',
        'Refund Successful': 'order-green',
        Refunded: 'order-green',
        'Refund Failed': 'order-red',
        'No Refund': 'order-orange',
        'To Verify': 'order-orange',
        Verified: 'order-green',
        Transfered: 'order-green',
        'Completed(deducted)': 'order-green',
        'Completed(NO deduction)': 'order-green'
    };
    return map[statu] || 'order-orange';
};

export const transformTime = (time: string | number | Date) => {
    let date;
    if (time) {
        const temp = new Date(time);
        date = moment(temp).format('DD/MM/YYYY HH:mm:ss');
    } else {
        date = time;
    }
    return date;
};

/**
 * 去除对象中所有值为字符串的前后空格
 * @param obj
 * @returns {*}
 */
export function trimObj(targetObj = {}) {
    const obj = targetObj;
    Object.keys(obj).forEach(prop => {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            const value = obj[prop];
            const type = typeof value;
            if (value != null && (type === 'string' || type === 'object')) {
                if (type === 'object') {
                    trimObj(obj[prop]);
                } else {
                    obj[prop] = obj[prop].trim();
                }
            }
        }
    });
    return obj;
}

/*
 *  数字千位分隔
 * @param number<int>
 * @return string
 * */
export function numberThousandSeparator(number = 0) {
    return number.toLocaleString();
}
