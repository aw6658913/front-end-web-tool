import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import vvTable from './en-US/vvTable';
import vvPagination from './en-US/vvPagination';
import vvUpload from './en-US/vvUpload';
import menu from './en-US/menu';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';
import uploadAws from './en-US/uploadAws';

export default {
    'navBar.lang': 'Languages',
    'layout.user.link.help': 'Help',
    'layout.user.link.privacy': 'Privacy',
    'layout.user.link.terms': 'Terms',
    'app.preview.down.block': 'Download this page to your local project',
    'app.welcome.link.fetch-blocks': 'Get all block',
    'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
    'sysCs.global.upload.tip': 'You can only upload',
    'sysCs.global.upload.size': 'File must smaller than ',
    'sysCs.global.upload.width': 'Image size width and height are less than 1024',
    'sysCs.global.upload.timeout': 'Upload server timeout',
    'sysCs.global.upload.failed': 'Upload failed',
    'sysCs.global.upload.most': 'Upload at most',
    'sysCs.global.upload.danwei': 'files',
    ...globalHeader,
    ...vvTable,
    ...vvPagination,
    ...vvUpload,
    ...menu,
    ...settingDrawer,
    ...settings,
    ...pwa,
    ...component,
    ...uploadAws
};
