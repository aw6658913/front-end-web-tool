# UploadAwsPlus 使用说明

## 概况

基于 antdesign 的 Upload 组件封装,上传至亚马逊 Aws 服务器.

## 传入参数

-   uploadUrl:上传 url 接口,目前统一接口路径为 "/resource/producePutPreSignUrls"
-   sysCode: 系统代号.如果商家为"Merchant".必传,后端接口需要.
-   businessCode: 业务归属编号.如门店为 "Branch".必传,后端接口需要.
-   categoryCode: 业务类目.如门店头图为 "BranchHead". 营业资质中有两个分别为"acraFile" 及 "acraImage" 必传,后端接口需要.
-   fileList: 类似 antd 中 Upload 中的 fileList.用于展示上传的文件

```js static
// 后端返回的图片数据列表中会带上keyName字段，用于标记删除操作
const showFileList = [{
    uid:
        '1557800792101__0ee23d59-91e3-4eff-9e10-60566e4df49a_3.png',
    keyName:
        '1557800792101__0ee23d59-91e3-4eff-9e10-60566e4df49a_3.png',
    name: '3.png',
    url:
        'https://vv-tech-merchant-private.s3.ap-southeast-1.amazonaws.com/xxx.png
}];
```

-   onFileChange: 回调函数,返回业务页面需要的保存跟展示的数据. 返回参数为: showFileList 及 uploadResource, 分别为修改后的展示的文件列表及需要上传的资源文件.

```js static
const uploadResource = {
    categoryCode: 'BranchHead',
    keyNameAndOpt: ['ADD:1582791173662680b7857-f7b6-4e55-82a8-b6705dfb2339_loading-bird.png']
};
```

-   rules: 校验规则数组，内置的校验规则有 required，fileType，size，自定义校验规则可以编写 validator 函数

```js static
const rules = [
    { required: true, message: '上传文件不能为空' },
    { fileType: ['PNG', 'JPG'], message: '只能上传PNG,JPG' },
    { size: 3, message: '文件大小不能超过3M' },
    { max: 3, message: '文件个数不能超过3个' },
    {
        validator(file, fileList) {
            return true;
        },
        message: '自定义错误'
    }
];
```

-   其他参数,参考 antdesign 的 Upload 组件.本组件内置使用 Upload 参数为 action,beforeUpload,onRemove,onChange.

## 使用示例

```jsx harmony
import React from 'react';
import { Icon, Modal } from 'antd';
import { UploadAwsPlus } from 'vv-frontend-components';

class Demo extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: ''
        };
        this.handleImgPreview = this.handleImgPreview.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.changeFileList = this.changeFileList.bind(this);
        this.setError = this.setError.bind(this);
        this.onRef = this.onRef.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            const showFileList = [
                {
                    uid: '1557800792101__0ee23d59-91e3-4eff-9e10-60566e4df49a_3.png',
                    keyName: '1557800792101__0ee23d59-91e3-4eff-9e10-60566e4df49a_3.png',
                    name: '3.png',
                    url:
                        'https://vv-tech-merchant-private.s3.ap-southeast-1.amazonaws.com/1557968224408__a405d63d-0205-45ea-af2c-968436093cdc_2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20190516T005704Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Credential=AKIAQKAYJ6LPFJQTVYBE%2F20190516%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Signature=49ab1c713b5d2eda4de808681db018cbfdeede728ce7d31d150cc15788b36cb0'
                },
                {
                    uid: '566e4df49a_4.png',
                    keyName: '566e4df49a_4.png',
                    name: '4.png',
                    url:
                        'https://vv-tech-merchant-private.s3.ap-southeast-1.amazonaws.com/1557968224408__a405d63d-0205-45ea-af2c-968436093cdc_2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20190516T005704Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Credential=AKIAQKAYJ6LPFJQTVYBE%2F20190516%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Signature=49ab1c713b5d2eda4de808681db018cbfdeede728ce7d31d150cc15788b36cb0'
                }
            ];
            this.setState({ showFileList });
            this.child.triggerValidate(errors => {
                // console.log('errors callback', errors);
            });
        }, 0);
    }

    // 图片预览
    handleImgPreview(file) {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true
        });
    }

    handleCancel() {
        this.setState({ previewVisible: false });
    }

    changeFileList(showFileList, uploadResource) {
        // console.log(showFileList, uploadResource, 'result');
        this.setState({ showFileList, uploadResource });
    }

    setError(errors) {
        // console.log(errors, 'errors');
        this.setState({ errors });
    }

    onRef(ref) {
        this.child = ref;
    }

    render() {
        const { previewVisible, previewImage, showFileList, uploadResource } = this.state;

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div>Upload</div>
            </div>
        );

        const rules = [
            {
                required: true,
                message: '上传文件不能为空'
            },
            {
                fileType: ['PNG', 'JPG'],
                message: '只能上传PNG,JPG'
            },
            {
                size: 3,
                message: '文件大小不能超过3M'
            },
            { max: 3, message: '文件个数不能超过3个' },
            {
                validator(file, fileList) {
                    return true;
                },
                message: '自定义错误'
            }
        ];

        return (
            <div>
                <UploadAwsPlus
                    draggable={true}
                    onPreview={this.handleImgPreview}
                    listType="picture-card"
                    uploadUrl="/api/resource/producePutPreSignUrls"
                    sysCode="Merchant"
                    businessCode="Branch"
                    categoryCode="BranchHead"
                    fileList={showFileList}
                    onFileChange={this.changeFileList}
                    onError={this.setError}
                    rules={rules}
                    multiple={true}
                    showErrorMsg={true}
                    onRef={this.onRef}
                >
                    {uploadButton}
                </UploadAwsPlus>

                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        );
    }
}

<Demo />;
```
