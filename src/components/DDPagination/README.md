## 概况

基于 antdesign 的 Pagination 组件封装

# 使用示例

```tsx
import VVPagination from '@/components/VVPagination';

const PaginationProp = {
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100', '200']
};

<VVPagination {...PaginationProp} />;
```
