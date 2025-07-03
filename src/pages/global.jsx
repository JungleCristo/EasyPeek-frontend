import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import './global.css';

const GlobalPage = () => {
  const [currentView, setCurrentView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    categories: ['all'],
    sortBy: 'latest',
    search: ''
  });
  const [isFilterChanged, setIsFilterChanged] = useState(false);
  const [newsPerPage] = useState(6); // 每页显示6条新闻
  const [timelineSortOrder, setTimelineSortOrder] = useState('desc'); // 时间线排序：desc-最新在前，asc-最早在前
  const [globalNewsData, setGlobalNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allNewsData, setAllNewsData] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const navigate = useNavigate();

  // 新闻分类数据 - 使用动态统计的数量
  const categories = useMemo(() => [
    { id: "all", name: "全部", count: categoryCounts.all || 0, color: "bg-gray-100" },
    { id: "politics", name: "政治", count: categoryCounts.politics || 0, color: "bg-red-100" },
    { id: "economy", name: "经济", count: categoryCounts.economy || 0, color: "bg-green-100" },
    { id: "society", name: "社会", count: categoryCounts.society || 0, color: "bg-indigo-100" },
    { id: "tech", name: "科技", count: categoryCounts.tech || 0, color: "bg-blue-100" },
    { id: "sports", name: "体育", count: categoryCounts.sports || 0, color: "bg-orange-100" },
    { id: "entertainment", name: "娱乐", count: categoryCounts.entertainment || 0, color: "bg-pink-100" },
    { id: "international", name: "国际", count: categoryCounts.international || 0, color: "bg-cyan-100" },
    { id: "military", name: "军事", count: categoryCounts.military || 0, color: "bg-slate-100" },
    { id: "education", name: "教育", count: categoryCounts.education || 0, color: "bg-yellow-100" },
    { id: "health", name: "健康", count: categoryCounts.health || 0, color: "bg-purple-100" },
  ], [categoryCounts]);

  // 组件加载时获取所有新闻数据
  useEffect(() => {
    fetchAllNews();
  }, []);

  // 当获取到所有数据后，根据当前筛选条件过滤数据
  useEffect(() => {
    if (allNewsData.length > 0) {
      fetchNewsByCategory(appliedFilters.categories, appliedFilters.sortBy);
    }
  }, [allNewsData, appliedFilters.categories, appliedFilters.sortBy]);

  // 获取所有新闻数据
  const fetchAllNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/news');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        setAllNewsData(result.data);
        calculateCategoryCounts(result.data);
        setError(null);
      } else {
        throw new Error(result.message || '获取新闻数据失败');
      }
    } catch (error) {
      console.error('获取新闻失败:', error);
      setError('获取新闻数据失败，请稍后重试');
      setAllNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  // 计算各分类的新闻数量
  const calculateCategoryCounts = (newsData) => {
    const categoryMap = {
      '政治': 'politics',
      '经济': 'economy', 
      '社会': 'society',
      '科技': 'tech',
      '体育': 'sports',
      '娱乐': 'entertainment',
      '国际': 'international',
      '军事': 'military',
      '教育': 'education',
      '健康': 'health'
    };

    const counts = {
      all: newsData.length,
      politics: 0,
      economy: 0,
      society: 0,
      tech: 0,
      sports: 0,
      entertainment: 0,
      international: 0,
      military: 0,
      education: 0,
      health: 0
    };

    newsData.forEach(news => {
      if (news.category && categoryMap[news.category]) {
        counts[categoryMap[news.category]]++;
      }
    });

    setCategoryCounts(counts);
  };

  // 根据分类和排序过滤新闻数据
  const fetchNewsByCategory = async (categories, sort = 'latest') => {
    try {
      // 如果还没有获取所有数据，先获取
      if (allNewsData.length === 0) {
        await fetchAllNews();
        return;
      }

      let filteredData = [...allNewsData];

      // 根据分类过滤
      if (!categories.includes('all')) {
        const categoryMap = {
          'politics': '政治',
          'economy': '经济',
          'society': '社会', 
          'tech': '科技',
          'sports': '体育',
          'entertainment': '娱乐',
          'international': '国际',
          'military': '军事',
          'education': '教育',
          'health': '健康'
        };
        filteredData = filteredData.filter(news => {
          return categories.some(category => {
            const categoryName = categoryMap[category];
            return categoryName && news.category === categoryName;
          });
        });
      }

      // 根据排序方式排序
      if (sort === 'hot') {
        // 按热度排序（假设有hotness字段，否则按view_count或其他指标）
        filteredData.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      } else {
        // 按最新时间排序
        filteredData.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
      }

      setGlobalNewsData(filteredData);
    } catch (error) {
      console.error('过滤新闻失败:', error);
      setError('处理新闻数据失败，请稍后重试');
    }
  };

  // 所属事件配置 - 复用HomePage.jsx的配置方式
  const eventConfig = {
    "气候变化会议": { label: "气候变化会议", bgColor: "rgba(16, 185, 129, 0.9)" },
    "美国大选": { label: "美国大选", bgColor: "rgba(239, 68, 68, 0.9)" },
    "欧洲经济政策": { label: "欧洲经济政策", bgColor: "rgba(59, 130, 246, 0.9)" },
    "福岛核电站": { label: "福岛核电站", bgColor: "rgba(245, 158, 11, 0.9)" },
    "太空探索": { label: "太空探索", bgColor: "rgba(139, 92, 246, 0.9)" },
    "雨林保护": { label: "雨林保护", bgColor: "rgba(34, 197, 94, 0.9)" },
  };

  // 处理新闻点击事件 - 复用HomePage.jsx的逻辑
  const handleNewsClick = (newsId) => {
    navigate(`/newspage/${newsId}`);
  };

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    navigate('/search');
  };



  // 应用筛选
  const applyFilters = () => {
    setAppliedFilters({
      categories: selectedCategories,
      sortBy: sortBy,
      search: searchQuery
    });
    setIsFilterChanged(false);
    setCurrentPage(1); // 重置到第一页
  };

  // 重置筛选
  const resetFilters = () => {
    setSelectedCategories(['all']);
    setSortBy('latest');
    setSearchQuery('');
    setAppliedFilters({
      categories: ['all'],
      sortBy: 'latest',
      search: ''
    });
    setIsFilterChanged(false);
    setCurrentPage(1);
  };

  // 筛选和排序新闻 - 参考StoryDetailPage.jsx的逻辑
  const filteredAndSortedNews = useMemo(() => {
    let filtered = globalNewsData;

    // 按分类筛选
    if (!appliedFilters.categories.includes('all')) {
      filtered = filtered.filter(news => {
        const categoryMap = {
          'politics': '政治',
          'economy': '经济',
          'society': '社会',
          'tech': '科技',
          'sports': '体育',
          'entertainment': '娱乐',
          'international': '国际',
          'military': '军事',
          'education': '教育',
          'health': '健康'
        };
        // 检查新闻分类是否在选中的分类列表中
        return appliedFilters.categories.some(selectedCat => 
          news.category === categoryMap[selectedCat]
        );
      });
    }

    // 按搜索关键词筛选
    if (appliedFilters.search) {
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        news.summary.toLowerCase().includes(appliedFilters.search.toLowerCase())
      );
    }

    // 排序
    filtered.sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      
      switch (appliedFilters.sortBy) {
        case 'latest':
          return dateB - dateA;
        case 'hot': {
          // 按热度排序，可以基于浏览量、点赞数等指标
          // 这里暂时按创建时间排序，实际项目中可以根据 view_count, like_count 等字段排序
          const hotScoreA = (a.view_count || 0) + (a.like_count || 0) + (a.comment_count || 0);
          const hotScoreB = (b.view_count || 0) + (b.like_count || 0) + (b.comment_count || 0);
          return hotScoreB - hotScoreA || dateB - dateA; // 热度相同时按时间排序
        }
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [globalNewsData, appliedFilters]);

  // 分页逻辑 - 参考StoryDetailPage.jsx的实现
  const totalPages = Math.ceil(filteredAndSortedNews.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const endIndex = startIndex + newsPerPage;
  const currentNews = filteredAndSortedNews.slice(startIndex, endIndex);

  // 分页处理函数
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 滚动到内容区域顶部
    const contentElement = document.querySelector('.main-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 当筛选条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  // 监听筛选条件变化，自动更新isFilterChanged状态
  useEffect(() => {
    const hasChanged = 
      JSON.stringify(selectedCategories) !== JSON.stringify(appliedFilters.categories) ||
      sortBy !== appliedFilters.sortBy ||
      searchQuery !== appliedFilters.search;
    
    setIsFilterChanged(hasChanged);
  }, [selectedCategories, sortBy, searchQuery, appliedFilters]);

  // 渲染网格视图 - 复用HomePage.jsx的新闻卡片样式
  const renderGridView = () => (
    <div className="news-grid">
      {currentNews.map((news) => (
        <div key={news.id} className="news-item" onClick={() => handleNewsClick(news.id)}>
          <div className="news-header">
            {/* 新闻分类标签 - 左上角 */}
            <div className="news-category-badge">
              {news.category}
            </div>
            {/* 所属事件标签 - 右上角 */}
            <div 
              className="news-event-badge"
              style={{
                backgroundColor: eventConfig[news.belonged_event]?.bgColor
              }}
            >
              {eventConfig[news.belonged_event]?.label}
            </div>
          </div>
          <h3 className="news-title">{news.title}</h3>
          <p className="news-summary">{news.summary}</p>
          <div className="news-meta">
            <span className="news-time">{news.published_at}</span>
            <span className="news-source">{news.source}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染列表视图 - 复用HomePage.jsx的新闻卡片样式
  const renderListView = () => (
    <div className="news-list">
      {currentNews.map((news) => (
        <div key={news.id} className="list-item" onClick={() => handleNewsClick(news.id)}>
          <div className="list-content">
            <div className="list-badges">
              <span className="news-category-badge">{news.category}</span>
              <div 
                className="news-event-badge"
                style={{
                  backgroundColor: eventConfig[news.belonged_event]?.bgColor
                }}
              >
                {eventConfig[news.belonged_event]?.label}
              </div>
            </div>
            <h3 className="list-title">{news.title}</h3>
            <p className="list-summary">{news.summary}</p>
            <div className="list-meta">
              <div className="news-meta">
                <span className="news-time">{news.published_at}</span>
                <span className="news-source">{news.source}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染时间线视图 - 复用HomePage.jsx的新闻卡片样式
  const renderTimelineView = () => {
    // 对当前页的新闻按发布时间排序
    const sortedTimelineNews = [...currentNews].sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      return timelineSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
      <div className="timeline-view">
        {/* 时间线排序控制 */}
        <div className="timeline-sort-control">
          <div className="timeline-sort-header">
            <div className="timeline-sort-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </div>
            <label className="timeline-sort-label">时间线排序</label>
          </div>
          <select
            className="timeline-sort-select"
            value={timelineSortOrder}
            onChange={(e) => setTimelineSortOrder(e.target.value)}
          >
            <option value="desc">最新在前</option>
            <option value="asc">最早在前</option>
          </select>
        </div>

        {/* 时间线内容 */}
        <div className="timeline-content-wrapper">
          {sortedTimelineNews.map((news, index) => (
            <div key={news.id} className="timeline-item">
              <div className="timeline-dot">{index + 1}</div>
              <div className="timeline-content" onClick={() => handleNewsClick(news.id)}>
                <div className="timeline-badges">
                  <span className="news-category-badge">{news.category}</span>
                  <div 
                    className="news-event-badge"
                    style={{
                      backgroundColor: eventConfig[news.belonged_event]?.bgColor
                    }}
                  >
                    {eventConfig[news.belonged_event]?.label}
                  </div>
                </div>
                <h4 className="timeline-title">{news.title}</h4>
                <p className="timeline-summary">{news.summary}</p>
                <div className="timeline-meta">
                  <div className="news-meta">
                    <span className="news-time">{news.published_at}</span>
                    <span className="news-source">{news.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="global-container">
      <Header />
      <ThemeToggle className="fixed" />
      
      <div className="global-content">
        {/* 页面标题 */}
        <div className="page-header">
          <h1 className="page-title">全球新闻动态</h1>
          <p className="page-subtitle">追踪全球最新新闻动态，了解世界大事发展过程</p>
        </div>

        {/* 独立搜索框 */}
        <div className="global-search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="搜索全球新闻..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="search-input"
                />
              </div>
              <button className="search-btn" onClick={handleSearchClick}>
                <svg className="search-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                智能化搜索
              </button>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* 侧边栏 */}
          <div className="sidebar">
            {/* 搜索和筛选合并板块 */}
            <div className="sidebar-card">
              <h3 className="card-title">分类与筛选</h3>
              
              {/* 新闻分类部分 */}
              <div className="categories-section">
                <label className="section-label">新闻分类</label>
                <div className="categories-list">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`category-item ${selectedCategories.includes(category.id) ? 'active' : ''}`}
                      onClick={() => {
                        if (category.id === 'all') {
                          // 点击"全部"时，清空其他选择
                          setSelectedCategories(['all']);
                        } else {
                          setSelectedCategories(prev => {
                            // 如果当前包含"全部"，先移除"全部"
                            let newCategories = prev.filter(cat => cat !== 'all');
                            
                            if (newCategories.includes(category.id)) {
                              // 如果已选中，则取消选中
                              newCategories = newCategories.filter(cat => cat !== category.id);
                              // 如果没有选中任何分类，默认选中"全部"
                              if (newCategories.length === 0) {
                                newCategories = ['all'];
                              }
                            } else {
                              // 如果未选中，则添加到选中列表
                              newCategories.push(category.id);
                            }
                            
                            return newCategories;
                          });
                        }
                      }}
                    >
                      <div className="category-info">
                        <div className={`category-dot ${category.color}`}></div>
                        <span className="category-name">{category.name}</span>
                      </div>
                      <span className="category-count">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 筛选选项部分 */}
              <div className="filter-section">
                <label className="section-label">排序方式</label>
                <div className="filter-options">
                  <div className="filter-item">
                    <label className="filter-label">选择排序</label>
                    <select
                      className="filter-select"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                      }}
                    >
                      <option value="latest">最新发布</option>
                      <option value="hot">热度最高</option>
                    </select>
                  </div>
                </div>

                {/* 筛选操作按钮 */}
                <div className="filter-actions">
                  <button
                    className={`apply-filter-btn ${isFilterChanged ? 'active' : ''}`}
                    onClick={applyFilters}
                    disabled={!isFilterChanged}
                  >
                    确定筛选
                  </button>
                  <button
                    className="reset-filter-btn"
                    onClick={resetFilters}
                  >
                    重置筛选
                  </button>
                </div>

                {/* 当前筛选状态显示 */}
                {(!appliedFilters.categories.includes('all') || appliedFilters.sortBy !== 'latest' || appliedFilters.search) && (
                  <div className="current-filters">
                    <h4 className="current-filters-title">当前筛选：</h4>
                    <div className="filter-tags">
                      {!appliedFilters.categories.includes('all') && (
                        <span className="filter-tag">
                          分类: {appliedFilters.categories.map(catId => 
                            categories.find(c => c.id === catId)?.name
                          ).join(', ')}
                        </span>
                      )}
                      {appliedFilters.sortBy !== 'latest' && (
                        <span className="filter-tag">
                          排序: {appliedFilters.sortBy === 'hot' ? '热度最高' : '最新发布'}
                        </span>
                      )}
                      {appliedFilters.search && (
                        <span className="filter-tag">
                          搜索: "{appliedFilters.search}"
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="main-content">
            <div className="content-card">
              {/* 视图切换 */}
              <div className="view-tabs">
                <div className="tabs-list">
                  <button
                    className={`tab-button ${currentView === 'grid' ? 'active' : ''}`}
                    onClick={() => setCurrentView('grid')}
                  >
                    网格视图
                  </button>
                  <button
                    className={`tab-button ${currentView === 'list' ? 'active' : ''}`}
                    onClick={() => setCurrentView('list')}
                  >
                    列表视图
                  </button>
                  <button
                    className={`tab-button ${currentView === 'timeline' ? 'active' : ''}`}
                    onClick={() => setCurrentView('timeline')}
                  >
                    时间线视图
                  </button>
                </div>
              </div>

              {/* 加载状态 */}
              {loading && (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>正在加载新闻...</p>
                </div>
              )}

              {/* 错误状态 */}
              {error && (
                <div className="error-container">
                  <h3>加载失败</h3>
                  <p>{error}</p>
                  <button 
                    className="retry-button"
                    onClick={() => {
                      if (appliedFilters.category === 'all') {
                        fetchNewsByCategory('all', appliedFilters.sortBy);
                      } else {
                        fetchNewsByCategory(appliedFilters.category, appliedFilters.sortBy);
                      }
                    }}
                  >
                    重试
                  </button>
                </div>
              )}

              {/* 新闻内容 */}
              {!loading && !error && (
                <>
                  {currentView === 'grid' && renderGridView()}
                  {currentView === 'list' && renderListView()}
                  {currentView === 'timeline' && renderTimelineView()}

                  {/* 空状态显示 */}
                  {filteredAndSortedNews.length === 0 && (
                    <div className="no-news-results">
                      <h3>暂无符合条件的新闻</h3>
                      <p>请尝试调整筛选条件</p>
                    </div>
                  )}
                </>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    <span>共 {filteredAndSortedNews.length} 条新闻，第 {currentPage} / {totalPages} 页</span>
                  </div>
                  <div className="pagination-controls">
                    <button 
                      className="pagination-btn prev" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </button>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        // 显示逻辑：当前页前后各2页
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 3 || 
                          page === currentPage + 3
                        ) {
                          return <span key={page} className="pagination-ellipsis">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button 
                      className="pagination-btn next" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPage;
