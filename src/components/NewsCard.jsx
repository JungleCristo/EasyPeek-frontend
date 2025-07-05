<<<<<<< HEAD
import React from 'react';
import AINewsSummary from './AINewsSummary';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> c6051a3a96f43d2bf647eb09541c2058a84845c2
import { safeDisplayText, safeDisplayTitle } from '../utils/htmlUtils';
import { newsApi } from '../api/newsApi';
import './NewsCard.css';

const NewsCard = ({ news, eventConfig, onNewsClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(news.like_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  // 检查用户是否已登录
  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };

  // 更新点赞数当props变化时
  useEffect(() => {
    setLikeCount(news.like_count || 0);
  }, [news.like_count]);

  // 获取点赞状态
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!isLoggedIn()) return;
      
      try {
        const response = await newsApi.getLikeStatus(news.id);
        if (response.success) {
          setIsLiked(response.data.is_liked);
        }
      } catch (error) {
        // 静默处理错误，不影响页面显示
        console.log('获取点赞状态失败:', error);
      }
    };

    fetchLikeStatus();
  }, [news.id]);

  // 处理点赞操作
  const handleLike = async (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    if (!isLoggedIn()) {
      alert('请先登录后再点赞');
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await newsApi.likeNews(news.id);
      if (response.success) {
        setIsLiked(response.data.is_liked);
        setLikeCount(response.data.like_count);
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      alert('点赞操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化时间显示
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  return (
    <div className="news-item" onClick={() => onNewsClick(news.id)}>
      <div className="news-header">
        {/* 新闻分类标签 - 左上角 */}
        <div className="news-category-badge">
          {news.category}
        </div>
        {/* 新闻图片 - 如果有的话 */}
        {news.image_url && (
          <div className="news-image-container">
            <img 
              src={news.image_url} 
              alt={news.title}
              className="news-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      <h3 className="news-title">{safeDisplayTitle(news.title)}</h3>
      <p className="news-summary">{safeDisplayText(news.summary, 150)}</p>
      <div className="news-meta">
        <span className="news-time">{formatTime(news.published_at)}</span>
        <span className="news-source">{news.source}</span>
        {news.author && <span className="news-author">作者: {news.author}</span>}
      </div>
      {/* 统计信息 */}
      <div className="news-stats">
        <span className="stat-item">
          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {news.view_count || 0}
        </span>
        
        {/* 可交互的点赞按钮 */}
        <button 
          className={`stat-item like-button ${isLiked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleLike}
          disabled={isLoading}
          title={isLiked ? '取消点赞' : '点赞'}
        >
          <svg className="stat-icon" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likeCount}
        </button>
        
        <span className="stat-item">
          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {news.comment_count || 0}
        </span>
        
        <span className="stat-item">
          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          {news.share_count || 0}
        </span>
      </div>
      
      {/* AI总结组件 */}
      <div className="news-ai-summary">
        <AINewsSummary newsId={news.id} news={news} />
      </div>
    </div>
  );
};

export default NewsCard;