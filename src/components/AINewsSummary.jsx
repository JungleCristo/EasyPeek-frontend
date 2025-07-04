import React, { useState, useEffect } from 'react';
import './AINewsSummary.css';
import { aiApi } from '../api/aiApi';

const AINewsSummary = ({ newsId, news, isEvent = false }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (newsId) {
      loadAnalysis();
    }
  }, [newsId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 首先尝试获取已有的分析结果
      const analysisType = isEvent ? 'event' : 'news';
      const existingAnalysis = await aiApi.getAnalysis(analysisType, newsId);
      
      if (existingAnalysis && existingAnalysis.data) {
        setAnalysis(existingAnalysis.data);
      } else {
        // 如果没有分析结果，则生成新的分析
        await generateAnalysis();
      }
    } catch (err) {
      console.error('加载分析失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (isEvent) {
        response = await aiApi.analyzeEvent(newsId, {
          enableSummary: true,
          enableKeywords: true,
          enableSentiment: true,
          enableTrends: true,
          enableImpact: true,
          showAnalysisSteps: false
        });
      } else {
        response = await aiApi.analyzeNews(newsId, {
          enableSummary: true,
          enableKeywords: true,
          enableSentiment: true,
          enableTrends: false,
          enableImpact: false,
          showAnalysisSteps: false
        });
      }
      
      if (response && response.data) {
        setAnalysis(response.data);
      }
    } catch (err) {
      console.error('生成分析失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😟';
      default:
        return '😐';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="ai-summary-container loading">
        <div className="ai-header">
          <div className="ai-icon">🤖</div>
          <h3>AI 智能分析</h3>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>正在生成智能分析...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-summary-container error">
        <div className="ai-header">
          <div className="ai-icon">🤖</div>
          <h3>AI 智能分析</h3>
        </div>
        <div className="error-content">
          <p>😅 分析服务暂时不可用</p>
          <button onClick={generateAnalysis} className="retry-btn">
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="ai-summary-container empty">
        <div className="ai-header">
          <div className="ai-icon">🤖</div>
          <h3>AI 智能分析</h3>
        </div>
        <div className="empty-content">
          <p>🚀 让AI为你分析这篇新闻</p>
          <button onClick={generateAnalysis} className="analyze-btn">
            开始分析
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-summary-container">
      <div className="ai-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ai-icon">🤖</div>
        <h3>AI 智能分析</h3>
        <div className="expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      <div className={`ai-content ${isExpanded ? 'expanded' : ''}`}>
        {/* 摘要部分 */}
        {analysis.summary && (
          <div className="summary-section">
            <h4>📝 智能摘要</h4>
            <p className="summary-text">{analysis.summary}</p>
          </div>
        )}

        {/* 关键词部分 */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <div className="keywords-section">
            <h4>🏷️ 关键词</h4>
            <div className="keywords-list">
              {analysis.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 情感分析部分 */}
        {analysis.sentiment && (
          <div className="sentiment-section">
            <h4>💭 情感倾向</h4>
            <div className="sentiment-info">
              <span className="sentiment-icon">
                {getSentimentIcon(analysis.sentiment)}
              </span>
              <span className={`sentiment-text ${getSentimentColor(analysis.sentiment)}`}>
                {analysis.sentiment === 'positive' ? '积极' : 
                 analysis.sentiment === 'negative' ? '消极' : '中性'}
              </span>
              {analysis.sentiment_score && (
                <span className="sentiment-score">
                  (置信度: {(analysis.sentiment_score * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* 事件特有分析 - 影响力评估 */}
        {isEvent && analysis.impact_level && (
          <div className="impact-section">
            <h4>📊 影响力评估</h4>
            <div className="impact-info">
              <div className="impact-level">
                <span className="impact-label">影响级别:</span>
                <span className={`impact-value ${analysis.impact_level}`}>
                  {analysis.impact_level === 'high' ? '高' : 
                   analysis.impact_level === 'medium' ? '中' : '低'}
                </span>
              </div>
              {analysis.impact_score && (
                <div className="impact-score">
                  <span className="impact-label">影响分数:</span>
                  <span className="impact-value">{analysis.impact_score}/10</span>
                </div>
              )}
              {analysis.impact_scope && (
                <div className="impact-scope">
                  <span className="impact-label">影响范围:</span>
                  <span className="impact-value">{analysis.impact_scope}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 事件分析 */}
        {isEvent && analysis.event_analysis && (
          <div className="event-analysis-section">
            <h4>🔍 深度分析</h4>
            <p className="event-analysis-text">{analysis.event_analysis}</p>
          </div>
        )}

        {/* 趋势预测 */}
        {isEvent && analysis.trend_predictions && analysis.trend_predictions.length > 0 && (
          <div className="trends-section">
            <h4>📈 趋势预测</h4>
            <div className="trend-predictions">
              {analysis.trend_predictions.map((prediction, index) => (
                <div key={index} className="trend-item">
                  <div className="trend-timeframe">{prediction.timeframe}</div>
                  <div className="trend-description">{prediction.trend}</div>
                  <div className="trend-probability">
                    概率: {(prediction.probability * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 模型信息 */}
        <div className="model-info">
          <small>
            由 {analysis.model_name || 'AI'} 分析 • 
            置信度: {(analysis.confidence * 100).toFixed(1)}% • 
            {analysis.processing_time}秒
          </small>
        </div>
      </div>
    </div>
  );
};

export default AINewsSummary; 