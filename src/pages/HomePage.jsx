import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ThemeToggle from "../components/ThemeToggle";
import NewsCard from "../components/NewsCard";
import { eventConfig, eventStatusConfig } from '../utils/statusConfig';
import "./HomePage.css";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [hotNews, setHotNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // API调用函数
  const fetchNews = async (endpoint, limit = 6) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/news${endpoint}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  // 获取热点事件数据
  const fetchEvents = async (endpoint = '') => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/events${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching events${endpoint}:`, error);
      throw error;
    }
  };

  // 获取所有数据
  const fetchAllNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [latestNewsData, hotNewsData, eventsData] = await Promise.all([
        fetchNews('/latest', 12), // 获取更多最新新闻用于分配
        fetchNews('/hot', 6), // 获取热门新闻
        fetchEvents('/hot'), // 获取热点事件
      ]);
      
      // 今日焦点：从最新新闻中选择热度最高的6条
      const featuredNewsData = latestNewsData
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0)) // 按热度排序
        .slice(0, 6);
      
      // 全球最新动态：排除已在今日焦点中的新闻
      const featuredIds = new Set(featuredNewsData.map(news => news.id));
      const remainingLatestNews = latestNewsData
        .filter(news => !featuredIds.has(news.id))
        .slice(0, 6);
      
      setFeaturedNews(featuredNewsData);
      setHotNews(hotNewsData);
      setLatestNews(remainingLatestNews);
      setEvents(eventsData);
    } catch (error) {
      setError('获取数据失败，请稍后重试');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchAllNews();
  }, []);


  const handlePrevNews = () => {
    setCurrentNewsIndex((prev) => 
      prev === 0 ? featuredNews.length - 1 : prev - 1
    );
  };

  const handleNextNews = () => {
    setCurrentNewsIndex((prev) => 
      prev === featuredNews.length - 1 ? 0 : prev + 1
    );
  };

  // 处理新闻点击事件
  const handleNewsClick = (newsId) => {
    navigate(`/newspage/${newsId}`);
  };

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    navigate('/search');
  };

  const currentNews = featuredNews.length > 0 ? featuredNews[currentNewsIndex] : null;

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="homepage-container">
        <Header />
        <div className="homepage-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在加载新闻数据...</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="homepage-container">
        <Header />
        <div className="homepage-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchAllNews} className="retry-btn">重试</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-container">
      <Header />

      <div className="homepage-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">欢迎来到 EasyPeek</h1>
          <p className="hero-subtitle">追踪最新新闻动态，了解事件完整发展过程</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-wrapper">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="搜索新闻、事件或话题..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="search-btn" onClick={handleSearchClick}>
                <svg className="search-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>智能化搜索</span>
              </button>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* Sidebar */}
          <div className="sidebar">
            {/* 单独新闻展示 */}
            <div className="sidebar-card">
              <h3 className="card-title">今日焦点</h3>
              {currentNews ? (
                <div className="single-news-container" onClick={() => handleNewsClick(currentNews.id)}>
                  <h4 className="single-news-title">{currentNews.title}</h4>
                  <p className="single-news-summary">{currentNews.summary || currentNews.description}</p>
                  <div className="single-news-meta">
                    <span className="single-news-time">{new Date(currentNews.published_at).toLocaleString()}</span>
                    <span className="single-news-source">{currentNews.source}</span>
                  </div>
                  {/* 转换箭头 */}
                  <div className="news-navigation">
                    <button className="nav-arrow prev-arrow" onClick={(e) => {
                      e.stopPropagation();
                      handlePrevNews();
                    }}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="news-indicator">
                      {currentNewsIndex + 1} / {featuredNews.length}
                    </div>
                    <button className="nav-arrow next-arrow" onClick={(e) => {
                      e.stopPropagation();
                      handleNextNews();
                    }}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-news-message">
                  <p>暂无新闻数据</p>
                </div>
              )}
            </div>

            {/* Events */}
            <div className="sidebar-card">
              <h3 className="card-title">热点事件</h3>
              <div className="categories-list">
                {loading ? (
                  <div className="loading-message">
                    <p>加载中...</p>
                  </div>
                ) : events.length > 0 ? (
                  events.map((event) => {
                    const status = event.status || 'ongoing';
                    const statusConfig = eventStatusConfig[status] || eventStatusConfig['ongoing'];
                    return (
                      <div key={event.id} className="category-item">
                        <div className="category-info">
                          <div 
                            className="category-dot" 
                            style={{ backgroundColor: statusConfig.color }}
                          />
                          <span className="category-name">{event.title || event.name}</span>
                        </div>
                        <span 
                          className="category-count"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-events-message">
                    <p>暂无热点事件</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {/* Global Latest News */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">全球最新动态</h2>
                <p className="card-subtitle">最新发布的新闻资讯</p>
              </div>
              <div className="card-body">
                <div className="news-grid">
                  {latestNews.length > 0 ? (
                    latestNews.map((news) => (
                      <NewsCard 
                        key={news.id} 
                        news={news} 
                        eventConfig={eventConfig} 
                        onNewsClick={handleNewsClick} 
                      />
                    ))
                  ) : (
                    <div className="no-news-message">
                      <p>暂无最新新闻</p>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <Link to="/global">
                    <button className="more-btn">查看更多新闻</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Hot News */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">热门推荐</h2>
                <p className="card-subtitle">当前最热门的新闻话题</p>
              </div>
              <div className="card-body">
                <div className="news-grid">
                  {hotNews.length > 0 ? (
                    hotNews.map((news) => (
                      <NewsCard 
                        key={news.id} 
                        news={news} 
                        eventConfig={eventConfig} 
                        onNewsClick={handleNewsClick} 
                      />
                    ))
                  ) : (
                    <div className="no-news-message">
                      <p>暂无热门新闻</p>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <Link to="/recommend">
                    <button className="more-btn">查看更多新闻</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 浮动按钮组 */}
      <ThemeToggle className="fixed" />
    </div>
  );
}
