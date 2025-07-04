import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryNames } from '../../utils/statusConfig';
import Header from '../../components/Header';
import ThemeToggle from '../../components/ThemeToggle';

import {
  getMessages,
  getUnreadCount,
  markMessageRead,
  markAllMessagesRead,
  deleteMessage,
  getFollows,
  removeFollow,
  checkFollow,
  getFollowStats,
  changePassword,
  getFollowedEventsRecentNews,
  handleApiError
} from '../../api/userApi';
import { getUserProfile, updateUserProfile } from '../../api/userApi';
import './profile.css';

// CSS styles for error and success messages
const additionalStyles = `
  .save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #f5c6cb;
  }
  
  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #c3e6cb;
  }
  
  input:disabled, textarea:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

// Inject additional styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');
  
  // 消息相关状态
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messagesTotalPages, setMessagesTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageType, setMessageType] = useState('');
  
  // 关注相关状态
  const [follows, setFollows] = useState([]);
  const [followsLoading, setFollowsLoading] = useState(false);
  const [followsPage, setFollowsPage] = useState(1);
  const [followsTotal, setFollowsTotal] = useState(0);
  const [followsTotalPages, setFollowsTotalPages] = useState(0);
  const [followStats, setFollowStats] = useState({ total_follows: 0 });
  
  // 关注事件新闻相关状态
  const [followedNews, setFollowedNews] = useState([]);
  const [followedNewsLoading, setFollowedNewsLoading] = useState(false);
  const [followedNewsHours, setFollowedNewsHours] = useState(24);
  
  // 错误状态
  const [error, setError] = useState('');
  
  // 修改密码相关状态
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // 用户信息相关状态
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    interests: [],
    avatar: '/placeholder.svg?height=100&width=100'
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // 表单编辑状态
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    interests: []
  });
  const [isEditing, setIsEditing] = useState(false);



  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError('');
      const response = await getUserProfile();
      
      // 解析兴趣偏好JSON字符串
      let interests = [];
      if (response.interests) {
        try {
          interests = JSON.parse(response.interests);
        } catch (e) {
          interests = [];
        }
      }
      
      const userData = {
         username: response.username || '',
         email: response.email || '',
         phone: response.phone || '',
         location: response.location || '',
         bio: response.bio || '',
         interests: interests,
         avatar: response.avatar || '/placeholder.svg?height=100&width=100',
         joinDate: response.created_at ? new Date(response.created_at).toLocaleDateString() : ''
       };
       
       setUserInfo(userData);
       // 同时更新表单数据
       setFormData({
         username: userData.username,
         email: userData.email,
         phone: userData.phone,
         location: userData.location,
         bio: userData.bio,
         interests: userData.interests
       });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setProfileError(errorMessage);
      console.error('获取用户信息失败:', error);
    } finally {
      setProfileLoading(false);
    }
  };
  
  // 更新用户信息
  const handleUpdateProfile = async (profileData) => {
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');
      
      // 将兴趣偏好数组转换为JSON字符串
      const updateData = {
        ...profileData,
        interests: JSON.stringify(profileData.interests || [])
      };
      
      await updateUserProfile(updateData);
      setProfileSuccess('个人信息更新成功！');
      
      // 重新获取用户信息
      await fetchUserProfile();
    } catch (error) {
      const errorMessage = handleApiError(error);
      setProfileError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
   };
   
   // 表单处理函数
   const handleStartEdit = () => {
     setIsEditing(true);
     setProfileError('');
     setProfileSuccess('');
   };
   
   const handleCancelEdit = () => {
     setIsEditing(false);
     // 重置表单数据为原始用户信息
     setFormData({
       username: userInfo.username,
       email: userInfo.email,
       phone: userInfo.phone,
       location: userInfo.location,
       bio: userInfo.bio,
       interests: userInfo.interests
     });
     setProfileError('');
     setProfileSuccess('');
   };
   
   const handleFormChange = (field, value) => {
     setFormData(prev => ({
       ...prev,
       [field]: value
     }));
   };
   
   const handleInterestChange = (interest, checked) => {
     setFormData(prev => ({
       ...prev,
       interests: checked 
         ? [...prev.interests, interest]
         : prev.interests.filter(i => i !== interest)
     }));
   };
   
   const handleSaveProfile = async () => {
     await handleUpdateProfile(formData);
     setIsEditing(false);
   };

  // API调用函数
  const fetchMessages = async (page = 1, type = '') => {
    try {
      setMessagesLoading(true);
      setError('');
      const response = await getMessages({ page, page_size: 4, type });
      
      // 处理新的API返回格式 {messages: [...], total: ..., unread_count: ...}
      const messageData = Array.isArray(response.messages) ? response.messages : [];
      
      setMessages(messageData);
      setMessagesTotal(response.total || 0);
      setUnreadCount(response.unread_count || 0);
      setMessagesTotalPages(Math.ceil((response.total || 0) / 4));
      setMessagesPage(page);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('获取消息失败:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.unread_count || 0);
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      setUnreadCount(0);
    }
  };

  const fetchFollows = async (page = 1) => {
    try {
      setFollowsLoading(true);
      setError('');
      const response = await getFollows({ page, page_size: 10 });
      
      // 处理新的API返回格式 {follows: [...], total_count: ..., page: ..., page_size: ..., total_pages: ...}
      const followsData = Array.isArray(response.follows) ? response.follows : [];
      const totalCount = response.total_count || 0;
      

      
      setFollows(followsData);
      setFollowsTotal(totalCount);
      setFollowsTotalPages(response.total_pages || Math.ceil(totalCount / 10));
      setFollowsPage(page);
      
      // 同时更新关注统计信息
      setFollowStats({
        total_follows: totalCount,
        follows: followsData
      });
      

    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('获取关注列表失败:', error);
    } finally {
      setFollowsLoading(false);
    }
  };

  // 不再需要单独的fetchFollowStats函数，因为关注列表API已包含统计信息
  const fetchFollowStats = async () => {
    // 这个函数保留以防其他地方需要单独获取统计信息
    try {
      const response = await getFollowStats();
      setFollowStats({
        total_follows: response.total_count || 0,
        follows: response.follows || []
      });
    } catch (error) {
      console.error('获取关注统计失败:', error);
    }
  };

  // 获取关注事件的最近新闻
  const fetchFollowedEventsNews = async (hours = 24) => {
    try {
      setFollowedNewsLoading(true);
      setError('');
      const response = await getFollowedEventsRecentNews({ hours });
      setFollowedNews(response.recent_news || []);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('获取关注事件新闻失败:', error);
    } finally {
      setFollowedNewsLoading(false);
    }
  };

  // 标记消息已读
  const handleMarkRead = async (messageId) => {
    try {
      await markMessageRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      fetchUnreadCount(); // 更新未读数量
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    }
  };

  // 标记所有消息已读
  const handleMarkAllRead = async () => {
    try {
      await markAllMessagesRead();
      setMessages(prev => 
        prev.map(msg => ({ ...msg, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    }
  };

  // 删除消息
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      fetchUnreadCount(); // 更新未读数量
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    }
  };

  // 取消关注
  const handleUnfollow = async (eventId) => {
    try {

      await removeFollow(eventId);
      
      // 从列表中移除该关注项
      setFollows(prev => {
        const newFollows = prev.filter(follow => follow.event_id !== eventId);

        return newFollows;
      });
      
      // 更新总数
      setFollowsTotal(prev => Math.max(0, prev - 1));
      
      // 更新关注统计
      fetchFollowStats();
      

    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('取消关注失败:', error);
    }
  };

  // 处理消息分页
  const handleMessagesPageChange = (page) => {
    fetchMessages(page, messageType);
  };

  // 处理关注分页
  const handleFollowsPageChange = (page) => {
    fetchFollows(page);
  };

  // 格式化时间
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return `${days}天前`;
    }
  };

  // 修改密码处理函数
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // 验证输入
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('新密码和确认密码不匹配');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('新密码长度至少为8位');
      return;
    }
    
    // 验证密码必须包含字母和数字
    const hasLetter = /[a-zA-Z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    
    if (!hasLetter || !hasNumber) {
      setPasswordError('新密码必须包含至少一个字母和一个数字');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');
      
      await changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      setPasswordSuccess('密码修改成功！');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  // 处理密码输入变化
  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除错误信息
    if (passwordError) {
      setPasswordError('');
    }
    if (passwordSuccess) {
      setPasswordSuccess('');
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    
    if (!token) {
      console.warn('用户未登录，无法获取个人数据');
      setError('请先登录后再查看个人信息');
      return;
    }
    
    // 页面加载时获取用户信息和未读消息数量
    fetchUserProfile();
    fetchUnreadCount();
  }, []);

  // 切换标签页时获取对应数据
  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages(1, messageType);
    } else if (activeTab === 'following') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchFollows(1);
      } else {
        setFollows([]);
        setError('请先登录后查看关注列表');
      }
    } else if (activeTab === 'news-updates') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchFollowedEventsNews(followedNewsHours);
      } else {
        setFollowedNews([]);
        setError('请先登录后查看关注动态');
      }
    }
  }, [activeTab, messageType, followedNewsHours]);

  const tabs = [
    { id: 'info', label: '个人设置', icon: '👤' },
    { id: 'messages', label: '我的消息', icon: '🔔' },
    { id: 'following', label: '我的关注', icon: '❤️' },
    { id: 'news-updates', label: '关注动态', icon: '📰' },
  ];

  return (
    <div className="profile-container">
      <Header />
      <ThemeToggle className="fixed" />
      
      <div className="profile-content">
        <div className="profile-grid">
          {/* 侧边栏 */}
          <div className="profile-sidebar">
            <div className="sidebar-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <img src={userInfo.avatar || "/placeholder.svg"} alt="头像" />
                </div>
                <h3 className="profile-name">{userInfo.username || '未设置用户名'}</h3>
                <p className="profile-bio" title={userInfo.bio || '这个人很懒，什么都没写'}>{userInfo.bio || '这个人很懒，什么都没写'}</p>
              </div>

              <div className="profile-info">
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  {userInfo.email || '未设置邮箱'}
                </div>
                <div className="info-item">
                  <span className="info-icon">📱</span>
                  {userInfo.phone || '未设置手机号'}
                </div>
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  {userInfo.location || '未设置所在地'}
                </div>
              </div>

              <div className="profile-join-date">
                <span>加入时间：{userInfo.joinDate}</span>
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="profile-main">
            <div className="content-card">
              <div className="card-header">
                {/* 未读消息统计区域 */}
                <div className="stats-section">
                  {unreadCount > 0 && (
                    <div className="unread-stats-button">
                      <span className="unread-icon">🔔</span>
                      <span className="unread-text">有 {unreadCount} 条未读消息</span>
                    </div>
                  )}
                </div>
                
                {/* 标签页导航 */}
                <div className="tabs-container">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.id === 'info' ? 'info-tab' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-body">
                {/* 个人设置标签页 */}
                {activeTab === 'info' && (
                  <div className="tab-content">
                    {/* 个人信息部分 */}
                    <div className="settings-section">
                      <div className="tab-header">
                        <h2>个人信息</h2>
                        {!isEditing ? (
                          <button className="edit-btn" onClick={handleStartEdit}>✏️ 编辑</button>
                        ) : (
                          <div>
                            <button className="edit-btn" onClick={handleCancelEdit}>❌ 取消</button>
                          </div>
                        )}
                      </div>
                      
                      {profileError && (
                        <div className="error-message">
                          {profileError}
                        </div>
                      )}
                      
                      {profileSuccess && (
                        <div className="success-message">
                          {profileSuccess}
                        </div>
                      )}
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>用户名</label>
                          <input 
                            type="text" 
                            value={formData.username}
                            onChange={(e) => handleFormChange('username', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="form-group">
                          <label>邮箱</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="form-group">
                          <label>手机号</label>
                          <input 
                            type="text" 
                            value={formData.phone}
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                            disabled={!isEditing}
                            placeholder="请输入手机号"
                          />
                        </div>
                        <div className="form-group">
                          <label>所在地</label>
                          <input 
                            type="text" 
                            value={formData.location}
                            onChange={(e) => handleFormChange('location', e.target.value)}
                            disabled={!isEditing}
                            placeholder="请输入所在地"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>个人简介</label>
                        <textarea 
                          value={formData.bio}
                          onChange={(e) => handleFormChange('bio', e.target.value)}
                          disabled={!isEditing}
                          rows={3}
                          placeholder="请输入个人简介"
                        />
                      </div>
                      {isEditing && (
                        <button 
                          className="save-btn" 
                          onClick={handleSaveProfile}
                          disabled={profileLoading}
                        >
                          {profileLoading ? '保存中...' : '保存个人信息'}
                        </button>
                      )}
                    </div>

                    {/* 兴趣偏好部分 */}
                    <div className="settings-section">
                      <h3>兴趣偏好</h3>
                      <div className="categories-grid">
                        {getCategoryNames().map((category) => (
                          <label key={category} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={formData.interests.includes(category)}
                              onChange={(e) => handleInterestChange(category, e.target.checked)}
                              disabled={!isEditing}
                            />
                            <span>{category}</span>
                          </label>
                        ))}
                      </div>
                      {isEditing && (
                        <button 
                          className="save-btn" 
                          onClick={handleSaveProfile}
                          disabled={profileLoading}
                        >
                          {profileLoading ? '保存中...' : '保存偏好设置'}
                        </button>
                      )}
                    </div>

                    {/* 修改密码部分 */}
                    <div className="settings-section">
                      <h3>修改密码</h3>
                      <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                          <label>当前密码</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                            placeholder="请输入当前密码"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>新密码</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                            placeholder="请输入新密码（至少8位）"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>确认新密码</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                            placeholder="请再次输入新密码"
                            required
                          />
                        </div>
                        
                        {passwordError && (
                          <div className="error-message">
                            {passwordError}
                          </div>
                        )}
                        
                        {passwordSuccess && (
                          <div className="success-message">
                            {passwordSuccess}
                          </div>
                        )}
                        
                        <button 
                          type="submit" 
                          className="save-btn"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? '修改中...' : '修改密码'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* 我的消息标签页 */}
                {activeTab === 'messages' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>我的消息</h2>
                      <p>查看系统通知和关注事件的更新提醒</p>
                      <div className="message-controls">
                        <select 
                          value={messageType} 
                          onChange={(e) => {
                            const newType = e.target.value;
                            setMessageType(newType);
                            setMessagesPage(1);
                            fetchMessages(1, newType);
                          }}
                          className="message-type-filter"
                        >
                          <option value="">全部消息</option>
                          <option value="system">系统消息</option>
                          <option value="like">点赞消息</option>
                          <option value="comment">回复消息</option>
                          <option value="follow">关注消息</option>
                        </select>
                        {unreadCount > 0 && (
                          <button 
                            className="mark-all-read-btn"
                            onClick={handleMarkAllRead}
                          >
                            标记全部已读
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {error && (
                      <div className="error-message">
                        {error}
                        <button onClick={() => fetchMessages(1, messageType)}>重试</button>
                      </div>
                    )}
                    
                    {messagesLoading && messages.length === 0 ? (
                      <div className="loading">加载中...</div>
                    ) : (
                      <>
                        <div className="messages-list">
                          {messages.length === 0 ? (
                            <div className="empty-state">
                              <p>暂无消息</p>
                            </div>
                          ) : (
                            messages.map((message) => (
                              <div
                                key={message.id}
                                className={`message-item ${!message.is_read ? 'unread' : ''}`}
                              >
                                <div className="message-content">
                                  <div className="message-header">
                                    <div className="message-title-section">
                                      {message.related_type && message.related_id ? (
                                        <Link 
                                          to={`/newspage/${message.related_id}`} 
                                          className="message-title-link"
                                        >
                                          <h4>{message.title}</h4>
                                        </Link>
                                      ) : (
                                        <h4>{message.title}</h4>
                                      )}
                                      <span className={`message-type-badge ${message.type}`}>
                                        {message.type === 'system' && '系统'}
                                        {message.type === 'like' && '点赞'}
                                        {message.type === 'comment' && '回复'}
                                        {message.type === 'follow' && '关注'}
                                      </span>
                                    </div>
                                    {!message.is_read && <span className="unread-badge">新</span>}
                                  </div>
                                  <p>{message.content}</p>
                                  <span className="message-time">
                                    {formatTime(message.created_at)}
                                  </span>
                                </div>
                                <div className="message-actions">
                                  {!message.is_read && (
                                    <button 
                                      className="mark-read-btn"
                                      onClick={() => handleMarkRead(message.id)}
                                    >
                                      标记已读
                                    </button>
                                  )}
                                  <button 
                                    className="delete-btn"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {messagesTotalPages > 1 && (
                          <div className="pagination">
                            <div className="pagination-info">
                              <span>共 {messagesTotal} 条消息，第 {messagesPage} / {messagesTotalPages} 页</span>
                            </div>
                            <div className="pagination-controls">
                              <button 
                                className="pagination-btn prev" 
                                onClick={() => handleMessagesPageChange(messagesPage - 1)}
                                disabled={messagesPage === 1 || messagesLoading}
                              >
                                上一页
                              </button>
                              
                              <div className="pagination-numbers">
                                {Array.from({ length: messagesTotalPages }, (_, i) => i + 1).map(page => {
                                  // 显示逻辑：当前页前后各2页
                                  if (
                                    page === 1 || 
                                    page === messagesTotalPages || 
                                    (page >= messagesPage - 2 && page <= messagesPage + 2)
                                  ) {
                                    return (
                                      <button
                                        key={page}
                                        className={`pagination-btn ${page === messagesPage ? 'active' : ''}`}
                                        onClick={() => handleMessagesPageChange(page)}
                                        disabled={messagesLoading}
                                      >
                                        {page}
                                      </button>
                                    );
                                  } else if (
                                    page === messagesPage - 3 || 
                                    page === messagesPage + 3
                                  ) {
                                    return <span key={page} className="pagination-ellipsis">...</span>;
                                  }
                                  return null;
                                })}
                              </div>
                              
                              <button 
                                className="pagination-btn next" 
                                onClick={() => handleMessagesPageChange(messagesPage + 1)}
                                disabled={messagesPage === messagesTotalPages || messagesLoading}
                              >
                                下一页
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 我的关注标签页 */}
                {activeTab === 'following' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>我的关注</h2>
                      <p>管理您关注的新闻事件，接收后续发展提醒</p>
                      <div className="follow-stats">
                        <span>总关注数：{followStats.total_follows}</span>
                        <button 
                          onClick={() => {
                            fetchFollows(1);
                          }}
                          style={{marginLeft: '20px', padding: '5px 10px'}}
                        >
                          刷新关注列表
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="error-message">
                        <p>❌ {error}</p>
                        <button 
                          onClick={() => {
                            setError('');
                            fetchFollows(1);
                          }}
                          className="retry-btn"
                        >
                          🔄 重新加载
                        </button>
                      </div>
                    )}
                    
                    {followsLoading && follows.length === 0 ? (
                      <div className="loading">加载中...</div>
                    ) : (
                      <>
                        <div className="following-list">
                          {follows.length === 0 ? (
                             <div className="empty-state">
                               <div className="empty-icon">📋</div>
                               <h3>暂无关注的事件</h3>
                               <p>您还没有关注任何新闻事件，去首页发现感兴趣的内容吧！</p>
                               <div className="empty-actions">
                                 <Link to="/" className="browse-link">🏠 浏览首页</Link>
                                 <button 
                                   onClick={() => fetchFollows(1)}
                                   className="refresh-btn"
                                 >
                                   🔄 刷新列表
                                 </button>
                               </div>
                             </div>
                           ) : (
                            follows.map((follow, index) => (
                              <div key={follow.id || `follow-${index}`} className="following-item">
                                <div className="following-content">
                                   <div className="following-badges">
                                     <span className="event-id-badge">🏷️ 事件 #{follow.event_id}</span>
                                     <span className="follow-date-badge">
                                       ⏰ {formatTime(follow.created_at)}
                                     </span>
                                   </div>
                                   <h4 className="event-title">
                                     {follow.event_title || `未命名事件 (ID: ${follow.event_id})`}
                                   </h4>
                                   <p className="event-meta">
                                     📅 关注时间：{new Date(follow.created_at).toLocaleString('zh-CN', {
                                       year: 'numeric',
                                       month: '2-digit',
                                       day: '2-digit',
                                       hour: '2-digit',
                                       minute: '2-digit'
                                     })}
                                   </p>
                                 </div>
                                <div className="following-actions">
                                   <Link to={`/event/${follow.event_id}`}>
                                     <button className="view-btn">👁️ 查看详情</button>
                                   </Link>
                                   <button 
                                     className="unfollow-btn"
                                     onClick={() => {
                                       const eventName = follow.event_title || `事件 #${follow.event_id}`;
                                       if (window.confirm(`确定要取消关注「${eventName}」吗？\n\n取消后将不再接收该事件的更新通知。`)) {
                                         handleUnfollow(follow.event_id);
                                       }
                                     }}
                                     title="取消关注此事件"
                                   >
                                     ❌ 取消关注
                                   </button>
                                 </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {followsTotalPages > 1 && (
                          <div className="pagination">
                            <div className="pagination-info">
                              <span>共 {followsTotal} 个关注，第 {followsPage} / {followsTotalPages} 页</span>
                            </div>
                            <div className="pagination-controls">
                              <button 
                                className="pagination-btn prev" 
                                onClick={() => handleFollowsPageChange(followsPage - 1)}
                                disabled={followsPage === 1 || followsLoading}
                              >
                                上一页
                              </button>
                              
                              <div className="pagination-numbers">
                                {Array.from({ length: followsTotalPages }, (_, i) => i + 1).map(page => {
                                  // 显示逻辑：当前页前后各2页
                                  if (
                                    page === 1 || 
                                    page === followsTotalPages || 
                                    (page >= followsPage - 2 && page <= followsPage + 2)
                                  ) {
                                    return (
                                      <button
                                        key={page}
                                        className={`pagination-btn ${page === followsPage ? 'active' : ''}`}
                                        onClick={() => handleFollowsPageChange(page)}
                                        disabled={followsLoading}
                                      >
                                        {page}
                                      </button>
                                    );
                                  } else if (
                                    page === followsPage - 3 || 
                                    page === followsPage + 3
                                  ) {
                                    return <span key={page} className="pagination-ellipsis">...</span>;
                                  }
                                  return null;
                                })}
                              </div>
                              
                              <button 
                                className="pagination-btn next" 
                                onClick={() => handleFollowsPageChange(followsPage + 1)}
                                disabled={followsPage === followsTotalPages || followsLoading}
                              >
                                下一页
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 关注动态标签页 */}
                {activeTab === 'news-updates' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>关注动态</h2>
                      <p>查看您关注事件的最新新闻动态</p>
                      <div className="news-controls">
                        <label>时间范围：</label>
                        <select 
                          value={followedNewsHours} 
                          onChange={(e) => {
                            const newHours = parseInt(e.target.value);
                            setFollowedNewsHours(newHours);
                            fetchFollowedEventsNews(newHours);
                          }}
                          className="hours-filter"
                        >
                          <option value={6}>最近6小时</option>
                          <option value={24}>最近24小时</option>
                          <option value={72}>最近3天</option>
                          <option value={168}>最近7天</option>
                        </select>
                        <button 
                          onClick={() => fetchFollowedEventsNews(followedNewsHours)}
                          style={{marginLeft: '20px', padding: '5px 10px'}}
                          disabled={followedNewsLoading}
                        >
                          🔄 刷新动态
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="error-message">
                        <p>❌ {error}</p>
                        <button 
                          onClick={() => {
                            setError('');
                            fetchFollowedEventsNews(followedNewsHours);
                          }}
                          className="retry-btn"
                        >
                          🔄 重新加载
                        </button>
                      </div>
                    )}
                    
                    {followedNewsLoading ? (
                      <div className="loading">加载中...</div>
                    ) : (
                      <div className="news-updates-list">
                        {followedNews.length === 0 ? (
                          <div className="empty-state">
                            <div className="empty-icon">📰</div>
                            <h3>暂无最新动态</h3>
                            <p>您关注的事件在选定时间范围内没有新的相关新闻。</p>
                            <div className="empty-actions">
                              <button 
                                onClick={() => {
                                  setFollowedNewsHours(168); // 切换到7天
                                  fetchFollowedEventsNews(168);
                                }}
                                className="expand-range-btn"
                              >
                                📅 扩大时间范围
                              </button>
                              <Link to="/stories" className="browse-link">🏠 浏览事件</Link>
                            </div>
                          </div>
                        ) : (
                          followedNews.map((newsItem, index) => (
                            <div key={`${newsItem.news_id}-${index}`} className="news-update-item">
                              <div className="news-update-header">
                                <div className="event-info">
                                  <span className="event-badge">📍 {newsItem.event_title}</span>
                                  <span className={`status-badge ${newsItem.event_status === '进行中' ? 'ongoing' : 'completed'}`}>
                                    {newsItem.event_status}
                                  </span>
                                </div>
                                <span className="news-time">{formatTime(newsItem.published_at)}</span>
                              </div>
                              
                              <div className="news-update-content">
                                <h4 className="news-title">
                                  {newsItem.news_link ? (
                                    <a href={newsItem.news_link} target="_blank" rel="noopener noreferrer">
                                      {newsItem.news_title}
                                    </a>
                                  ) : (
                                    newsItem.news_title
                                  )}
                                </h4>
                                
                                {newsItem.news_summary && (
                                  <p className="news-summary">{newsItem.news_summary}</p>
                                )}
                                
                                <div className="news-meta">
                                  {newsItem.news_source && (
                                    <span className="news-source">📰 {newsItem.news_source}</span>
                                  )}
                                  {newsItem.news_author && (
                                    <span className="news-author">✍️ {newsItem.news_author}</span>
                                  )}
                                  <span className="publish-time">
                                    🕒 {new Date(newsItem.published_at).toLocaleString('zh-CN')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="news-update-actions">
                                <Link to={`/stories/${newsItem.event_id}`}>
                                  <button className="view-event-btn">👁️ 查看事件</button>
                                </Link>
                                {newsItem.news_link && (
                                  <a href={newsItem.news_link} target="_blank" rel="noopener noreferrer">
                                    <button className="view-news-btn">🔗 阅读原文</button>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
