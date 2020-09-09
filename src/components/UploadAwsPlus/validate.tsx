const fileRulesMap = {
    fileType: {
        validator: (val, file) => {
            const extension = file.name.split('.')[1];
            return val.some(item => item.toUpperCase() === extension.toUpperCase());
        },
        message: val => `you can only upload ${val.join(',')}`
    },
    size: {
        validator: (val, file) => file.size / 1024 / 1024 < val,
        message: val => `file must smaller than ${val}mb`
    }
};

const listRulesMap = {
    required: {
        validator: (val, fileList, existFileList) => fileList.length + existFileList.length,
        message: 'must upload one file'
    },
    max: {
        validator: (val, fileList, existFileList) => fileList.length + existFileList.length <= val,
        message: val => `maximum file number is ${val}`
    }
};

const validateRules = async ({ rules, fileList = [], file = null, existFileList = [] }) => {
    const errors = new Set();
    const fileRulesKeys = Object.keys(fileRulesMap);
    const listRulesKeys = Object.keys(listRulesMap);
    console.log(rules);
    for (let i = 0; i < rules.length; i += 1) {
        const item = rules[i];
        const itemKeys = Object.keys(item);
        for (let j = 0; j < itemKeys.length; j += 1) {
            const ruleKey = itemKeys[j];
            const val = item[ruleKey];
            if (fileRulesKeys.includes(ruleKey)) {
                const ruleObj = fileRulesMap[ruleKey];
                fileList
                    .filter(fileItem => fileItem.name)
                    .forEach(fileItem => {
                        if (!ruleObj.validator(val, fileItem)) {
                            errors.add(item.message || ruleObj.message(val));
                        }
                    });
            }

            if (listRulesKeys.includes(ruleKey)) {
                const ruleObj = listRulesMap[ruleKey];
                if (!ruleObj.validator(val, fileList, existFileList)) {
                    errors.add(item.message || ruleObj.message(val));
                }
            }

            if (ruleKey === 'validator' && typeof item.validator === 'function') {
                // eslint-disable-next-line no-await-in-loop
                const res = await item.validator(file, fileList);
                console.log('res', res);
                if (file && !res) errors.add(item.message);
            }
        }
    }
    /*     rules.forEach(item => {
        // 一个规则可以包含多个默认校验
        Object.keys(item).forEach(async ruleKey => {
            const val = item[ruleKey];
            if (fileRulesKeys.includes(ruleKey)) {
                const ruleObj = fileRulesMap[ruleKey];
                fileList
                    .filter(fileItem => fileItem.name)
                    .forEach(fileItem => {
                        if (!ruleObj.validator(val, fileItem)) {
                            errors.add(item.message || ruleObj.message(val));
                        }
                    });
            }

            if (listRulesKeys.includes(ruleKey)) {
                const ruleObj = listRulesMap[ruleKey];
                if (!ruleObj.validator(val, fileList, existFileList)) {
                    errors.add(item.message || ruleObj.message(val));
                }
            }

            if (ruleKey === 'validator' && typeof item.validator === 'function') {
                const res = await item.validator(file, fileList)
                console.log('res', res)
                if (file && !res) errors.add(item.message);
            }
        });
    });
*/
    // eslint-disable-next-line compat/compat
    if (Array.from) {
        // eslint-disable-next-line compat/compat
        return Array.from(errors);
    }
    return [].slice.call(errors);
};

export default validateRules;
