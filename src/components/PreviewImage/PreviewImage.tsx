import React from 'react';
import { Modal } from 'antd';

interface PreviewImageProps {
    previewVisible?: boolean;
    imgSrc?: string | undefined;
    closePreview?: Function;
}

const PreviewImage: React.FC<PreviewImageProps> = props => {
    const { previewVisible = false, imgSrc, closePreview = () => {} } = props;
    return (
        <Modal
            key={`preview${new Date().getTime()}`}
            visible={previewVisible}
            footer={null}
            onCancel={() => closePreview()}
        >
            <div style={{ textAlign: 'center' }}>
                <img alt="preview" style={{ maxWidth: '100%', padding: '15px' }} src={imgSrc} />
            </div>
        </Modal>
    );
};

export default PreviewImage;
