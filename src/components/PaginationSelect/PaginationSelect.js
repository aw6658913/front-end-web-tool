import React from 'react';
import { Select } from 'antd';

/*
    服务端分页搜索select组件
    例子：
    dataSource = { keyword: '', pageSize: 10, pageNo: 1, pages: 1, rows: [] }
    <PaginationSelect
        showSearch
        allowClear
        labelInValue
        onSearch={handleSearchUser}
        showArrow={false}
        filterOption={false}
        dataSource={dataSource}
        placeholder={formatMessage({ id: 'recipe.edit.relation.user.placeholder' })}
    />
    const handleSearchUser = (val, pageNo = 1) => {
        if (!val.replace(/\s+/g, '')) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            dispatch({
                type: 'recipe/searchUsers',
                payload: {
                    searchName: val,
                    pageNo,
                    pageSize: 10
                },
                callback: res => {
                    const { rows } = res.data;
                    console.log(res.data);
                    if (rows) {
                        if (pageNo === 1) {
                            setUserData({
                                ...userData,
                                keyword: val,
                                ...res.data,
                                rows: rows.map(user => ({
                                    key: user.userCode,
                                    label: `${user.firstName}${user.lastName}`
                                }))
                            });
                        } else {
                            setUserData({
                                ...userData,
                                keyword: val,
                                ...res.data,
                                rows: [
                                    ...userData.rows,
                                    ...rows.map(user => ({
                                        key: user.userCode,
                                        label: `${user.firstName}${user.lastName}`
                                    }))
                                ]
                            });
                        }
                    }
                }
            });
        }, 500);
    };
*/

class PaginationSelect extends React.PureComponent {
    onSelect = val => {
        const { onChange } = this.props;
        // eslint-disable-next-line no-unused-expressions
        onChange && onChange(val);
    };

    onPopupScroll = e => {
        e.persist();
        const { target } = e;
        if (Math.floor(target.scrollTop + target.offsetHeight + 30) >= target.scrollHeight) {
            const {
                dataSource: { pages, pageNo, keyword },
                onSearch
            } = this.props;
            const nextPage = pageNo + 1;
            if (nextPage > pages) return;
            onSearch(keyword, nextPage);
        }
    };

    render() {
        const { dataSource } = this.props;
        return (
            <Select {...this.props} onSelect={this.onSelect} onPopupScroll={this.onPopupScroll}>
                {dataSource.rows.map(data => (
                    <Select.Option key={data.key}>{data.label}</Select.Option>
                ))}
            </Select>
        );
    }
}

export default PaginationSelect;
