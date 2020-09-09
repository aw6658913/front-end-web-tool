import React from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/es/table';

const TablePagination:React.FC<TableProps<any>> = props => (
    <Table
        {...props}
    />
);

export default TablePagination;
