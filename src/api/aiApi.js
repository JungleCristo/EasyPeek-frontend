const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// AI分析相关API
export const aiApi = {
  // 分析新闻
  analyzeNews: async (newsId, options = {}) => {
    const requestBody = {
      type: 'news',
      target_id: newsId,
      options: {
        enable_summary: options.enableSummary ?? true,
        enable_keywords: options.enableKeywords ?? true,
        enable_sentiment: options.enableSentiment ?? true,
        enable_trends: options.enableTrends ?? false,
        enable_impact: options.enableImpact ?? false,
        show_analysis_steps: options.showAnalysisSteps ?? false,
        ...options
      }
    };

    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '分析失败');
    }

    return response.json();
  },

  // 分析事件
  analyzeEvent: async (eventId, options = {}) => {
    const requestBody = {
      type: 'event',
      target_id: eventId,
      options: {
        enable_summary: options.enableSummary ?? true,
        enable_keywords: options.enableKeywords ?? true,
        enable_sentiment: options.enableSentiment ?? true,
        enable_trends: options.enableTrends ?? true,
        enable_impact: options.enableImpact ?? true,
        show_analysis_steps: options.showAnalysisSteps ?? true,
        ...options
      }
    };

    const response = await fetch(`${API_BASE_URL}/ai/analyze-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '事件分析失败');
    }

    return response.json();
  },

  // 获取分析结果
  getAnalysis: async (type, targetId) => {
    const response = await fetch(
      `${API_BASE_URL}/ai/analysis?type=${type}&target_id=${targetId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 没有找到分析结果
      }
      const error = await response.json();
      throw new Error(error.message || '获取分析结果失败');
    }

    return response.json();
  },

  // 快速总结新闻
  summarizeNews: async (newsId) => {
    const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ news_id: newsId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '总结生成失败');
    }

    return response.json();
  },

  // 批量分析新闻
  batchAnalyzeNews: async (newsIds, options = {}) => {
    const requestBody = {
      news_ids: newsIds,
      options: {
        enable_summary: options.enableSummary ?? true,
        enable_keywords: options.enableKeywords ?? true,
        enable_sentiment: options.enableSentiment ?? false,
        enable_trends: options.enableTrends ?? false,
        enable_impact: options.enableImpact ?? false,
        show_analysis_steps: options.showAnalysisSteps ?? false,
        ...options
      }
    };

    const response = await fetch(`${API_BASE_URL}/ai/batch-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量分析失败');
    }

    return response.json();
  },

  // 获取AI分析统计
  getAnalysisStats: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取统计信息失败');
    }

    return response.json();
  },
};

export default aiApi;