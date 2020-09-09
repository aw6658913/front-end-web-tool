import { Alert, Checkbox, message } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';

import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { StateType } from './model';
import LoginComponents from './components/Login';
import styles from './style.less';
import { encrypt } from '@/utils/encryption';
import { cacheLoginStates, getLoginStates, clearLoginStates } from '@/utils/cacheLogin';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = LoginComponents;

interface LoginProps {
    dispatch: Dispatch<any>;
    userAndlogin: StateType;
    submitting: boolean;
}
interface LoginState {
    type: string;
    autoLogin: boolean;
    failTimes: number;
}
export interface FormDataType {
    userName: string;
    password: string;
    mobile?: string;
    captcha?: string;
    loginType?: string; // mobile | account
}

@connect(({ userAndlogin, loading }: { userAndlogin: StateType; loading: { effects: { [key: string]: string } } }) => ({
    userAndlogin,
    submitting: loading.effects['userAndlogin/login']
}))
class Login extends Component<LoginProps, LoginState> {
    loginForm: FormComponentProps['form'] | undefined | null = undefined;

    state: LoginState = {
        type: 'account',
        autoLogin: true,
        failTimes: 0
    };

    rePhone: RegExp = new RegExp('^[1-9]\\d{7}$');

    changeAutoLogin = (e: CheckboxChangeEvent) => {
        this.setState({
            autoLogin: e.target.checked
        });
    };

    handleSubmit = (err: any, values: FormDataType) => {
        const { type, failTimes, autoLogin } = this.state;
        if (!err) {
            const { dispatch } = this.props;
            dispatch({
                type: 'userAndlogin/login',
                payload: {
                    ...values,
                    loginType: type
                },
                failTimesCounter: (status: 'ok' | 'error') => {
                    if (status === 'error') {
                        this.setState({
                            failTimes: failTimes + 1
                        });
                    }
                }
            });

            if (autoLogin) {
                // save account
                cacheLoginStates({
                    [encrypt('autoLoginAccount')]: values
                });
            } else {
                // clear account cache
                clearLoginStates(encrypt('autoLoginAccount'));
            }
        }
    };

    onTabChange = (type: string) => {
        this.setState({ type });
    };

