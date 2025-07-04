import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Modal, Form, message, Space, Tag, Popconfirm, Switch } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import {
    getRssSources,
    createRssSource,
    updateRssSource,
    deleteRssSource,
    fetchRssSource,
    fetchAllRssSources,
} from '../../api/adminApi';
import './Admin.css';
import './RSSManagement.css';

const { Search } = Input;
const { TextArea } = Input;

const RSSManagement = () => {
    const navigate = useNavigate();
    const [rssSources, setRssSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingLoading, setFetchingLoading] = useState({});
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingSource, setEditingSource] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [form] = Form.useForm();

    useEffect(() => {
        fetchRssSources();
    }, [pagination.current, pagination.pageSize]);

    const fetchRssSources = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize
            };
            const response = await getRssSources(params);
            if (response.code === 200 && response.data) {
                setRssSources(response.data.rss_sources);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || 0
                }));
            } else {
                message.error(response.message || '获取RSS源列表失败');
            }
        } catch (error) {
            console.error('获取RSS源列表失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '获取RSS源列表失败');
                }
            } else {
                message.error('获取RSS源列表失败，请检查网络连接');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (source) => {
        setEditingSource(source);
        form.setFieldsValue({
            name: source.name,
            url: source.url,
            description: source.description,
            category: source.category,
            fetch_interval: source.fetch_interval,
            is_active: source.is_active
        });
        setEditModalVisible(true);
    };

    const handleDelete = async (sourceId) => {
        try {
            const response = await deleteRssSource(sourceId);
            if (response.code === 200) {
                message.success('RSS源删除成功');
                fetchRssSources();
            } else {
                message.error(response.message || '删除RSS源失败');
            }
        } catch (error) {
            console.error('删除RSS源失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '删除RSS源失败');
                }
            } else {
                message.error('删除RSS源失败，请检查网络连接');
            }
        }
    };

    const handleSave = async (values) => {
        try {
            const response = editingSource
                ? await updateRssSource(editingSource.id, values)
                : await createRssSource(values);

            if (response.code === 200) {
                message.success(editingSource ? 'RSS源更新成功' : 'RSS源创建成功');
                setEditModalVisible(false);
                setEditingSource(null);
                form.resetFields();
                fetchRssSources();
            } else {
                message.error(response.message || '保存失败');
            }
        } catch (error) {
            console.error('保存失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '保存RSS源失败');
                }
            } else {
                message.error('保存RSS源失败，请检查网络连接');
            }
        }
    };

    const handleFetchSource = async (sourceId) => {
        setFetchingLoading(prev => ({ ...prev, [sourceId]: true }));
        try {
            const response = await fetchRssSource(sourceId);
            if (response.code === 200) {
                message.success(response.message || 'RSS源抓取任务已开始');
                fetchRssSources(); // Refresh list to show updated status
            } else {
                message.error(response.message || 'RSS源抓取失败');
            }
        } catch (error) {
            console.error('RSS源抓取失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || 'RSS源抓取失败');
                }
            } else {
                message.error('RSS源抓取失败，请检查网络连接');
            }
        } finally {
            setFetchingLoading(prev => ({ ...prev, [sourceId]: false }));
        }
    };

    const handleFetchAll = async () => {
        setLoading(true);
        try {
            const response = await fetchAllRssSources();
            if (response.code === 200) {
                message.success(response.message || '所有RSS源的抓取任务已开始');
                fetchRssSources(); // Refresh list
            } else {
                message.error(response.message || '批量抓取失败');
            }
        } catch (error) {
            console.error('批量抓取失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '批量抓取失败');
                }
            } else {
                message.error('批量抓取失败，请检查网络连接');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pag) => {
        setPagination({
            ...pagination,
            current: pag.current,
            pageSize: pag.pageSize
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60
        },
        {
            title: 'RSS源名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true
        },
        {
            title: 'RSS地址',
            dataIndex: 'url',
            key: 'url',
            ellipsis: true,
            render: (url) => (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                </a>
            )
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            render: (category) => <Tag color="blue">{category}</Tag>
        },
        {
            title: '状态',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? '启用' : '禁用'}
                </Tag>
            )
        },
        {
            title: '抓取间隔(分钟)',
            dataIndex: 'fetch_interval',
            key: 'fetch_interval',
            width: 120
        },
        {
            title: '最后抓取时间',
            dataIndex: 'last_fetch_time',
            key: 'last_fetch_time',
            width: 150,
            render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '未抓取'
        },
        {
            title: '操作',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="default"
                        size="small"
                        icon={<SyncOutlined />}
                        loading={fetchingLoading[record.id]}
                        onClick={() => handleFetchSource(record.id)}
                        title="立即抓取"
                    />
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="确定要删除这个RSS源吗？"
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
                    <h1 className="page-title">RSS源管理</h1>
                    <p className="page-subtitle">管理新闻RSS源和抓取设置</p>
                </div>

                <div className="content-card">
                    <div className="card-header">
                        <div className="header-left">
                            <h2>RSS源列表</h2>
                        </div>
                        <div className="header-right">
                            <Space>
                                <Button
                                    type="default"
                                    icon={<SyncOutlined />}
                                    loading={loading}
                                    onClick={handleFetchAll}
                                >
                                    批量抓取
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setEditingSource(null);
                                        form.resetFields();
                                        setEditModalVisible(true);
                                    }}
                                >
                                    新增RSS源
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchRssSources}
                                >
                                    刷新
                                </Button>
                            </Space>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={rssSources}
                        rowKey="id"
                        loading={loading}
                        pagination={pagination}
                        onChange={handleTableChange}
                    />
                </div>
            </div>

            {/* 编辑RSS源模态框 */}
            <Modal
                title={editingSource ? '编辑RSS源' : '新增RSS源'}
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingSource(null);
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
                        name="name"
                        label="RSS源名称"
                        rules={[{ required: true, message: '请输入RSS源名称' }]}
                    >
                        <Input placeholder="请输入RSS源名称" />
                    </Form.Item>

                    <Form.Item
                        name="url"
                        label="RSS地址"
                        rules={[
                            { required: true, message: '请输入RSS地址' },
                            { type: 'url', message: '请输入有效的URL地址' }
                        ]}
                    >
                        <Input placeholder="https://example.com/rss.xml" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                    >
                        <TextArea placeholder="请输入RSS源描述" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="分类"
                        rules={[{ required: true, message: '请输入分类' }]}
                    >
                        <Input placeholder="例如：科技、财经、体育等" />
                    </Form.Item>

                    <Form.Item
                        name="fetch_interval"
                        label="抓取间隔(分钟)"
                        rules={[{ required: true, message: '请输入抓取间隔' }]}
                        initialValue={60}
                    >
                        <Input
                            type="number"
                            placeholder="默认60分钟"
                            min={1}
                            max={1440}
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="启用状态"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch
                            checkedChildren="启用"
                            unCheckedChildren="禁用"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={() => {
                                    setEditModalVisible(false);
                                    setEditingSource(null);
                                    form.resetFields();
                                }}
                            >
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingSource ? '更新' : '创建'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RSSManagement; 