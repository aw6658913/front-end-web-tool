/* eslint-disable no-restricted-properties */
/* eslint-disable no-extend-native */
// -------------------- for Array

/**
 * 数组去重
 */
if (typeof Array.prototype.unique === 'undefined') {
    Array.prototype.unique = function unique() {
        const cached = {};
        const rs: Array<any> = [];
        this.forEach((item: any) => {
            if (!cached[item]) {
                rs.push(item);
                cached[item] = 1;
            }
        });
        return rs;
    };
}

// -------------------- for Number

interface ParsedNumber {
    origion: string;
    value: string;
    decimalsLength: number;
}
/**
 * 解析单个数字的精度值
 * @param {*} num
 */
function parseSingleDecimal(num: number): ParsedNumber {
    let a: string | Array<string> = num.toString();
    const re = /^([-\\+]?)(\d+)(.?)(\d*)e([-\\+])(\d+)$/i;

    if (re.test(a)) {
        // 5e-20, 3.5e+20
        a = a.replace(re, (_, $1sign, $2left, $3point, $4right, $5mark, $6powlength) => {
            let rs = '';
            if ($5mark === '-') {
                rs = `${$1sign}0.${Array($6powlength - $2left.length + 1).join('0')}${$2left}`;
                if ($3point) {
                    // has decimal
                    rs += $4right;
                }
            } else {
                rs = $1sign + $2left + $4right + Array($6powlength - $4right.length + 1).join('0');
            }

            return rs;
        });
    }
    a = a.split('.');

    return {
        origion: a.join('.'),
        value: a.join(''),
        decimalsLength: a[1] ? a[1].length : 0
    };
}
/**
 * 通过精度计算方式，计算两个数值的加减乘除
 * @param {*} type
 * @param {*} numA
 * @param {*} numB
 */
function operateDecimals(type: string, numA: number, numB: number): number {
    let a: ParsedNumber | number = parseSingleDecimal(numA);
    let b: ParsedNumber | number = parseSingleDecimal(numB);

    const decimalsLength = Math.max(a.decimalsLength, b.decimalsLength);
    const p = Math.pow(10, decimalsLength);
    a = Number(a.value + Array(decimalsLength - a.decimalsLength + 1).join('0'));
    b = Number(b.value + Array(decimalsLength - b.decimalsLength + 1).join('0'));

    if (type === 'plus') {
        return (a + b) / p;
    }
    if (type === 'minus') {
        return (a - b) / p;
    }
    if (type === 'times') {
        return (a * b) / Math.pow(p, 2);
    }
    if (type === 'divide') {
        return a / b;
    }
    throw new Error(`unknown (${type}) operation!`);
}
/**
 * 加法运算
 *
 * (3.2).plus(0.19) = 3.39
 */
Number.prototype.plus = function plus(num: number): number {
    return operateDecimals('plus', this.valueOf(), num).valueOf();
};
/**
 * 减法运算
 *
 * (3.2).minus(0.3) = 2.9
 */
Number.prototype.minus = function minus(num: number): number {
    return operateDecimals('minus', this.valueOf(), num).valueOf();
};
/**
 * 乘法运算
 *
 * (3.2).times(0.9) = 2.88
 */
Number.prototype.times = function times(num: number): number {
    return operateDecimals('times', this.valueOf(), num).valueOf();
};
/**
 * 除法运算
 *
 * (3.2).divide(0.8) = 4
 */
Number.prototype.divide = function divide(num: number): number {
    return operateDecimals('divide', this.valueOf(), num).valueOf();
};
/**
 * 四舍五入
 *
 * (0.335).round(2) => 0.34
 * (0.335).round(2, 6) => 0.33
 * (0.335).round(2, 6) => 0.34
 */
Number.prototype.round = function round(decimalsLength: number, flag: number = 5): number {
    const num = parseSingleDecimal(this.valueOf());
    const a = num.origion.split('.');
    let decimals;
    let lastDecimal;
    let diffValue;
    if (a[1]) {
        decimals = a[1].split('').slice(0, decimalsLength + 1);
        if (decimals.length > decimalsLength) {
            lastDecimal = Number(decimals.pop());
            decimals = `${a[0]}.${decimals.join('')}`;
            if (lastDecimal >= flag) {
                diffValue = Number(`${decimals.replace(/\d/g, '0')}${(10).minus(lastDecimal)}`);
                decimals = Number(`${decimals}${lastDecimal}`);
                return decimals.plus(diffValue);
            }
            return Number(decimals);
        }
    }
    return this.valueOf();
};
/**
 * 取绝对值
 * (-0.2).abs() => 0.2
 */
Number.prototype.abs = function abs() {
    return Math.abs(this.valueOf());
};

/**
 * 补零
 * @param {*} type 前缀prefix、后缀append
 * @param {*} num
 * @param {*} len
 * @param {*} ifAddSign 是否添加符号+-
 * @param {*} defaultNum 默认值
 */
function addZero(
    type: string,
    num: number,
    len: number = 0,
    ifAddSign: boolean = false,
    defaultNum: string | number = '0.0'
): string {
    if (type !== 'prefix' && type !== 'append') {
        throw new Error('wrong type, only valid values: prefix, append!');
    }
    if (!/^[-+]?(?:\d+\.)*\d+$/.test(`${num}`)) {
        throw new Error('invalid number!');
    }
    let sign = '';
    const realNum = (num || defaultNum).toString().replace(/^(.)/, (_, $1) => {
        if ($1 === '-') {
            sign = '-';
        } else {
            sign = ifAddSign ? '+' : '';
        }

        return $1 !== '-' && $1 !== '+' ? $1 : '';
    });

    let partLen;
    let result = '';
    if (type === 'prefix') {
        partLen = realNum.replace(/\.\d+$/, '').length;
        result = sign + (len < partLen ? '' : Array(len - partLen + 1).join('0')) + realNum;
    }
    if (type === 'append') {
        partLen = realNum.replace(/^[^.]+\.?/, '').length;
        result =
            sign +
            realNum +
            (partLen === 0 && len > 0 ? '.' : '') +
            (len < partLen ? '' : Array(len - partLen + 1).join('0'));
    }

    return result;
}
/**
 * 前缀补零
 * (0.01).prefixZero(3) => 000.01
 */
Number.prototype.prefixZero = function prefixZero(len, ifAddSign, defaultNum) {
    return addZero('prefix', this.valueOf(), len, ifAddSign, defaultNum);
};
/**
 * 后缀补零
 * (0.01).appendZero(4) => 0.0100
 */
Number.prototype.appendZero = function appendZero(len, ifAddSign, defaultNum) {
    return addZero('append', this.valueOf(), len, ifAddSign, defaultNum);
};

// -------------------- for String
/**
 * 前缀补零
 * ('0.01').prefixZero(3) => 000.01
 */
String.prototype.prefixZero = Number.prototype.prefixZero;
/**
 * 后缀补零
 * ('0.01').appendZero(4) => 0.0100
 */
String.prototype.appendZero = Number.prototype.appendZero;
/**
 * 字符串去除首尾空格
 */
if (typeof String.prototype.trim === 'undefined') {
    String.prototype.trim = function trim() {
        return this.replace(/^[\s\t\n\r]+|[\s\t\n\r]+$/g, '');
    };
}
