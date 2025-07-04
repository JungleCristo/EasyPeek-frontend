import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { safeDisplayText, safeDisplayTitle, splitIntoParagraphs } from '../utils/htmlUtils';
import { getCategoryNames } from '../utils/statusConfig';
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
  
  // 筛选相关状态
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' 或 'hot'
  const [allCategories, setAllCategories] = useState([]);

  // 评论相关状态
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const COMMENTS_PAGE_SIZE = 5;
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 点赞相关状态
  const [likedComments, setLikedComments] = useState(new Set()); // 存储已点赞的评论ID
  const [likedCommentsLoading, setLikedCommentsLoading] = useState(new Set()); // 存储正在点赞的评论ID
  
  // 回复相关状态
  const [replyingTo, setReplyingTo] = useState(null); // 当前正在回复的评论ID
  const [replyInput, setReplyInput] = useState(""); // 回复输入内容

  // 分页相关计算
  const totalPages = Math.ceil(commentsTotal / COMMENTS_PAGE_SIZE);
  const hasNextPage = commentsPage < totalPages;
  const hasPrevPage = commentsPage > 1;

  // 格式化新闻数据，处理字段映射
  const formatNewsData = (rawData) => {
    if (!rawData) return null;
    
    return {
      ...rawData,
      // 处理字段映射
      readCount: rawData.view_count || 0,
      likeCount: rawData.like_count || 0,
      commentCount: rawData.comment_count || 0,
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

  // 获取当前用户ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/api/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.code === 200 && res.data) setCurrentUserId(res.data.id);
        });
    }
  }, []);

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/news?limit=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        // 提取所有分类并去重
        const categories = [...new Set(result.data.map(news => news.category).filter(Boolean))];
        setAllCategories(categories);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      // 使用配置文件中的分类作为默认值
      setAllCategories(getCategoryNames());
    }
  };

  // 获取筛选后的新闻
  const fetchFilteredNews = async (newsId) => {
    try {
      setRelatedLoading(true);
      
      let endpoint = '';
      let queryParams = new URLSearchParams();
      
      // 根据分类和排序方式选择API端点
      if (selectedCategory !== 'all') {
        // 使用按分类筛选的API
        endpoint = `/category/${selectedCategory}`;
        queryParams.append('sort', sortBy);
        queryParams.append('limit', '20');
      } else {
        // 使用原有的热门或最新API
        if (sortBy === 'hot') {
          endpoint = '/hot';
        } else {
          endpoint = '/latest';
        }
        queryParams.append('limit', '20');
      }
      
      const response = await fetch(`http://localhost:8080/api/v1/news${endpoint}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        // 过滤掉当前新闻
        const filtered = result.data.filter(news => news.id !== parseInt(newsId));
        
        const formattedRelated = formatRelatedNews(filtered.slice(0, 6));
        setRelatedNews(formattedRelated);
      }
    } catch (error) {
      console.error('获取筛选新闻失败:', error);
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
    fetchCategories(); // 获取分类列表
  }, [id]);

  // 当筛选条件改变时重新获取相关新闻
  useEffect(() => {
    if (id) {
      fetchFilteredNews(id);
    }
  }, [selectedCategory, sortBy, id]);

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



  // 格式化评论数据
  const formatComments = (commentsList) => {
    return commentsList.map(comment => ({
      ...comment,
      created_at: comment.created_at ? new Date(comment.created_at).toLocaleString('zh-CN') : '',
      // 格式化回复数据
      replies: comment.replies ? comment.replies.map(reply => ({
        ...reply,
        created_at: reply.created_at ? new Date(reply.created_at).toLocaleString('zh-CN') : ''
      })) : []
    }));
  };

  // 获取新闻评论，支持分页
  const fetchComments = async (newsId, page = 1) => {
    console.log(`fetchComments: newsId=${newsId}, page=${page}`);
    setCommentsLoading(true);
    try {
      const url = `http://localhost:8080/api/v1/comments/news/${newsId}?page=${page}&size=${COMMENTS_PAGE_SIZE}`;
      console.log(`请求URL: ${url}`);
      const response = await fetch(url);
      const result = await response.json();
      console.log(`API响应:`, result);
      
      if (result.code === 200 && Array.isArray(result.data)) {
        const formattedComments = formatComments(result.data);
        console.log(`格式化后的评论:`, formattedComments);
        // 使用后端返回的total字段
        setCommentsTotal(result.total || 0);
        setComments(formattedComments);
        console.log(`设置评论: 新评论数=${formattedComments.length}`);
      } else {
        console.log(`API返回错误或数据格式不正确:`, result);
        setComments([]);
        setCommentsTotal(0);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      setComments([]);
      setCommentsTotal(0);
    } finally {
      setCommentsLoading(false);
    }
  };

  // 发表评论
  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      let url, headers, body;
      
      if (token) {
        // 已登录用户使用原有接口
        url = 'http://localhost:8080/api/v1/comments';
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        };
        body = JSON.stringify({ news_id: Number(id), content: commentInput.trim() });
      } else {
        // 未登录用户使用匿名评论接口
        url = 'http://localhost:8080/api/v1/comments/anonymous';
        headers = {
          'Content-Type': 'application/json'
        };
        body = JSON.stringify({ news_id: Number(id), content: commentInput.trim() });
      }
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body
      });
      const result = await res.json();
      if (result.code === 200) {
        setCommentInput('');
        setComments([]);
        setCommentsPage(1);
        fetchComments(id, 1);
      } else {
        alert(result.message || '评论失败');
      }
    } catch (_) {
      alert('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/v1/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.code === 200) {
        setComments([]);
        setCommentsPage(1);
        fetchComments(id, 1);
      } else {
        alert(result.message || '删除失败');
      }
    } catch (_) {
      alert('删除失败');
    }
  };

  // 分页导航函数
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log(`切换到第${newPage}页`);
      setCommentsPage(newPage);
      fetchComments(id, newPage);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      handlePageChange(commentsPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      handlePageChange(commentsPage + 1);
    }
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // 最多显示5个页码
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数不多，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 如果总页数很多，显示当前页附近的页码
      let start = Math.max(1, commentsPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // 调整起始位置，确保显示maxVisiblePages个页码
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      // 添加第一页（如果不是连续的）
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...'); // 省略号
        }
      }
      
      // 添加中间页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // 添加最后一页（如果不是连续的）
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...'); // 省略号
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handleLastPage = () => {
    handlePageChange(totalPages);
  };

  // 处理评论点赞
  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('点赞需要先登录哦');
      return;
    }

    // 防止重复点击
    if (likedCommentsLoading.has(commentId)) {
      return;
    }

    const isLiked = likedComments.has(commentId);
    const endpoint = isLiked ? 'DELETE' : 'POST';
    
    // 添加调试信息
    console.log(`点赞操作: 评论ID=${commentId}, 当前状态=${isLiked ? '已点赞' : '未点赞'}, 请求方法=${endpoint}`);
    
    try {
      setLikedCommentsLoading(prev => new Set(prev).add(commentId));
      
      const url = `http://localhost:8080/api/v1/comments/${commentId}/like`;
      console.log(`发送请求到: ${url}`);
      
      const response = await fetch(url, {
        method: endpoint,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`响应状态: ${response.status}`);
      const result = await response.json();
      console.log(`响应数据:`, result);
      
      if (result.code === 200) {
        // 更新点赞状态
        setLikedComments(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(commentId);
          } else {
            newSet.add(commentId);
          }
          return newSet;
        });

        // 更新评论列表中的点赞数（包括回复）
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              like_count: isLiked ? comment.like_count - 1 : comment.like_count + 1
            };
          }
          // 检查是否是回复的点赞
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  like_count: isLiked ? reply.like_count - 1 : reply.like_count + 1
                };
              }
              return reply;
            });
            return {
              ...comment,
              replies: updatedReplies
            };
          }
          return comment;
        }));
        
        console.log(`点赞操作成功: ${isLiked ? '取消点赞' : '点赞'}`);
      } else {
        console.error(`点赞操作失败: ${result.message}`);
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setLikedCommentsLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // 处理回复点击
  const handleReplyClick = (commentId) => {
    if (!currentUserId) {
      alert('回复需要先登录哦');
      return;
    }
    setReplyingTo(commentId);
    setReplyInput('');
  };

  // 处理提交回复
  const handleSubmitReply = async (commentId) => {
    if (!replyInput.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('回复需要先登录哦');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('http://localhost:8080/api/v1/comments/reply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          news_id: parseInt(id),
          parent_id: commentId,
          content: replyInput.trim()
        })
      });

      const result = await response.json();
      
      if (result.code === 200) {
        // 回复成功，重新加载评论
        setReplyInput('');
        setReplyingTo(null);
        setComments([]);
        setCommentsPage(1);
        fetchComments(id, 1);
        alert('回复成功！');
      } else {
        alert(result.message || '回复失败');
      }
    } catch (error) {
      console.error('回复失败:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 首次加载和切换新闻时，重置评论
  useEffect(() => {
    setComments([]);
    setCommentsPage(1);
    fetchComments(id, 1);
  }, [id]);

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
                
                <h1 className="news-title">{safeDisplayTitle(newsData.title)}</h1>
                <p className="news-summary">{safeDisplayText(newsData.summary, 300)}</p>
                
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
                  {newsData.content && splitIntoParagraphs(newsData.content).map((paragraph, index) => {
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

            {/* 相关新闻 */}
            <div className="sidebar-card">
              <h3 className="card-title">相关新闻</h3>
              
              {/* 筛选控件 */}
              <div className="news-filters">
                {/* 排序方式 */}
                <div className="filter-group">
                  <label className="filter-label">排序方式</label>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${sortBy === 'latest' ? 'active' : ''}`}
                      onClick={() => setSortBy('latest')}
                    >
                      最新发布
                    </button>
                    <button 
                      className={`filter-btn ${sortBy === 'hot' ? 'active' : ''}`}
                      onClick={() => setSortBy('hot')}
                    >
                      热度最高
                    </button>
                  </div>
                </div>

                {/* 分类筛选 */}
                <div className="filter-group">
                  <label className="filter-label">新闻分类</label>
                  <select 
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">全部分类</option>
                    {allCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
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
                      <h4 className="related-news-title">{safeDisplayTitle(news.title)}</h4>
                      <p className="related-news-summary">{safeDisplayText(news.summary, 100)}</p>
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
              <h3 className="card-title">💬 热门评论 ({commentsTotal})</h3>
              {/* 评论输入框 */}
              <div className="comment-input-row">
                <input
                  className="comment-input"
                  placeholder={currentUserId ? "哎呦，不错哦，发条评论吧" : "未登录用户也可以发表评论哦"}
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  maxLength={1000}
                  disabled={submitting}
                />
                <button
                  className="comment-submit-btn"
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentInput.trim()}
                >
                  {currentUserId ? "发布" : "匿名发布"}
                </button>
              </div>
              <div className="comments-list">
                {commentsLoading ? (
                  <div className="loading-container"><p>正在加载评论...</p></div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className={`comment-avatar ${comment.is_anonymous ? 'anonymous' : ''}`}>
                        {comment.is_anonymous ? '匿' : '用'}
                      </div>
                      <div className="comment-content">
                        <div className={`comment-author ${comment.is_anonymous ? 'anonymous' : ''}`}>
                          {comment.is_anonymous ? '未命名用户' : (comment.username || `用户 ${comment.user_id}`)}
                        </div>
                        <div className="comment-text">{comment.content}</div>
                        
                        {/* 回复列表 */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="replies-container">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="reply-item">
                                <div className={`reply-avatar ${reply.is_anonymous ? 'anonymous' : ''}`}>
                                  {reply.is_anonymous ? '匿' : '用'}
                                </div>
                                <div className="reply-content">
                                  <div className={`reply-author ${reply.is_anonymous ? 'anonymous' : ''}`}>
                                    {reply.is_anonymous ? '未命名用户' : (reply.username || `用户 ${reply.user_id}`)}
                                  </div>
                                  <div className="reply-text">{reply.content}</div>
                                  <div className="reply-footer">
                                    <div className="reply-time">{reply.created_at}</div>
                                    <div className="reply-actions">
                                      {/* 回复的点赞按钮 */}
                                      <button
                                        className={`reply-like-btn ${likedComments.has(reply.id) ? 'liked' : ''} ${likedCommentsLoading.has(reply.id) ? 'loading' : ''}`}
                                        onClick={() => handleLikeComment(reply.id)}
                                        disabled={likedCommentsLoading.has(reply.id)}
                                      >
                                        <svg 
                                          className="like-icon" 
                                          fill={likedComments.has(reply.id) ? "currentColor" : "none"} 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={likedComments.has(reply.id) ? "0" : "2"} 
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                          />
                                        </svg>
                                        <span className="like-count">{reply.like_count || 0}</span>
                                      </button>
                                      
                                      {/* 回复的删除按钮 */}
                                      {!reply.is_anonymous && currentUserId === reply.user_id && (
                                        <div className="reply-delete-actions">
                                          <span
                                            className="reply-action-dot"
                                            onClick={() => {
                                              setDeleteTargetId(reply.id);
                                              setShowDeleteConfirm(true);
                                            }}
                                          >···</span>
                                          {showDeleteConfirm && deleteTargetId === reply.id && (
                                            <div className="reply-delete-confirm">
                                              <span
                                                className="reply-delete-btn"
                                                onClick={() => {
                                                  setShowDeleteConfirm(false);
                                                  handleDeleteComment(reply.id);
                                                }}
                                              >删除</span>
                                              <span
                                                className="reply-cancel-btn"
                                                onClick={() => setShowDeleteConfirm(false)}
                                              >取消</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* 回复输入框 */}
                        {replyingTo === comment.id && (
                          <div className="reply-input-container">
                            <input
                              className="reply-input"
                              placeholder="写下你的回复..."
                              value={replyInput}
                              onChange={e => setReplyInput(e.target.value)}
                              maxLength={1000}
                              disabled={submitting}
                            />
                            <div className="reply-actions">
                              <button
                                className="reply-submit-btn"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={submitting || !replyInput.trim()}
                              >
                                回复
                              </button>
                              <button
                                className="reply-cancel-btn"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyInput('');
                                }}
                                disabled={submitting}
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="comment-footer">
                          <div className="comment-time">{comment.created_at}</div>
                          <div className="comment-actions">
                            {/* 点赞按钮 */}
                            <button
                              className={`comment-like-btn ${likedComments.has(comment.id) ? 'liked' : ''} ${likedCommentsLoading.has(comment.id) ? 'loading' : ''}`}
                              onClick={() => handleLikeComment(comment.id)}
                              disabled={likedCommentsLoading.has(comment.id)}
                            >
                              <svg 
                                className="like-icon" 
                                fill={likedComments.has(comment.id) ? "currentColor" : "none"} 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={likedComments.has(comment.id) ? "0" : "2"} 
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                />
                              </svg>
                              <span className="like-count">{comment.like_count || 0}</span>
                            </button>
                            
                            {/* 回复按钮 */}
                            <button
                              className="comment-reply-btn"
                              onClick={() => handleReplyClick(comment.id)}
                            >
                              回复
                            </button>
                            
                            {/* 删除按钮，仅显示在自己评论右侧，匿名评论不能删除 */}
                            {!comment.is_anonymous && currentUserId === comment.user_id && (
                              <div className="comment-delete-actions">
                                <span
                                  className="comment-action-dot"
                                  onClick={() => {
                                    setDeleteTargetId(comment.id);
                                    setShowDeleteConfirm(true);
                                  }}
                                >···</span>
                                {showDeleteConfirm && deleteTargetId === comment.id && (
                                  <div className="comment-delete-confirm">
                                    <span
                                      className="comment-delete-btn"
                                      onClick={() => {
                                        setShowDeleteConfirm(false);
                                        handleDeleteComment(comment.id);
                                      }}
                                    >删除</span>
                                    <span
                                      className="comment-cancel-btn"
                                      onClick={() => setShowDeleteConfirm(false)}
                                    >取消</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments"><p>暂无评论</p></div>
                )}
              </div>
              {/* 分页组件 */}
              {totalPages > 1 && (
                <div className="comments-pagination">
                  <div className="pagination-info">
                    第 {commentsPage} 页，共 {totalPages} 页 ({commentsTotal} 条评论)
                    {commentsLoading && <span className="loading-indicator"> 加载中...</span>}
                  </div>
                  <div className="pagination-controls">
                    {/* 第一页按钮 */}
                    <button
                      className={`pagination-btn first-btn ${commentsPage === 1 ? 'disabled' : ''}`}
                      onClick={handleFirstPage}
                      disabled={commentsPage === 1}
                      title="第一页"
                    >
                      <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* 上一页按钮 */}
                    <button
                      className={`pagination-btn prev-btn ${!hasPrevPage ? 'disabled' : ''}`}
                      onClick={handlePrevPage}
                      disabled={!hasPrevPage}
                    >
                      <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      上一页
                    </button>
                    
                    {/* 页码按钮 */}
                    <div className="page-numbers">
                      {getPageNumbers().map((pageNum, index) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                        ) : (
                          <button
                            key={pageNum}
                            className={`page-number ${pageNum === commentsPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}
                    </div>
                    
                    {/* 下一页按钮 */}
                    <button
                      className={`pagination-btn next-btn ${!hasNextPage ? 'disabled' : ''}`}
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                    >
                      下一页
                      <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* 最后一页按钮 */}
                    <button
                      className={`pagination-btn last-btn ${commentsPage === totalPages ? 'disabled' : ''}`}
                      onClick={handleLastPage}
                      disabled={commentsPage === totalPages}
                      title="最后一页"
                    >
                      <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m-8-7l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 浮动按钮组 */}
      <ThemeToggle className="fixed" />
    </div>
  );
}