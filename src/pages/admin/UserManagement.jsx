import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Modal, Form, message, Space, Tag, Popconfirm } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import {
    getUsers,
    updateUser,
    deleteUser,
} from '../../api/adminApi';
import './Admin.css';
import './UserManagement.css';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        status: ''
    });
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                ...filters
            };
            const response = await getUsers(params);
            if (response.code === 200 && response.data) {
                setUsers(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.total || 0
                }));
            } else {
                message.error(response.message || '获取用户列表失败');
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '获取用户列表失败');
                }
            } else {
                message.error('获取用户列表失败，请检查网络连接');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setEditModalVisible(true);
    };

    const handleDelete = async (userId) => {
        try {
            const response = await deleteUser(userId);
            if (response.code === 200) {
                message.success('用户删除成功');
                fetchUsers();
            } else {
                message.error(response.message || '删除用户失败');
            }
        } catch (error) {
            console.error('删除用户失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '删除用户失败');
                }
            } else {
                message.error('删除用户失败，请检查网络连接');
            }
        }
    };

    const handleSave = async (values) => {
        try {
            if (editingUser) {
                const response = await updateUser(editingUser.id, values);
                if (response.data.code === 200) {
                    message.success('用户信息更新成功');
                    setEditModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                    fetchUsers();
                } else {
                    message.error(response.data.message || '更新失败');
                }
            } else {
                // 后端未提供管理员创建用户接口
                message.error('暂不支持创建用户功能，请联系系统管理员');
            }
        } catch (error) {
            console.error('保存失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '保存用户失败');
                }
            } else {
                message.error('保存用户失败，请检查网络连接');
            }
        }
    };

    const handleTableChange = (pag, filters, sorter) => {
        setPagination({
            ...pagination,
            current: pag.current,
            pageSize: pag.pageSize
        });
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            active: { color: 'green', text: '活跃' },
            inactive: { color: 'orange', text: '非活跃' },
            suspended: { color: 'red', text: '已封禁' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getRoleTag = (role) => {
        const roleConfig = {
            user: { color: 'blue', text: '普通用户' },
            admin: { color: 'purple', text: '管理员' },
            system: { color: 'red', text: '系统管理员' }
        };
        const config = roleConfig[role] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: '用户ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            sorter: true
        },
        {
            title: '头像',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (avatar, record) => (
                <div className="user-avatar">
                    <img
                        src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.username}`}
                        alt={record.username}
                        onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.username}`;
                        }}
                    />
                </div>
            )
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            sorter: true
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role) => getRoleTag(role),
            filters: [
                { text: '普通用户', value: 'user' },
                { text: '管理员', value: 'admin' },
                { text: '系统管理员', value: 'system' }
            ]
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
            filters: [
                { text: '活跃', value: 'active' },
                { text: '非活跃', value: 'inactive' },
                { text: '已封禁', value: 'suspended' }
            ]
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: true,
            render: (date) => new Date(date).toLocaleString('zh-CN')
        },
        {
            title: '操作',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="确定要删除这个用户吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="admin-container">
            <AdminHeader />

            <div className="admin-content">
                <div className="page-header">
                    <h1 className="page-title">用户管理</h1>
                    <p className="page-subtitle">管理系统用户和权限设置</p>
                </div>

                <div className="content-card">
                    <div className="card-header">
                        <div className="header-left">
                            <h2>用户列表</h2>
                        </div>
                        <div className="header-right">
                            <Space>
                                <Search
                                    placeholder="搜索用户名或邮箱"
                                    allowClear
                                    onSearch={handleSearch}
                                    className="admin-search-input"
                                    enterButton={<SearchOutlined style={{ fontSize: 18 }} />}
                                />
                                <Select
                                    placeholder="角色筛选"
                                    allowClear
                                    style={{ width: 120 }}
                                    onChange={(value) => handleFilterChange('role', value)}
                                >
                                    <Option value="user">普通用户</Option>
                                    <Option value="admin">管理员</Option>
                                    <Option value="system">系统管理员</Option>
                                </Select>
                                <Select
                                    placeholder="状态筛选"
                                    allowClear
                                    style={{ width: 120 }}
                                    onChange={(value) => handleFilterChange('status', value)}
                                >
                                    <Option value="active">活跃</Option>
                                    <Option value="inactive">非活跃</Option>
                                    <Option value="suspended">已封禁</Option>
                                </Select>
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    disabled
                                    title="后端暂未提供管理员创建用户接口"
                                    onClick={() => {
                                        message.info('暂不支持创建用户功能，请联系系统管理员');
                                    }}
                                >
                                    新增用户
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchUsers}
                                >
                                    刷新
                                </Button>
                            </Space>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`,
                            pageSizeOptions: ['10', '20', '50', '100']
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1000 }}
                    />
                </div>
            </div>

            {/* 编辑用户模态框 */}
            <Modal
                title={editingUser ? '编辑用户' : '新增用户'}
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 3, max: 20, message: '用户名长度为3-20个字符' }
                        ]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select placeholder="请选择角色">
                            <Option value="user">普通用户</Option>
                            <Option value="admin">管理员</Option>
                            <Option value="system">系统管理员</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select placeholder="请选择状态">
                            <Option value="active">活跃</Option>
                            <Option value="inactive">非活跃</Option>
                            <Option value="suspended">已封禁</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={() => {
                                    setEditModalVisible(false);
                                    setEditingUser(null);
                                    form.resetFields();
                                }}
                            >
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? '更新' : '创建'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;