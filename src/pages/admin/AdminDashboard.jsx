import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AdminHeader from '../../components/admin/AdminHeader';
import { getSystemStats } from '../../api/adminApi';
import { message } from 'antd';
import './Admin.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_active_users: 0,
        total_deleted_users: 0,
        total_admins: 0,
        total_events: 0,
        active_events: 0,
        total_rss_sources: 0,
        active_rss_sources: 0,
        total_news: 0,
        active_news: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await getSystemStats();
            if (response.code === 200 && response.data) {
                setStats(response.data);
            } else {
                message.error(response.message || 'fetch system stats failed');
            }
        } catch (error) {
            console.error('fetch system stats failed:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('fetch system stats failed');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || 'fetch system stats failed');
                }
            } else {
                message.error('fetch system stats failed, please check your network connection');
            }
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: '用户管理',
            description: '管理系统用户和权限',
            icon: '👥',
            link: '/admin/users',
            color: 'blue'
        },
        {
            title: '事件管理',
            description: '管理热点事件和内容',
            icon: '📅',
            link: '/admin/events',
            color: 'green'
        },
        {
            title: '新闻管理',
            description: '管理新闻内容和分类',
            icon: '📰',
            link: '/admin/news',
            color: 'purple'
        },
        {
            title: 'RSS管理',
            description: '管理RSS源和抓取任务',
            icon: '📡',
            link: '/admin/rss-sources',
            color: 'orange'
        }
    ];

    return (
        <div className="admin-container">
            <AdminHeader />

            <div className="admin-content">
                <div className="page-header">
                    <h1 className="page-title">控制台</h1>
                    <p className="page-subtitle">后台系统数据总览</p>
                </div>

                {/* 统计卡片 */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon users">👥</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.total_active_users || 0)}
                            </div>
                            <div className="stat-label">用户数量</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon events">📅</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.active_events || 0)}
                            </div>
                            <div className="stat-label">事件数量</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon news">📰</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.active_news || 0)}
                            </div>
                            <div className="stat-label">活跃新闻</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon rss">📡</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.active_rss_sources || 0)}
                            </div>
                            <div className="stat-label">RSS源</div>
                        </div>
                    </div>
                </div>

                {/* 快速操作 */}
                <div className="quick-actions-section">
                    <h2 className="section-title">快速跳转</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className={`quick-action-card ${action.color}`}
                            >
                                <div className="action-icon">{action.icon}</div>
                                <div className="action-info">
                                    <h3 className="action-title">{action.title}</h3>
                                    <p className="action-description">{action.description}</p>
                                </div>
                                <div className="action-arrow">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 