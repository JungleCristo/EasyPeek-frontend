import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { adminLogout, getCurrentAdminUser } from '../../api/adminApi';
import { message } from 'antd';
import ThemeToggle from '../ThemeToggle';
import './AdminHeader.css';

const AdminHeader = () => {
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        const user = getCurrentAdminUser();
        setAdminUser(user);
    }, []);

    const handleLogout = async () => {
        try {
            await adminLogout();
            message.success('Logout successful!');
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/admin/login');
        }
    };

    const handleBackToSite = () => {
        window.open('/', '_blank');
    };

    const navItems = [
        { path: '/admin', label: '控制台', icon: '🏠' },
        { path: '/admin/users', label: '用户管理', icon: '👥' },
        { path: '/admin/rss-sources', label: 'RSS管理', icon: '📡' },
        { path: '/admin/news', label: '新闻管理', icon: '📰' },
        { path: '/admin/events', label: '事件管理', icon: '📅' }
    ];

    return (
        <header className={`admin-header ${theme}`}>
            <div className="admin-header-content">
                <div className="admin-header-left">
                    <Link to="/admin" className="admin-logo">
                        <span className="admin-logo-icon">⚙️</span>
                        <span className="admin-logo-text">EasyPeek Admin</span>
                    </Link>
                </div>

                <nav className="admin-header-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''
                                }`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="admin-header-right">
                    <button
                        onClick={handleBackToSite}
                        className="back-to-site-btn"
                        title="return"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>

                    <ThemeToggle />

                    <div className="admin-user-menu">
                        <div className="admin-user-info">
                            <div className="admin-avatar">
                                {adminUser?.username ? adminUser.username.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="admin-user-details">
                                <div className="admin-username">{adminUser?.username || 'Admin'}</div>
                                <div className="admin-role">{'管理员'}</div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="admin-logout-btn">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader; 