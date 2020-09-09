import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import vvTable from './zh-CN/vvTable';
import vvPagination from './zh-CN/vvPagination';
import menu from './zh-CN/menu';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import uploadAws from './zh-CN/uploadAws';
import vvUpload from './zh-CN/vvUpload';

export default {
    'navBar.lang': '语言',
    'layout.user.link.help': '帮助',
    'layout.user.link.privacy': '隐私',
    'layout.user.link.terms': '条款',
    'app.preview.down.block': '下载此页面到本地项目',
    'app.welcome.link.fetch-blocks': '获取全部区块',
    'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
    'sysCs.global.upload.tip': '您只可上传',
    'sysCs.global.upload.size': '文件必须小于 ',
    'sysCs.global.upload.width': '图片宽度高度必须小于 1024',
    'sysCs.global.upload.timeout': '上传服务超时',
    'sysCs.global.upload.failed': '上传失败',
    'sysCs.global.upload.most': '上传最多',
    'sysCs.global.upload.danwei': '文件',
    ...globalHeader,
    ...vvTable,
    ...vvPagination,
    ...menu,
    ...settingDrawer,
    ...settings,
    ...pwa,
    ...component,
    ...uploadAws,
    ...vvUpload
};
