## 概况

基于 antdesign 的 Table 组件封装

# 使用示例

```tsx
import VVTable from '@/components/VVTable';

const data = [{
    showName: '显示名称',
    branchName: '类名',
    description: '描述描述'
}];

// 列表表头
const columns: Array<any> = [
    {
        title: <FormattedMessage id="显示名称" />,
        dataIndex: 'showName',
        align: 'center',
        key: 'showName',
        width: 150
    },
    {
        title: <FormattedMessage id="类名" />,
        dataIndex: 'branchName',
        align: 'center',
        key: 'branchName'
    },
    {
        title: <FormattedMessage id="描述" />,
        dataIndex: 'description',
        align: 'center',
        key: 'description',
        width: 150
    }
];

const changeCurrent = (page: number, size: number) => {

}

const changePageSize = (page: number, size: number) => {

}

const paginationProps: any = {
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100', '200']
    changeCurrent: (page: any) => changeCurrent({ current: page }),
    changePageSize: (size: number) => changePageSize(size)
};

<VVTable
    columns={columns}
    rowKey="id"
    dataSource={data}
    pagination={paginationProps}
/>
```
