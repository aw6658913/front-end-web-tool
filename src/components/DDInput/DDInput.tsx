import React, { forwardRef } from 'react';
import { Input } from 'antd';

const DDInput = forwardRef((props: any, ref: any) => {
    const cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g;
    const { vvMaxLength, ...inputProps } = props;

    const getLength = (text: string) => {
        const mat = text.match(cnReg);
        if (mat) {
            return mat.length * 2 + (text.length - mat.length);
        }
        return text.length;
    };

    const limitMaxLength = (text: string, maxLength = 0) => {
        const mat = text.match(cnReg);
        if (mat) {
            let sumLength = 0;
            let subLength = 0;
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < text.length; i++) {
                if (text.charCodeAt(i) < 27 || text.charCodeAt(i) > 126 || text.charCodeAt(i) > 255) {
                    sumLength += 2;
                } else {
                    sumLength += 1;
                }
                if (sumLength > maxLength) {
                    subLength = i;
                    break;
                }
            }
            return text.substring(0, subLength);
        }
        return text.substring(0, maxLength);
    };

    const onInput = (e: any) => {
        // 二次清除前后空格，不然在表单中会出现遗留空格的值在表单里
        e.target.value = e.target.value.trim();
    };

    const onKeyUp = (e: any) => {
        e.target.value = e.target.value.trim();
        // 根据输入限制控制输入长度
        const maxLength = props.vvMaxLength || props.maxLength || 0;
        if (e.target.value && getLength(e.target.value) > maxLength) {
            e.target.value = limitMaxLength(e.target.value, maxLength);
        }
    };

    return <Input {...inputProps} ref={ref} onInput={onInput} onKeyUp={onKeyUp} />;
});

export default DDInput;
