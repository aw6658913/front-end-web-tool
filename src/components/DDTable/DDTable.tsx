import React, { forwardRef } from 'react';
import { Table } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import DDPagination from '../DDPagination';

const DDTable = forwardRef((props: any, ref: any) => {
    const {
        dataSource = [],
        columns = [],
        loading = false,
        bordered = false,
        rowKey,
        pagination = {},
        isPag = true,
        isShowTablePag = false, // 是否显示列表分页，当该字段为true时，isPag设置值无效不显示自定义分页器
        expandTableParame = {}
    } = props;

    const PaginationProp = {
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100', '200'],
        showTotal: (total: number) =>
            `${formatMessage({ id: 'component.vvPagination.total' })} ${total} ${formatMessage({
                id: 'component.vvPagination.item'
            })}`,
        ...pagination
    };

    return (
        <div>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={rowKey}
                bordered={bordered}
                pagination={isShowTablePag ? PaginationProp : false}
                loading={loading}
                locale={{ emptyText: `${formatMessage({ id: 'component.vvTable.empty' })}` }}
                {...expandTableParame}
                ref={ref}
            />
            {isPag && !isShowTablePag && dataSource && dataSource.length ? (
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                    <DDPagination {...pagination} />
                </div>
            ) : null}
        </div>
    );
});

export default DDTable;
