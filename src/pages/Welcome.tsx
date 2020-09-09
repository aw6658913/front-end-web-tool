import React from 'react';
import { Card, Typography, Divider } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from './Welcome.less';
import logo from '@/assets/logo.png';

export default (): React.ReactNode => (
    <PageHeaderWrapper>
        <Card className={styles.welcome}>
            <Typography>
                <Divider className={styles.titleDivider}>Welcome</Divider>
            </Typography>
            <Typography className={styles.titleWrapper}>
                <Typography.Paragraph className={styles.logoWrapper}>
                    <img src={logo} alt="logo" className={styles.logo} /> 大地人本
                </Typography.Paragraph>
                <Typography.Title level={3} className={styles.text}>
                    <strong>E</strong>
                    <span>nterprise</span>
                    <br />
                    <strong
                        style={{
                            marginLeft: '1.4em'
                        }}
                    >
                        O
                    </strong>
                    <span>peration</span>
                    <br />
                    <strong
                        style={{
                            marginLeft: '2.8em'
                        }}
                    >
                        M
                    </strong>
                    <span>anagement</span>
                    <br />
                    <strong
                        style={{
                            marginLeft: '4.2em'
                        }}
                    >
                        P
                    </strong>
                    <span>latform</span>
                </Typography.Title>
            </Typography>
        </Card>
    </PageHeaderWrapper>
);
