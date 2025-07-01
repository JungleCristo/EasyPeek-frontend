import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import ThemeToggle from "../components/ThemeToggle";
import "./newspage.css";

export default function NewsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);


  // 格式化新闻数据，处理字段映射
  const formatNewsData = (rawData) => {
    if (!rawData) return null;
    
    return {
      ...rawData,
      // 处理字段映射
      readCount: rawData.view_count || 0,
      likeCount: rawData.like_count || 0,
      commentCount: rawData.comment_count || 0,
      followCount: rawData.follow_count || 0,
      tags: Array.isArray(rawData.tags) ? rawData.tags : (rawData.tags ? rawData.tags.split(',').map(tag => tag.trim()) : []),
      aiPrediction: rawData.ai_prediction || "暂无AI预测分析",
      // 格式化时间
      published_at: rawData.published_at ? new Date(rawData.published_at).toLocaleString('zh-CN') : '',
    };
  };

  // 格式化相关新闻数据
  const formatRelatedNews = (newsList) => {
    return newsList.map(news => ({
      ...news,
      published_at: news.published_at ? new Date(news.published_at).toLocaleString('zh-CN') : ''
    }));
  };

 

  // 获取相关新闻 - 基于标签推荐
  const fetchRelatedNews = async (newsId, currentNewsTags) => {
    try {
      setRelatedLoading(true);
      // 获取更多新闻用于筛选
      const response = await fetch(`http://localhost:8080/api/v1/news/latest?limit=50`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        // 过滤掉当前新闻
        const filtered = result.data.filter(news => news.id !== parseInt(newsId));
        
        // 如果当前新闻有标签，基于标签推荐
        if (currentNewsTags && currentNewsTags.length > 0) {
          const relatedByTags = filtered.filter(news => {
            if (!news.tags) return false;
            const newsTags = Array.isArray(news.tags) ? news.tags : news.tags.split(',').map(tag => tag.trim());
            // 检查是否有共同标签
            return newsTags.some(tag => currentNewsTags.includes(tag));
          });
          
          // 按共同标签数量排序
          relatedByTags.sort((a, b) => {
            const aTagsArray = Array.isArray(a.tags) ? a.tags : a.tags.split(',').map(tag => tag.trim());
            const bTagsArray = Array.isArray(b.tags) ? b.tags : b.tags.split(',').map(tag => tag.trim());
            const aCommonTags = aTagsArray.filter(tag => currentNewsTags.includes(tag)).length;
            const bCommonTags = bTagsArray.filter(tag => currentNewsTags.includes(tag)).length;
            return bCommonTags - aCommonTags;
          });
          
          // 如果有基于标签的相关新闻，优先使用
          if (relatedByTags.length > 0) {
            const formattedRelated = formatRelatedNews(relatedByTags.slice(0, 3));
            setRelatedNews(formattedRelated);
            return;
          }
        }
        
        // 如果没有标签或没有找到相关标签的新闻，则按时间推荐
        const formattedRelated = formatRelatedNews(filtered.slice(0, 3));
        setRelatedNews(formattedRelated);
      }
    } catch (error) {
      console.error('获取相关新闻失败:', error);
      setRelatedNews([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  // 所属事件配置
  const eventConfig = {
    "AI技术发展": { label: "AI技术发展", bgColor: "rgba(59, 130, 246, 0.9)" },
    "气候变化会议": { label: "气候变化会议", bgColor: "rgba(16, 185, 129, 0.9)" },
    "新能源汽车发展": { label: "新能源汽车发展", bgColor: "rgba(245, 158, 11, 0.9)" },
  };

  useEffect(() => {

    // 从后端API获取新闻详情

    const fetchNewsData = async () => {
      try {
        setLoading(true);

        // 调用后端API获取新闻详情
        const response = await fetch(`http://localhost:8080/api/v1/news/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
         if (result.code === 200 && result.data) {
           const formattedData = formatNewsData(result.data);
           setNewsData(formattedData);
           setError(null);
           // 获取相关新闻 - 传入当前新闻的标签
           fetchRelatedNews(id, formattedData.tags);
         } else {
           throw new Error(result.message || '获取新闻详情失败');
         }
      } catch (error) {
        console.error('获取新闻详情失败:', error);

 
        setError("获取新闻详情失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [id]);

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

  // 解析标签字符串
  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="newspage-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载新闻详情...</p>
        </div>
        <ThemeToggle className="fixed" />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="newspage-container">
        <Header />
        <div className="error-container">
          <h2>😔 加载失败</h2>
          <p>{error}</p>
          <button className="back-btn" onClick={() => window.history.back()}>
            返回上一页
          </button>
        </div>
        <ThemeToggle className="fixed" />
      </div>
    );
  }

  return (
    <div className="newspage-container">
      <Header />

      <div className="newspage-content">
        <div className="news-detail-grid">
          {/* 主要内容区域 */}
          <div className="main-content">
            {/* 新闻头部信息 */}
            <div className="content-card">
              <div className="news-header-section">
                <div className="news-tags">
                  <div className="news-category-badge">
                    {newsData.category}
                  </div>

                  {newsData.belonged_event && (
                    <div 
                      className="news-event-badge"
                      style={{
                        backgroundColor: eventConfig[newsData.belonged_event]?.bgColor || "rgba(107, 114, 128, 0.9)"
                      }}
                    >
                      {eventConfig[newsData.belonged_event]?.label || newsData.belonged_event}
                    </div>
                  )}
                </div>
                
                <h1 className="news-title">{newsData.title}</h1>
                <p className="news-summary">{newsData.summary}</p>
                
                <div className="news-meta">
                  <span className="news-time">{formatTime(newsData.published_at)}</span>
                  <span className="news-source">{newsData.source}</span>
                  {newsData.author && <span className="news-author">作者: {newsData.author}</span>}
                </div>

                {/* 统计信息 */}
                <div className="news-stats">
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="stat-value">{newsData.view_count || 0}</span>
                    <span className="stat-label">阅读量</span>
                  </div>
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="stat-value">{newsData.like_count || 0}</span>
                    <span className="stat-label">点赞数</span>
                  </div>
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="stat-value">{newsData.comment_count || 0}</span>
                    <span className="stat-label">评论数</span>
                  </div>
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="stat-value">{newsData.share_count || 0}</span>
                    <span className="stat-label">分享数</span>
                  </div>
                </div>

                {/* 热度分数 */}
                {newsData.hotness_score && (
                  <div className="hotness-score">
                    <span className="hotness-label">热度指数:</span>
                    <span className="hotness-value">{newsData.hotness_score.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 新闻内容 */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">📰 新闻内容</h2>
              </div>
              <div className="card-body">
                {/* 新闻图片 */}
                {newsData.image_url && (
                  <div className="news-image-container">
                    <img 
                      src={newsData.image_url} 
                      alt={newsData.title}
                      className="news-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="news-content">
                  {newsData.content && newsData.content.split('\n').map((paragraph, index) => {
                    // 检查段落是否包含图片链接
                    const imageUrlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?/gi;
                    const imageUrls = paragraph.match(imageUrlRegex);
                    
                    if (imageUrls && imageUrls.length > 0) {
                      // 如果段落包含图片链接，渲染图片
                      return (
                        <div key={index} className="paragraph-with-images">
                          {imageUrls.map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="embedded-image-container">
                              <img 
                                src={imageUrl.trim()} 
                                alt={`新闻图片 ${imgIndex + 1}`}
                                className="embedded-news-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                                onLoad={(e) => {
                                  e.target.style.display = 'block';
                                }}
                              />
                            </div>
                          ))}
                          {/* 显示去除图片链接后的文本 */}
                          {paragraph.replace(imageUrlRegex, '').trim() && (
                            <p className="news-paragraph">
                              {paragraph.replace(imageUrlRegex, '').trim()}
                            </p>
                          )}
                        </div>
                      );
                    } else {
                      // 普通文本段落
                      return (
                        <p key={index} className="news-paragraph">
                          {paragraph}
                        </p>
                      );
                    }
                  })}
                </div>
                
                {/* 标签区域 */}

                {newsData.tags && Array.isArray(newsData.tags) && newsData.tags.length > 0 && (
                  <div className="news-tags-section">
                    <span className="tags-label">相关标签：</span>
                    <div className="tags-container">
                      {newsData.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 事件时间线 */}
            {newsData.timeline && newsData.timeline.length > 0 ? (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">📅 事件时间线</h2>
                  <p className="card-subtitle">完整追踪事件发展过程</p>
                </div>
                <div className="card-body">
                  <div className="timeline-container">
                    {newsData.timeline.map((event, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-connector">
                          <div className="timeline-dot">
                            {index + 1}
                          </div>
                          {index !== newsData.timeline.length - 1 && (
                            <div className="timeline-line"></div>
                          )}
                        </div>
                        
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-date">{event.date} {event.time}</span>
                            <span className={`timeline-importance ${event.importance}`}>
                              {event.importance === "high" ? "重要" : "一般"}
                            </span>
                          </div>
                          
                          <h4 className="timeline-title">{event.title}</h4>
                          <p className="timeline-description">{event.content}</p>
                          
                          {event.sources && event.sources.length > 0 && (
                            <div className="timeline-sources">
                              <span className="sources-label">消息来源：</span>
                              <div className="sources-tags">
                                {event.sources.map((source, idx) => (
                                  <span key={idx} className="source-tag">{source}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">📅 事件时间线</h2>
                  <p className="card-subtitle">完整追踪事件发展过程</p>
                </div>
                <div className="card-body">
                  <div className="timeline-empty">
                    <p>暂无相关事件时间线数据</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="sidebar">
            {/* 关注按钮 */}
            <div className="sidebar-card">
              <div className="follow-section">
                <button className="follow-btn">
                  👥 关注此新闻 ({newsData.share_count || 0})
                </button>
                <p className="follow-desc">关注后将收到相关新闻提醒</p>
              </div>
            </div>

            {/* 相关新闻 */}
            <div className="sidebar-card">
              <h3 className="card-title">相关新闻</h3>
              <div className="related-news-list">
                {relatedLoading ? (
                  <div className="loading-container">
                    <p>正在加载相关新闻...</p>
                  </div>
                ) : relatedNews.length > 0 ? (
                  relatedNews.map((news) => (
                    <div key={news.id} className="related-news-item" onClick={() => window.location.href = `/newspage/${news.id}`}>
                      <div className="related-news-header">
                        <div className="related-news-category">{news.category}</div>
                        <span className="related-news-time">{news.published_at}</span>
                      </div>
                      <h4 className="related-news-title">{news.title}</h4>
                      <p className="related-news-summary">{news.summary}</p>
                      <div className="related-news-source">{news.source}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-related-news">
                    <p>暂无相关新闻</p>
                  </div>
                )}
              </div>
            </div>

            {/* 热门评论 */}
            <div className="sidebar-card">
              <h3 className="card-title">💬 热门评论 ({newsData.comment_count || 0})</h3>
              <div className="comments-list">
                <div className="comment-item">
                  <div className="comment-avatar">用</div>
                  <div className="comment-content">
                    <div className="comment-author">用户123</div>
                    <div className="comment-text">这是一条很有价值的新闻</div>
                    <div className="comment-time">2小时前</div>
                  </div>
                </div>
                
                <div className="comment-item">
                  <div className="comment-avatar">观</div>
                  <div className="comment-content">
                    <div className="comment-author">观察者</div>
                    <div className="comment-text">值得关注的发展趋势</div>
                    <div className="comment-time">3小时前</div>
                  </div>
                </div>
              </div>
              
              <button className="view-all-comments-btn">
                查看全部评论
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 浮动按钮组 */}
      <ThemeToggle className="fixed" />
    </div>
  );
}