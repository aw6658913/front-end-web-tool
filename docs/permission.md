# 权限管理

---

## 1. 权限编码的概念

ant-design-pro 是根据用户的角色来进行鉴权的

基于角色是可自定义的，我们将采用权限编码来替换角色进行鉴权

权限编码由后端 api 返回，一条权限编码大约是这个样子：

```javascript
    PermissionItem {
        id: number; // ID编码
        code: string; // 唯一标识，用于查询models/permission.ts: authorizedOperations(code)的参数
        parentCode: string; // 父级权限编码，与父级的code是对应的(暂时也没用)
        // permission: string; // 权限编码，是唯一的(这个字段等同于code字段，区别在于code采用大驼峰形式，permission采用:分割的小写形式)
        name: string; // 名称，某个菜单的名称或者是某个按钮的名称，如：个人管理(暂时没有除了用作备注辅助开发人员理解对应的意思外，没其他用)
        url: string; // 路由(后端返回的暂时没用，由前端控制)
        type: PermissionItemType; // 权限的类型
        // enable: boolean; // 是否可用，有权限但是这个值是false的时候，是disabled状态(暂时没有用)
        sort: number; // 排序编码，数值越小越靠前 这个只针对与type不是PermissionItemType.button才有用
        loadedOperations: boolean; // 是否已经加载了子权限
    }
```

其中 PermissionItem.code 就是权限编码，在我们使用时只需要指定 authority=\${PermissionItem.code}就可以进行鉴权

### 1.1 如何查看所有的权限编码

1. 通过 ReduxDevTool 面板查看 state.permission.mapping，这是一个所有权限的 mapping
2. 通过 docs/allPermissions.json

## 2. 数据鉴权

所有的数据鉴权都在后端处理，如果前端请求某一个无权限的接口，那么会返回 401/403 的状态

当请求接口返回 401/403 状态，系统将会自动跳转到登录页面

## 3. 路由鉴权

路由鉴权是通过路由配置表的 authority 字段进行配置

示例代码：

```javascript
    {
        path: 'list', // 路由url
        name: 'orderList',
        component: './sysOrderCenter/list',
        authority: 'OrderList' // 指定权限编码
        sort: 3000, // 排序值，一般api提供
    },
```

## 4. 菜单鉴权

菜单鉴权与路由鉴权相同，因为菜单是基于路由配置而显示

其中菜单的显示是有先后顺序的，后端返回的数据中会存在 sort 这个字段，它们是根据这个字段做排序的。

其他非后端返回的路由菜单的排序，可以在路由配置表中添加 sort 字段，并分配一个合理数值，即可。

sort 字段的排序规则是：从小到大进行排序，数值越小，排序越靠前，反之越靠后

## 5. 组件鉴权 & 操作鉴权

操作鉴权，指某些按钮是否有权限使用

通过 Authorized 组件进行鉴权，如下 demo：

```html
    import Authorized from '@/components/Authorized/utils/Authorized';

    // 示例1：有权限的Button
    <Authorized authority="OrderListQuery">
        <Button>有权限的Button</Button>
    </Authorized>

    // 示例2：无权限的Button，不显示
    <Authorized authority="OrderListQueryX">
        <Button>无权限的Button，不显示</Button>
    </Authorized>


    // 无权限的Button，显示为disabled状态
    <Authorized authority="OrderListQueryX" noMatch={<Button disabled>无权限的Button</Button>}&t;
        <Button>无权限的Button，显示disabled状态</Button>
    </Authorized>

    // 通过hasPermissions进行判断
    {Authorized.hasPermissions('OrderListQueryX') ? (
        <Button>有权限访问的Button</Button>
    ) : (
        <Button disabled>无权限访问的Button</Button>
    )}

    <Authorized>和Authorized.hasPermissions()的区别：
        1. <Authorized>可以执行异步判断和渲染
        2. Authorized.hasPermissions()只能同步判断
```

通过 authority 属性进行分配选线码，noMatch 属性用于处理没有权限的情况下要显示的内容

## 6. 参考文档

[ant-design-pro 的权限管理](https://pro.ant.design/docs/authority-management-cn)

---

[返回 README](../README.md)
