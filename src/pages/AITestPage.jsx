import React, { useState } from 'react';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import AINewsSummary from '../components/AINewsSummary';
import AISmartSearch from '../components/AISmartSearch';
import { aiApi } from '../api/aiApi';

const AITestPage = () => {
  const [selectedNewsId, setSelectedNewsId] = useState(1);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const mockNews = {
    id: 1,
    title: "AI技术在新闻分析中的应用突破",
    content: "人工智能技术在新闻分析领域取得了重大突破，能够自动提取关键信息、分析情感倾向，并预测发展趋势。",
    category: "科技",
    source: "科技日报",
    published_at: new Date().toISOString()
  };

  const handleSearch = (searchParams) => {
    console.log('搜索参数:', searchParams);
    setTestResults(prev => [...prev, {
      type: 'search',
      params: searchParams,
      timestamp: new Date().toLocaleString()
    }]);
  };

  const testApiConnection = async () => {
    setLoading(true);
    try {
      // 测试AI分析统计API
      const stats = await aiApi.getAnalysisStats();
      setTestResults(prev => [...prev, {
        type: 'api_test',
        result: 'API连接成功',
        data: stats,
        timestamp: new Date().toLocaleString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'api_test',
        result: 'API连接失败',
        error: error.message,
        timestamp: new Date().toLocaleString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testNewsAnalysis = async () => {
    setLoading(true);
    try {
      const analysis = await aiApi.analyzeNews(selectedNewsId, {
        enableSummary: true,
        enableKeywords: true,
        enableSentiment: true
      });
      setTestResults(prev => [...prev, {
        type: 'analysis_test',
        result: '新闻分析成功',
        data: analysis,
        timestamp: new Date().toLocaleString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'analysis_test',
        result: '新闻分析失败',
        error: error.message,
        timestamp: new Date().toLocaleString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ color: '#2d3748', marginBottom: '8px' }}>🤖 AI功能测试页面</h1>
          <p style={{ color: '#718096', marginBottom: '24px' }}>
            测试AI新闻总结和智能搜索功能
          </p>

          {/* 测试按钮区域 */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={testApiConnection}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {loading ? '测试中...' : '🔗 测试API连接'}
            </button>

            <button
              onClick={testNewsAnalysis}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #48bb78, #38a169)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {loading ? '分析中...' : '📝 测试新闻分析'}
            </button>

            <button
              onClick={clearResults}
              style={{
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🗑️ 清除结果
            </button>
          </div>

          {/* 新闻ID选择 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              选择测试新闻ID:
            </label>
            <input
              type="number"
              value={selectedNewsId}
              onChange={(e) => setSelectedNewsId(parseInt(e.target.value) || 1)}
              style={{
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                width: '200px'
              }}
              min="1"
            />
          </div>
        </div>

        {/* AI智能搜索测试 */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2d3748', marginBottom: '16px' }}>🔍 智能搜索测试</h2>
          <AISmartSearch 
            onSearch={handleSearch}
            placeholder="测试智能搜索功能..."
          />
        </div>

        {/* AI新闻总结测试 */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2d3748', marginBottom: '16px' }}>📰 新闻AI分析测试</h2>
          <p style={{ color: '#718096', marginBottom: '16px', fontSize: '14px' }}>
            测试新闻ID: {selectedNewsId}
          </p>
          <AINewsSummary 
            newsId={selectedNewsId} 
            news={mockNews}
            isEvent={false}
          />
        </div>

        {/* 测试结果显示 */}
        {testResults.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#2d3748', marginBottom: '16px' }}>📊 测试结果</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f7fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ 
                      background: result.type === 'search' ? '#e6fffa' : 
                                result.type === 'api_test' ? '#fef5e7' : '#e6f3ff',
                      color: result.type === 'search' ? '#234e52' : 
                            result.type === 'api_test' ? '#744210' : '#1e3a8a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {result.type === 'search' ? '搜索测试' : 
                       result.type === 'api_test' ? 'API测试' : '分析测试'}
                    </span>
                    <span style={{ color: '#718096', fontSize: '12px' }}>
                      {result.timestamp}
                    </span>
                  </div>
                  <div style={{ color: '#2d3748', fontSize: '14px', marginBottom: '8px' }}>
                    <strong>结果:</strong> {result.result}
                  </div>
                  {result.error && (
                    <div style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '8px' }}>
                      <strong>错误:</strong> {result.error}
                    </div>
                  )}
                  {result.data && (
                    <div style={{ 
                      background: '#2d3748', 
                      color: '#e2e8f0', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </div>
                  )}
                  {result.params && (
                    <div style={{ 
                      background: '#2d3748', 
                      color: '#e2e8f0', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(result.params, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ThemeToggle />
    </div>
  );
};

export default AITestPage; 