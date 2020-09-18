import React, { useState, useEffect } from 'react';
import { Layout, Menu, Icon, Tabs } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import { router } from 'umi';
import { getComponent } from '@/utils/utils';
import RightContent from '@/components/GlobalHeader/RightContent';
import logo from '../assets/logo.png';

const { SubMenu } = Menu;
const { Sider } = Layout;

const { TabPane } = Tabs;

const MainLayout = ({ dispatch, global, ...props }: any) => {
    const { route: routeList = { routes: [] }, location } = props;
    const { tabList = [] } = global;
    const [activeKey, setActiveKey] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState<Array<string>>([]);
    const [selectKeys, setSelectKeys] = useState<Array<string>>([]);

    const onCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const rendMenu = (menuList = []) =>
        menuList.map((item: any) => {
            if (item.component && !item.routes && item.path) {
                return (
                    <Menu.Item key={item.name}>
                        <Link to={item.path} replace={item.path === location.pathname}>
                            <span>{item.title}</span>
                        </Link>
                    </Menu.Item>
                );
            }
            if (item.routes && item.routes.length) {
                return (
                    <SubMenu
                        key={item.name}
                        title={
                            item.icon ? (
                                <span>
                                    <Icon type={item.icon} />
                                    <span>{item.title}</span>
                                </span>
                            ) : null
                        }
                    >
                        {rendMenu(item.routes)}
                    </SubMenu>
                );
            }
            return null;
        });

    // 点击菜单
    const onClickMenu = (item: any) => {
        const isExit = tabList.filter((tabItem: any) => tabItem.key === item.key).length;
        if (!isExit) {
            const menuItem: any = getComponent(item.key, routeList) || {};
            tabList.push({
                key: item.key,
                title: menuItem.title,
                content: menuItem.component
            });
            dispatch({
                type: 'global/saveTabList',
                payload: tabList
            });
        }
        setActiveKey(item.key);
        setSelectKeys(item.key);
    };

    // 展开菜单
    const onOpenChange = (keys: Array<string>) => {
        setOpenKeys([]);
        setOpenKeys(keys);
    };

    // 切换tab
    const changeTab = (tabKey: string) => {
        setActiveKey(tabKey);
        setSelectKeys([tabKey]);
        const currentTab: any = getComponent(tabKey, routeList) || {};
        console.log(routeList.routes);
        router.push(currentTab.path);
    };

    // 删除tab
    const onEdit = (targetKey: string) => {
        // eslint-disable-next-line array-callback-return
        tabList.map((tabItem: any, index: number) => {
            if (tabItem.key === targetKey) {
                tabList.splice(index, 1);
            }
        });
        dispatch({
            type: 'global/saveTabList',
            payload: tabList
        });
        if (tabList.length) {
            setActiveKey(tabList[tabList.length - 1].key);
        }
    };

    // 进页面根据页面路径打开菜单
    useEffect(() => {
        const searchPath = (list = []) => {
            if (list.length) {
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < list.length; i++) {
                    const item: any = list[i];
                    if (!tabList.length && item.name === 'workbench' && location.pathname !== '/workbench') {
                        tabList.push({
                            key: item.name,
                            title: item.title,
                            content: item.component
                        });
                        dispatch({
                            type: 'global/saveTabList',
                            payload: tabList
                        });
                    }
                    if (item.path === location.pathname) {
                        item.key = item.name;
                        console.log(item);
                        onClickMenu(item);
                        break;
                    } else if (item.routes) {
                        searchPath(item.routes);
                    }
                }
            }
        };
        searchPath(routeList.routes);
    }, []);
    /*
    const onClickHover = (e: any) => {
        // message.info(`Click on item ${key}`);
        const { key } = e;

        if (key === '1') {
            setActiveKey(tabList[tabList.length - 1].key);
            onEdit();
        } else if (key === '2') {
            setActiveKey(activeKey);
        } else if (key === '3') {
            tabList.splice(0, tabList.length - 1);
            setActiveKey(tabList[0].key);
        }
        dispatch({
            type: 'global/saveTabList',
            payload: tabList
        });
    };

    const menu = (
        <Menu onClick={onClickHover}>
            <Menu.Item key="1">关闭当前标签页</Menu.Item>
            <Menu.Item key="2">关闭其他标签页</Menu.Item>
            <Menu.Item key="3">关闭全部标签页</Menu.Item>
        </Menu>
    );
    const operations = (
        <Dropdown overlay={menu}>
            <a className="ant-dropdown-link">
                Hover me
                <Icon type="down" />
            </a>
        </Dropdown>
    );
    */
    return (
        <Layout className="dd-layout">
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <Link to="/">
                    <div className="dd-layout-logo">
                        <img src={logo} alt="logo" />
                        {!collapsed ? <div className="dd-layout-logo-text">中国殡葬公共服务平台供需服务</div> : null}
                    </div>
                </Link>
                <Menu
                    mode="inline"
                    theme="dark"
                    onOpenChange={onOpenChange}
                    onClick={onClickMenu}
                    openKeys={openKeys}
                    selectedKeys={selectKeys}
                >
                    {rendMenu(routeList.routes)}
                </Menu>
            </Sider>
            <div style={{ flex: 'auto', background: '#fff' }}>
                <div className="ant-pro-global-header">
                    <Icon
                        className="ant-pro-global-header-trigger"
                        type={collapsed ? 'menu-unfold' : 'menu-fold'}
                        onClick={onCollapsed}
                    />
                    <RightContent />
                </div>
                <Tabs
                    hideAdd
                    type="editable-card"
                    activeKey={activeKey}
                    onChange={changeTab}
                    // tabBarExtraContent={operations}
                    // @ts-ignore
                    onEdit={(targetKey: string) => onEdit(targetKey)}
                >
                    {tabList.map((item: any, index: number) => {
                        if (item.content) {
                            return (
                                <TabPane tab={item.title} key={item.key} closable={index !== 0}>
                                    <div style={{ padding: '0 24px' }}>{React.createElement(item.content)}</div>
                                </TabPane>
                            );
                        }
                        return null;
                    })}
                </Tabs>
            </div>
        </Layout>
    );
};

export default connect(({ global }: any) => ({
    global
}))(MainLayout);
