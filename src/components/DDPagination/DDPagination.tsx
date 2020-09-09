import React, { forwardRef } from 'react';
import { Pagination } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

const VVPagination = forwardRef((props: any, ref: any) => {
    const { pageSize = 10, changePageSize = () => {}, changeCurrent = () => {} } = props;

    const PaginationProp = {
        pageSize,
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
        current: 1,
        pageSizeOptions: ['10', '20', '50', '100', '200'],
        onShowSizeChange: (current: number, size: number) => changePageSize(current, size),
        onChange: (page: any, size: number) => changeCurrent(page, size),
        showTotal: (total: number) =>
            `${formatMessage({ id: 'component.vvPagination.total' })} ${total} ${formatMessage({
                id: 'component.vvPagination.item'
            })}`,
        ...props
    };

    return <Pagination {...PaginationProp} ref={ref} />;
});

export default VVPagination;
