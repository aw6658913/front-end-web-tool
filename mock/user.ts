import { Request, Response } from 'express';

function getFakeCaptcha(req: Request, res: Response) {
    return res.json('captcha-xxx');
}
// 代码中会兼容本地 service mock 以及部署站点的静态数据
const accountAdmin = {
    loginName: 'admin@vv.cn',
    userCode: 'fldjflsdlflflsjflsfdls',
    organizeType: 4,
    pwdUpdateTime: '',
    thirdOpenId: '',
    thirdOpenType: ''
};

export default {
    // 支持值为 Object 和 Array
    'POST /mock/api/user/v1/account/getCurrent': {
        code: 10000,
        data: accountAdmin,
        msg: {},
        timeStamp: new Date().getTime()
    },
    'POST /mock/api/user/v1/account/login': (req: Request, res: Response) => {
        const { password, loginName } = req.body;
        if (password === '12345678' && loginName === 'admin@vv.cn') {
            res.send({
                code: 10000,
                data: accountAdmin,
                msg: {},
                timeStamp: new Date().getTime()
            });
            return;
        }
        res.send({
            code: 20001,
            data: {},
            msg: 'Wrong username or password',
            timeStamp: new Date().getTime()
        });
    },
    'POST /mock/api/user/v1/account/logout': (req: Request, res: Response) => {
        res.send({
            code: 10000,
            data: {},
            msg: 'Logout successful',
            timeStamp: new Date().getTime()
        });
    },

    // GET POST 可省略
    'GET /mock/api/users': [
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park'
        },
        {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park'
        },
        {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sidney No. 1 Lake Park'
        }
    ],
    'POST /mock/api/register': (req: Request, res: Response) => {
        res.send({ status: 'ok', currentAuthority: 'user' });
    },
    'GET /mock/api/500': (req: Request, res: Response) => {
        res.status(500).send({
            timestamp: 1513932555104,
            status: 500,
            error: 'error',
            message: 'error',
            path: '/base/category/list'
        });
    },
    'GET /mock/api/404': (req: Request, res: Response) => {
        res.status(404).send({
            timestamp: 1513932643431,
            status: 404,
            error: 'Not Found',
            message: 'No message available',
            path: '/base/category/list/2121212'
        });
    },
    'GET /mock/api/403': (req: Request, res: Response) => {
        res.status(403).send({
            timestamp: 1513932555104,
            status: 403,
            error: 'Unauthorized',
            message: 'Unauthorized',
            path: '/base/category/list'
        });
    },
    'GET /mock/api/401': (req: Request, res: Response) => {
        res.status(401).send({
            timestamp: 1513932555104,
            status: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
            path: '/base/category/list'
        });
    },
    'GET  /mock/api/login/captcha': getFakeCaptcha
};
