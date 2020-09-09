# UploadAws 使用说明

## 概况

基于 antdesign 的 Upload 组件封装,上传至亚马逊 Aws 服务器.

## 传入参数

-   uploadUrl:上传 url 接口,目前统一接口路径为 "/resource/producePutPreSignUrls"
-   checkFileType: 上传限定的文件格式,多种文件格式用","隔开. 例如"PNG,JPG",如不需要限制,可不传该参数.
-   checkFileSize: 上传限定的文件大小,单位为 MB. 例:checkFileSize={3},表示上传文件大小不能超过 3m.
-   sysCode: 系统代号.如果商家为"Merchant".必传,后端接口需要.
-   businessCode: 业务归属编号.如门店为 "Branch".必传,后端接口需要.
-   categoryCode: 业务类目.如门店头图为 "BranchHead". 营业资质中有两个分别为"acraFile" 及 "acraImage" 必传,后端接口需要.
-   fileList: 同原组件 Upload 中的 fileList.用于展示上传的文件.
-   uploadResource: 需要上传的资源文件,对象结构为 {categoryCode:'',keyNameAndOpt:[]} 初始化可为 null，对象通过 setFileList 返回。
-   setFileList: 回调函数,返回业务页面需要的保存跟展示的数据. 返回参数为: showFileList 及 uploadResource, 分别为修改后的展示的文件列表及需要上传的资源文件.
-   dragAble: 是否拖拽上传
-   isSingle: 是否无删除按钮，单图上传覆盖。 默认为否
-   checkFileTypeMsg 上传限定的文件格式不符合提示信息
-   checkFileSizeMsg 上传的文件大小不符合提示信息
-   其他参数,参考 antdesign 的 Upload 组件.本组件内置使用 Upload 参数为 action,beforeUpload,onRemove,onChange.

## 使用示例

```jsx harmony
import React from 'react';
import { Icon, Modal } from 'antd';
import { UploadAws } from 'vv-frontend-components';

class Demo extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: '',
            showFileList: [],
            uploadResource: null
        };
        this.handleImgPreview = this.handleImgPreview.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.changeFileList = this.changeFileList.bind(this);
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
        }, 2000);
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
        this.setState({ showFileList, uploadResource });
    }

    render() {
        const { previewVisible, previewImage, showFileList, uploadResource } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div>Upload</div>
            </div>
        );

        return (
            <div>
                <UploadAws
                    listType="picture-card"
                    multiple
                    onPreview={this.handleImgPreview}
                    uploadUrl="/api/resource/producePutPreSignUrls"
                    checkFileType="PNG,JPG"
                    checkFileSize={3}
                    sysCode="Merchant"
                    businessCode="Branch"
                    categoryCode="BranchHead"
                    uploadResource={uploadResource}
                    fileList={showFileList}
                    setFileList={this.changeFileList}
                    checkFileTypeMsg={'只能上传PNG,JPG'}
                    checkFileSizeMsg={'文件大小不能超过3MB'}
                >
                    {uploadButton}
                </UploadAws>

                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        );
    }
}

<Demo />;
```
