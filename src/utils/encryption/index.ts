import CryptoJS from 'crypto-js';
import md5 from 'crypto-js/md5';
import aes from 'crypto-js/aes';

import key from './key';
import secret from './secret';

/**
 * 获取api提交数据时需要使用的字段sign
 * @param {*} timeStamp
 * @param {*} apiKey 这个字段的值来自于require('./key.js')
 * @param {*} params
 */
export function getSign(timeStamp: number, params: any, apiKey: string = key): string {
    return md5(`${timeStamp}${apiKey}${params}`)
        .toString()
        .toUpperCase();
}
/**
 * 加密数据
 * @param {*} data
 * @param {*} dataSecret 这个字段的值来自于require('./secret.js')
 */
export function encrypt(data: any, dataSecret: string = secret): string {
    return aes
        .encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(dataSecret), {
            iv: CryptoJS.enc.Utf8.parse(dataSecret),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })
        .toString();
}
/**
 * 解密数据
 * @param {*} params
 * @param {*} dataSecret 这个字段的值来自于require('./secret.js')
 */
export function decrypt(params: any, dataSecret: string = secret): any {
    if (typeof params !== 'string') return params;
    if (params) {
        return JSON.parse(
            aes
                .decrypt(params, CryptoJS.enc.Utf8.parse(dataSecret), {
                    iv: CryptoJS.enc.Utf8.parse(dataSecret),
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                })
                .toString(CryptoJS.enc.Utf8)
        );
    }
    return params;
}