    onGetCaptcha = () =>
        new Promise((resolve, reject) => {
            if (!this.loginForm) {
                return;
            }
            this.loginForm.validateFields(['mobile'], {}, (err: any, values: FormDataType) => {
                if (err) {
                    reject(err);
                } else {
                    const { dispatch } = this.props;
                    ((dispatch({
                        type: 'userAndlogin/getCaptcha',
                        payload: values.mobile
                    }) as unknown) as Promise<any>)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });

    renderMessage = (content: string) => <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;

    /**
     * 用户名当前只支持邮箱和手机
     */

    validateUserName = (rule: any, value: any, callback: Function) => {
        if (value === '') {
            callback();
            return;
        }
        const reEmail = new RegExp(
            '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
        );
        const { rePhone } = this;

        if (reEmail.test(value) || rePhone.test(value)) {
            callback();
        } else {
            callback(rule.message);
        }
    };

    /**
     * 校验手机号码
     */
    validatePhoneNumber = (rule: any, value: any, callback: Function) => {
        const { rePhone } = this;

        if (rePhone.test(value)) {
            callback();
        } else {
            callback(rule.message);
        }
    };

    /**
     * 密码长度至少8位字符
     */
    validatePassword = (rule: any, value: any, callback: Function) => {
        if (value && value.length < 8) {
            callback(rule.message);
        } else {
            callback();
        }
    };

    onClickForgotPassword = (e: MouseEvent) => {
        e.preventDefault();
        message.warn('Please contact administrator.');
    };

    render() {
        const { userAndlogin, submitting } = this.props;
        const { status, loginType, message: loginMessage } = userAndlogin;
        const { type, autoLogin } = this.state;
        const autoLoginAccount = getLoginStates(encrypt('autoLoginAccount')) || {
            userName: '',
            password: ''
        };

        return (
            <div className={styles.main}>
                <LoginComponents
                    defaultActiveKey={type}
                    onTabChange={this.onTabChange}
                    onSubmit={this.handleSubmit}
                    ref={(form: any) => {
                        this.loginForm = form;
                    }}
                >
                    <Tab key="account" tab={formatMessage({ id: 'userandlogin.login.tab-login-credentials' })}>
                        {status === 'error' &&
                            loginType === 'account' &&
                            !submitting &&
                            this.renderMessage(
                                loginMessage || formatMessage({ id: 'userandlogin.login.message-invalid-credentials' })
                            )}
                        <UserName
                            defaultValue={autoLoginAccount.userName}
                            name="userName"
                            placeholder={`${formatMessage({ id: 'userandlogin.login.userName' })}`}
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'userandlogin.userName.required' })
                                },
                                {
                                    validator: this.validateUserName,
                                    message: formatMessage({ id: 'userandlogin.userName.wrong-format' })
                                }
                            ]}
                        />
                        <Password
                            defaultValue={autoLoginAccount.password}
                            name="password"
                            placeholder={`${formatMessage({ id: 'userandlogin.login.password' })}`}
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'userandlogin.password.required' })
                                },
                                {
                                    validator: this.validatePassword,
                                    message: formatMessage({ id: 'userandlogin.password.invalid-length' })
                                }
                            ]}
                            onPressEnter={e => {
                                e.preventDefault();
                                this.loginForm.validateFields(this.handleSubmit);
                            }}
                        />
                    </Tab>
                    <Tab key="mobile" tab={formatMessage({ id: 'userandlogin.login.tab-login-mobile' })} disabled>
                        {status === 'error' &&
                            loginType === 'mobile' &&
                            !submitting &&
                            this.renderMessage(
                                formatMessage({ id: 'userandlogin.login.message-invalid-verification-code' })
                            )}
                        <Mobile
                            name="mobile"
                            placeholder={formatMessage({ id: 'userandlogin.phone-number.placeholder' })}
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'userandlogin.phone-number.required' })
                                },
                                {
                                    validator: this.validatePhoneNumber,
                                    message: formatMessage({ id: 'userandlogin.phone-number.wrong-format' })
                                }
                            ]}
                        />
                        <Captcha
                            name="captcha"
                            placeholder={formatMessage({ id: 'userandlogin.verification-code.placeholder' })}
                            countDown={120}
                            onGetCaptcha={this.onGetCaptcha}
                            getCaptchaButtonText={formatMessage({ id: 'userandlogin.form.get-captcha' })}
                            getCaptchaSecondText={formatMessage({ id: 'userandlogin.captcha.second' })}
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'userandlogin.verification-code.required' })
                                }
                            ]}
                        />
                    </Tab>
                    {/* <>
                        {failTimes > 2 && <PictureCaptcha
                            name="captcha"
                            placeholder={formatMessage({ id: 'userandlogin.verification-code.placeholder' })}
                            countDown={120}
                            onGetCaptcha={this.onGetCaptcha}
                            getCaptchaButtonText={formatMessage({ id: 'userandlogin.form.get-captcha' })}
                            getCaptchaSecondText={formatMessage({ id: 'userandlogin.captcha.second' })}
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'userandlogin.verification-code.required' })
                                }
                            ]}
                        />}
                    </> */}
                    <div>
                        <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
                            <FormattedMessage id="userandlogin.login.remember-me" />
                        </Checkbox>
                        <a style={{ float: 'right' }} href="" onClick={this.onClickForgotPassword}>
                            <FormattedMessage id="userandlogin.login.forgot-password" />
                        </a>
                    </div>
                    <Submit loading={submitting}>
                        <FormattedMessage id="userandlogin.login.login" />
                    </Submit>
                </LoginComponents>
            </div>
        );
    }
}

export default Login;
