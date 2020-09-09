import { Request, Response } from 'express';

const recipeList = [
    {
        id: '000000001',
        heading: '西红柿炒鸡蛋',
        source: '厨房',
        creator: 'lww',
        associate: '微微',
        createTime: '2017-08-09',
        recommend: false,
        type: 'notification',
        coverImage: [
            { thumbUrl: 'http://pic1.zhimg.com/50/v2-60ae41c1784d5588e7ee75addd5a8ff4_hd.jpg', key: +new Date() }
        ]
    }
];

const getRecipe = (req: Request, res: Response) => {
    res.send({
        data: recipeList
    });
};

const getOneRecipe = (req: Request, res: Response) => {
    res.send({
        data: {
            id: '000000001',
            heading: '西红柿炒鸡蛋',
            source: '厨房',
            creator: 'lww',
            associate: '微微',
            createTime: '2017-08-09',
            type: 'notification',
            coverImage: [
                { thumbUrl: 'http://pic1.zhimg.com/50/v2-60ae41c1784d5588e7ee75addd5a8ff4_hd.jpg', key: +new Date() }
            ]
        }
    });
};

const cuisineList = [
    { label: '粤菜', code: 1 },
    { label: '湘菜', code: 2 },
    { label: '闽菜', code: 3 },
    { label: '川菜', code: 4 }
];

const getCuisine = (req: Request, res: Response) => {
    const keyword = req.query.cuisine;
    res.send({
        data: cuisineList.filter(cuisine => cuisine.label.includes(keyword))
    });
};

const recommendRecipe = (req: Request, res: Response) => {
    const { id } = req.body;
    console.log('id', id);
    // eslint-disable-next-line no-restricted-syntax
    for (const recipe of recipeList) {
        if (recipe.id === id) {
            recipe.recommend = !recipe.recommend;
            break;
        }
    }
    res.send({
        data: recipeList
    });
};

export default {
    'GET /mock/api/recipe': getRecipe,
    'GET /mock/api/getOneRecipe': getOneRecipe,
    'GET /mock/api/getCuisine': getCuisine,
    'POST /mock/api/recommendRecipe': recommendRecipe
};
