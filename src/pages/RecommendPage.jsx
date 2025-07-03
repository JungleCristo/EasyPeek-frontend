import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import NewsCard from '../components/NewsCard';
import { eventConfig } from '../utils/statusConfig';
import './RecommendPage.css';

export default function RecommendPage() {
  const [recommendationType, setRecommendationType] = useState('personalized');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventNews, setEventNews] = useState([]);
  const navigate = useNavigate();

  // 可选择的分类列表
  const categories = ['all', '科技', '经济', '环境', '体育', '健康', '教育', '文化', '政治'];

  // 获取推荐理由
  const getRecommendationReason = (type, category) => {
    switch (type) {
      case 'personalized':
        return '基于您的阅读偏好';
      case 'hot':
        return '热门推荐';
      case 'category':
        return category === 'all' ? '全部分类推荐' : `${category}分类推荐`;
      default:
        return '智能推荐';
    }
  };

  // 获取事件数据
  const fetchEvents = async () => {
    try {
      let eventsUrl = 'http://localhost:8080/api/v1/events?page=1&limit=10';
      
      // 根据筛选条件调整API URL
      if (recommendationType === 'category' && selectedCategory !== 'all') {
        eventsUrl += `&category=${encodeURIComponent(selectedCategory)}`;
      } else if (recommendationType === 'hot') {
        eventsUrl += '&sort=hotness_score&order=desc';
      }
      
      const response = await fetch(eventsUrl);
      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        const eventsData = Array.isArray(result.data) ? result.data : result.data.events || [];
        setEvents(eventsData.slice(0, 10));
        
        // 默认选择第一个事件
        if (eventsData.length > 0) {
          setSelectedEvent(eventsData[0]);
          fetchEventNews(eventsData[0].id);
        } else {
          setSelectedEvent(null);
          setEventNews([]);
        }
      } else {
        setEvents([]);
        setSelectedEvent(null);
        setEventNews([]);
      }
    } catch (err) {
      console.error('获取事件数据失败:', err);
      // 使用默认事件数据
      const defaultEvents = [
        {
          id: 1,
          title: "AI技术发展",
          description: "人工智能技术在各个领域的最新发展动态",
          category: "科技",
          status: "ongoing",
          hotness_score: 95.8,
          view_count: 15420,
          news_count: 28,
          created_at: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          title: "气候变化会议",
          description: "全球气候变化应对措施和国际合作进展",
          category: "环境",
          status: "ongoing",
          hotness_score: 89.3,
          view_count: 12350,
          news_count: 22,
          created_at: "2024-01-14T14:30:00Z"
        },
        {
          id: 3,
          title: "新能源汽车发展",
          description: "电动汽车和新能源技术的产业发展趋势",
          category: "经济",
          status: "ongoing",
          hotness_score: 87.6,
          view_count: 11280,
          news_count: 19,
          created_at: "2024-01-13T09:15:00Z"
        }
      ];
      
      // 根据筛选条件过滤默认事件
      let filteredEvents = defaultEvents;
      if (recommendationType === 'category' && selectedCategory !== 'all') {
        filteredEvents = defaultEvents.filter(event => event.category === selectedCategory);
      }
      
      setEvents(filteredEvents);
      if (filteredEvents.length > 0) {
        setSelectedEvent(filteredEvents[0]);
        fetchEventNews(filteredEvents[0].id);
      } else {
        setSelectedEvent(null);
        setEventNews([]);
      }
    }
  };

  // 获取事件相关新闻
  const fetchEventNews = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}/news?limit=6`);
      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        const newsData = Array.isArray(result.data) ? result.data : result.data.news || [];
        setEventNews(newsData.slice(0, 6));
      }
    } catch (err) {
      console.error('获取事件新闻失败:', err);
      // 使用默认新闻数据
      const defaultNews = [
        {
          id: 401,
          title: "事件相关新闻示例",
          summary: "这是一个事件相关新闻的示例内容",
          source: "科技前沿",
          category: "科技",
          published_at: "2024-01-16 10:00",
          view_count: 3245,
          like_count: 189,
          belonged_event: "AI技术发展"
        }
      ];
      setEventNews(defaultNews);
    }
  };

  // 获取推荐数据
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // 构建API URL
        let apiUrl = 'http://localhost:8080/api/v1/news';
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '20');
        
        if (timeRange !== 'all') {
          params.append('time_range', timeRange);
        }
        
        switch (recommendationType) {
          case 'personalized':
            params.append('sort', 'personalized');
            break;
          case 'hot':
            apiUrl += '/hot';
            break;
          case 'category':
            if (selectedCategory !== 'all') {
              apiUrl += `/category/${encodeURIComponent(selectedCategory)}`;
            }
            break;
        }
        
        apiUrl += `?${params.toString()}`;
        
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
          const newsData = Array.isArray(result.data) ? result.data : result.data.news || [];
          
          // 处理推荐理由
          const processedData = newsData.slice(0, 12).map(news => ({
            ...news,
            reason: getRecommendationReason(recommendationType, selectedCategory)
          }));
          
          setRecommendations(processedData);
        }
      } catch (err) {
        console.error('获取推荐数据失败:', err);
        // 使用默认数据
        setRecommendations([
          {
            id: 101,
            title: "基于您的阅读历史：AI技术在医疗领域的突破性进展",
            summary: "AI技术在医疗领域的应用正在改变传统医疗模式，提高诊断准确性和治疗效果。",
            source: "医学前沿",
            category: "科技",
            published_at: "2024-01-16 09:15",
            reason: "基于您对AI和科技新闻的关注"
          },
          {
            id: 102,
            title: "推荐理由：您关注的新能源话题 - 氢能源技术商业化加速",
            summary: "氢能源技术逐步成熟，多个国家加大投资力度，产业化进程明显加快。",
            source: "能源观察",
            category: "能源",
            published_at: "2024-01-16 08:30",
            reason: "匹配您的新能源关注偏好"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    // 同时获取推荐数据和事件数据
    fetchRecommendations();
    fetchEvents();
  }, [recommendationType, selectedCategory, timeRange]);

  const handleNewsClick = (newsId) => {
    navigate(`/newspage/${newsId}`);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    fetchEventNews(event.id);
  };

  const handleEventDetailClick = (eventId) => {
    navigate(`/story/${eventId}`);
  };

  const getCurrentTitle = () => {
    switch (recommendationType) {
      case 'personalized':
        return '个性化推荐';
      case 'hot':
        return '热门推荐';
      case 'category':
        return `${selectedCategory}分类推荐`;
      default:
        return '个性化推荐';
    }
  };

  if (loading) {
    return (
      <div className="recommend-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在为您生成个性化推荐...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommend-container">
      <Header />
      
      <div className="recommend-content">
        {/* Hero Section */}
        <div className="recommend-hero">
          <h1 className="recommend-title">智能推荐</h1>
          <p className="recommend-subtitle">基于AI算法为您推荐最感兴趣的新闻内容</p>
        </div>

        {/* 统一筛选设置 */}
        <div className="recommendation-settings">
          <div className="settings-header">
            <h3 className="settings-title">智能筛选</h3>
            <span className="settings-subtitle">调整推荐偏好，获得更精准的内容</span>
          </div>
          
          <div className="settings-content">
            <div className="settings-row">
              {/* 推荐类型 */}
              <div className="setting-group">
                <label className="setting-label">推荐类型</label>
                <div className="setting-buttons">
                  <button 
                    className={`setting-btn ${recommendationType === 'personalized' ? 'active' : ''}`}
                    onClick={() => setRecommendationType('personalized')}
                  >
                    个性化
                  </button>
                  <button 
                    className={`setting-btn ${recommendationType === 'hot' ? 'active' : ''}`}
                    onClick={() => setRecommendationType('hot')}
                  >
                    热门
                  </button>
                  <button 
                    className={`setting-btn ${recommendationType === 'category' ? 'active' : ''}`}
                    onClick={() => setRecommendationType('category')}
                  >
                    分类
                  </button>
                </div>
              </div>

              {/* 时间范围 */}
              <div className="setting-group">
                <label className="setting-label">时间范围</label>
                <div className="setting-buttons">
                  <button 
                    className={`setting-btn ${timeRange === 'today' ? 'active' : ''}`}
                    onClick={() => setTimeRange('today')}
                  >
                    今日
                  </button>
                  <button 
                    className={`setting-btn ${timeRange === 'week' ? 'active' : ''}`}
                    onClick={() => setTimeRange('week')}
                  >
                    本周
                  </button>
                  <button 
                    className={`setting-btn ${timeRange === 'month' ? 'active' : ''}`}
                    onClick={() => setTimeRange('month')}
                  >
                    本月
                  </button>
                  <button 
                    className={`setting-btn ${timeRange === 'all' ? 'active' : ''}`}
                    onClick={() => setTimeRange('all')}
                  >
                    全部
                  </button>
                </div>
              </div>
            </div>

            {/* 分类选择器 - 当推荐类型为分类时显示 */}
            {recommendationType === 'category' && (
              <div className="settings-row">
                <div className="setting-group">
                  <label className="setting-label">选择分类</label>
                  <div className="setting-buttons">
                    {categories.map(category => (
                      <button
                        key={category}
                        className={`setting-btn ${
                          selectedCategory === category ? 'active' : ''
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="settings-row">
              {/* 智能开关 */}
              <div className="setting-group">
                <div className="setting-item">
                  <span className="setting-label">个性化推荐</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <div className="setting-item">
                  <span className="setting-label">多样化内容</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 - 两栏布局 */}
        <div className="recommend-main-container">
          {/* 左栏 - 事件列表 + 事件相关新闻 */}
          <div className="events-column">
            <div className="events-header">
              <h2 className="events-title">热门事件</h2>
              <span className="events-count">{events.length} 个事件</span>
            </div>
            
            <div className="events-list">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-stats">
                      <span className="event-hotness">🔥 {event.hotness_score?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-meta">
                    <span className="event-category">{event.category}</span>
                    <span className="event-news-count">{event.news_count || 0} 条新闻</span>
                    <span className="event-views">{event.view_count || 0} 浏览</span>
                  </div>
                  
                  <div className="event-actions">
                    <button 
                      className="event-detail-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventDetailClick(event.id);
                      }}
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 选中事件的新闻 - 在事件下方 */}
            {selectedEvent && events.length > 0 && (
              <div className="event-news-section">
                <div className="event-news-header">
                  <h2 className="event-news-title">
                    事件：{selectedEvent.title}
                  </h2>
                  <span className="event-news-count">{eventNews.length} 条相关新闻</span>
                </div>
                
                <div className="event-news-grid">
                  {eventNews.map((news) => (
                    <div key={news.id} className="event-news-card">
                      <NewsCard 
                        news={news} 
                        eventConfig={eventConfig} 
                        onNewsClick={handleNewsClick} 
                      />
                    </div>
                  ))}
                </div>
                
                {eventNews.length === 0 && (
                  <div className="empty-event-news">
                    <div className="empty-icon">📰</div>
                    <p>该事件暂无相关新闻</p>
                  </div>
                )}
              </div>
            )}

            {/* 事件列表为空时的提示 */}
            {events.length === 0 && (
              <div className="empty-events">
                <div className="empty-icon">📅</div>
                <h3>暂无热门事件</h3>
                <p>当前筛选条件下没有找到相关事件</p>
              </div>
            )}
          </div>

          {/* 右栏 - 纯新闻推荐 */}
          <div className="news-column">
            <div className="recommend-news-section">
              <div className="content-header">
                <h2 className="content-title">
                  {getCurrentTitle()}
                </h2>
                <div className="content-stats">
                  <span className="stats-text">
                    为您找到 {recommendations.length} 条推荐内容
                  </span>
                  <span className="filter-status">
                    📊 {timeRange === 'all' ? '全部时间' : timeRange === 'today' ? '今日' : timeRange === 'week' ? '本周' : '本月'}
                    {recommendationType === 'category' && ` • ${selectedCategory}分类`}
                  </span>
                </div>
              </div>

              {/* News Grid */}
              <div className="recommend-news-grid">
                {recommendations.map((news) => (
                  <div key={news.id} className="news-card-wrapper">
                    <NewsCard 
                      news={news} 
                      eventConfig={eventConfig} 
                      onNewsClick={handleNewsClick} 
                    />
                    {/* 推荐理由 */}
                    {news.reason && (
                      <div className="recommendation-reason">
                        <div className="reason-text">
                          <span className="reason-icon">💡</span>
                          {news.reason}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {recommendations.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📰</div>
                  <h3>暂无推荐内容</h3>
                  <p>我们正在为您寻找更多感兴趣的新闻</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ThemeToggle className="fixed" />
    </div>
  );
}