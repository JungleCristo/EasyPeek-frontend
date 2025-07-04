const API_BASE_URL = 'http://localhost:8080';
const ADMIN_API_BASE_URL = `${API_BASE_URL}/api/v1/admin`;

// get JWT token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('admin_token');
};

// set common headers for API requests
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
    try {
        const url = `${ADMIN_API_BASE_URL}${endpoint}`;
        const config = {
            headers: getAuthHeaders(),
            ...options
        };

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// ==================== 认证相关 ====================
export const adminLogin = async (credentials) => {
    try {
        const Response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const response = await Response.json();

        if (response.code != 200) {
            throw new Error(response.error || response.message || 'Login failed');
        }

        // save token and user info to localStorage
        if (response.data && response.data.token) {
            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        }

        return response;
    } catch (error) {
        console.error('Admin login failed:', error);
        throw error;
    }
};

export const adminLogout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/admin-logout`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            console.warn('Logout API call failed with status:', response.status);
        }
    } catch (error) {
        console.warn('Logout API call failed:', error);
    } finally {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    }
};

export const checkAdminAuth = () => {
    const token = getAuthToken();
    const user = localStorage.getItem('admin_user');

    if (!token || !user) {
        return { isAuthenticated: false, user: null };
    }

    try {
        const userData = JSON.parse(user);
        // 检查用户角色是否为管理员
        const isAdmin = userData.role === 'admin' || userData.role === 'system';

        return {
            isAuthenticated: isAdmin,
            user: isAdmin ? userData : null
        };
    } catch (error) {
        console.error('Error parsing user data:', error);
        return { isAuthenticated: false, user: null };
    }
};

export const getCurrentAdminUser = () => {
    try {
        const user = localStorage.getItem('admin_user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error getting current admin user:', error);
        return null;
    }
};




// ==================== 系统统计 ====================
export const getSystemStats = async () => {
    return await apiRequest('/stats');
};

// ==================== 用户管理 ====================
export const getUsers = async (params = {}) => {
    const queryParams = new URLSearchParams();

    // 后端使用的参数名称：page, size, role, status, search
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
            // 将前端的 pageSize 映射为后端的 size
            const backendKey = key === 'pageSize' ? 'size' : key;
            queryParams.append(backendKey, params[key]);
        }
    });

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
};

export const getUserById = async (id) => {
    return await apiRequest(`/users/${id}`);
};

// 注意：后端没有提供创建用户的管理员接口，移除此函数
// export const createUser = async (userData) => {
//     return await apiRequest('/users', {
//         method: 'POST',
//         body: JSON.stringify(userData)
//     });
// };

export const updateUser = async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
};

export const deleteUser = async (id) => {
    return await apiRequest(`/users/${id}`, {
        method: 'DELETE'
    });
};

// 注意：后端的用户更新统一使用 PUT /users/:id，不再有单独的角色和状态更新接口
// 保留这些函数以维持兼容性，但内部调用统一的更新接口
export const updateUserRole = async (id, role) => {
    return await updateUser(id, { role });
};

export const updateUserStatus = async (id, status) => {
    return await updateUser(id, { status });
};

// ==================== 事件管理 ====================
export const getEvents = async (params = {}) => {
    const queryParams = new URLSearchParams();

    // 后端支持的过滤参数：page, size, status, category, created_by, search
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
            // 将前端的 pageSize 映射为后端的 size
            const backendKey = key === 'pageSize' ? 'size' : key;
            queryParams.append(backendKey, params[key]);
        }
    });

    const queryString = queryParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
};

export const updateEvent = async (id, eventData) => {
    return await apiRequest(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
    });
};

export const deleteEvent = async (id) => {
    return await apiRequest(`/events/${id}`, {
        method: 'DELETE'
    });
};

// ==================== 新闻管理 ====================
export const getNews = async (params = {}) => {
    const queryParams = new URLSearchParams();

    // 后端支持的过滤参数：page, size, status, category, source_type, search
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
            // 将前端的 pageSize 映射为后端的 size
            const backendKey = key === 'pageSize' ? 'size' : key;
            queryParams.append(backendKey, params[key]);
        }
    });

    const queryString = queryParams.toString();
    const endpoint = `/news${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
};

export const updateNews = async (id, newsData) => {
    return await apiRequest(`/news/${id}`, {
        method: 'PUT',
        body: JSON.stringify(newsData)
    });
};

export const deleteNews = async (id) => {
    return await apiRequest(`/news/${id}`, {
        method: 'DELETE'
    });
};

// ==================== RSS源管理 ====================
export const getRssSources = async (params = {}) => {
    const queryParams = new URLSearchParams();

    // 后端支持的参数：page, size 等
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
            // 将前端的 pageSize 映射为后端的 size
            const backendKey = key === 'pageSize' ? 'size' : key;
            queryParams.append(backendKey, params[key]);
        }
    });

    const queryString = queryParams.toString();
    const endpoint = `/rss-sources${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
};

export const createRssSource = async (sourceData) => {
    return await apiRequest('/rss-sources', {
        method: 'POST',
        body: JSON.stringify(sourceData)
    });
};

export const updateRssSource = async (id, sourceData) => {
    return await apiRequest(`/rss-sources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sourceData)
    });
};

export const deleteRssSource = async (id) => {
    return await apiRequest(`/rss-sources/${id}`, {
        method: 'DELETE'
    });
};

export const fetchRssSource = async (id) => {
    return await apiRequest(`/rss-sources/${id}/fetch`, {
        method: 'POST'
    });
};

export const fetchAllRssSources = async () => {
    return await apiRequest('/rss-sources/fetch-all', {
        method: 'POST'
    });
};

// ==================== 系统管理功能 ====================

// 获取所有RSS源（管理员视图）- 与getRssSources功能相同，但为了语义清晰保留
export const getAllRssSources = async (params = {}) => {
    return await getRssSources(params);
};

// 获取所有事件（管理员视图）- 与getEvents功能相同，但为了语义清晰保留
export const getAllEvents = async (params = {}) => {
    return await getEvents(params);
};

// 获取所有新闻（管理员视图）- 与getNews功能相同，但为了语义清晰保留
export const getAllNews = async (params = {}) => {
    return await getNews(params);
};

// 获取所有用户（管理员视图）- 与getUsers功能相同，但为了语义清晰保留
export const getAllUsers = async (params = {}) => {
    return await getUsers(params);
};

// ==================== 错误处理 ====================
export const handleApiError = (error) => {
    console.error('API Error:', error);

    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Token过期或无效，跳转到登录页
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        return 'Authentication failed. Please login again.';
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return 'You do not have permission to perform this action.';
    }

    if (error.message.includes('404') || error.message.includes('Not Found')) {
        return 'The requested resource was not found.';
    }

    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        return 'Server error. Please try again later.';
    }

    return error.message || 'An unexpected error occurred.';
};

export default {
    // 系统统计
    getSystemStats,

    // 用户管理
    getUsers,
    getAllUsers,
    getUserById,
    // createUser, // 后端未提供此接口
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserStatus,

    // RSS源管理
    getRssSources,
    getAllRssSources,
    createRssSource,
    updateRssSource,
    deleteRssSource,
    fetchRssSource,
    fetchAllRssSources,

    // 事件管理
    getEvents,
    getAllEvents,
    updateEvent,
    deleteEvent,

    // 新闻管理
    getNews,
    getAllNews,
    updateNews,
    deleteNews,

    // 认证相关
    adminLogin,
    adminLogout,
    checkAdminAuth,
    getCurrentAdminUser,

    // 错误处理
    handleApiError
};