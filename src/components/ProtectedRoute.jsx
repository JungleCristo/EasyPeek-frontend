import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAdminAuth } from '../api/adminApi';

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // 模拟认证检查的异步过程
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);
    
    // 如果正在加载，显示加载状态
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    if (isAdmin) {
        // 管理员路由保护
        const { isAuthenticated: authenticated } = checkAdminAuth();
        if (!authenticated) {
            return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
        }
    } else {
        // 普通用户路由保护
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            return <Navigate to="/login" replace />;
        }
    }
    
    return children;
};

export default ProtectedRoute;