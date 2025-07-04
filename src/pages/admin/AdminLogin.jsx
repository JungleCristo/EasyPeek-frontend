import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import { adminLogin } from '../../api/adminApi';
import './Admin.css';
import './AdminLogin.css';



const AdminLogin = () => {
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await adminLogin(values);

            if (response.code === 200) {
                message.success('Login successful!');
                navigate('/admin');
            } else {
                console.warn('Login failed:', response.data.message);
                message.error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToSite = () => {
        navigate('/');
    };

    return (
        <div className="admin-container">

            <div className="admin-content">
                <div className="login-header">
                    <div className="back-button">
                        <Button
                            type="text"
                            onClick={handleBackToSite}
                            className="back-btn"
                        >
                            ← 返回主站
                        </Button>
                    </div>
                    <div className="theme-toggle-wrapper">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="login-form-wrapper">
                    <Card className="login-card">
                        <div className="login-title-section">
                            <div className="admin-icon">
                                <CrownOutlined />
                            </div>
                            <h1 className="login-title">后台登录</h1>
                            <p className="login-subtitle">EasyPeek 后台控制台</p>
                        </div>

                        <Form
                            name="admin-login"
                            onFinish={handleLogin}
                            autoComplete="off"
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="username"
                                rules={[
                                    { required: true, message: '请输入管理员用户名' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="管理员用户名"
                                    autoComplete="username"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: '请输入密码' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="密码"
                                    autoComplete="current-password"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className="login-button"
                                >
                                    登录
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin; 