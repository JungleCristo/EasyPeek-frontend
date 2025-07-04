import React, { useState, useCallback, useEffect } from 'react';
import './AISmartSearch.css';
import { aiApi } from '../api/aiApi';

const AISmartSearch = ({ onSearch, placeholder = "搜索新闻..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState('normal'); // normal, semantic, keywords
  const [recentSearches, setRecentSearches] = useState([]);
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  // 从localStorage加载最近搜索
  useEffect(() => {
    const saved = localStorage.getItem('easypeek_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('解析最近搜索失败:', e);
      }
    }
  }, []);

  // 智能建议的关键词
  useEffect(() => {
    const suggestions = [
      { icon: '📈', text: '科技创新', category: 'tech' },
      { icon: '🌍', text: '环境保护', category: 'environment' },
      { icon: '💰', text: '经济发展', category: 'economy' },
      { icon: '🏥', text: '医疗健康', category: 'health' },
      { icon: '🎓', text: '教育改革', category: 'education' },
      { icon: '🚀', text: '航天科技', category: 'space' },
      { icon: '🤖', text: '人工智能', category: 'ai' },
      { icon: '🔋', text: '新能源', category: 'energy' },
    ];
    setSmartSuggestions(suggestions);
  }, []);

  // 保存搜索历史
  const saveSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newRecentSearches = [
      searchTerm,
      ...recentSearches.filter(item => item !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('easypeek_recent_searches', JSON.stringify(newRecentSearches));
  };

  // 处理搜索
  const handleSearch = useCallback((searchTerm = query) => {
    if (!searchTerm.trim()) return;
    
    saveSearch(searchTerm);
    setShowSuggestions(false);
    
    // 根据搜索模式执行不同的搜索
    const searchParams = {
      query: searchTerm,
      mode: searchMode,
      type: searchMode === 'semantic' ? 'semantic' : 'normal'
    };
    
    onSearch(searchParams);
  }, [query, searchMode, onSearch]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 1) {
      setShowSuggestions(true);
      // 这里可以添加实时搜索建议的逻辑
      generateSuggestions(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // 生成搜索建议
  const generateSuggestions = (input) => {
    const inputLower = input.toLowerCase();
    
    // 基于智能建议生成匹配项
    const matchedSuggestions = smartSuggestions.filter(item =>
      item.text.toLowerCase().includes(inputLower)
    );

    // 基于最近搜索生成匹配项
    const matchedRecent = recentSearches.filter(item =>
      item.toLowerCase().includes(inputLower)
    );

    // 智能关键词扩展
    const expandedSuggestions = generateExpandedSuggestions(input);
    
    setSuggestions([
      ...matchedSuggestions.map(item => ({ ...item, type: 'smart' })),
      ...matchedRecent.map(item => ({ text: item, icon: '🕒', type: 'recent' })),
      ...expandedSuggestions
    ].slice(0, 8));
  };

  // 生成扩展建议
  const generateExpandedSuggestions = (input) => {
    const expansions = {
      '科技': ['人工智能科技', '5G科技发展', '区块链科技'],
      '经济': ['数字经济', '绿色经济', '共享经济'],
      '环保': ['碳中和环保', '新能源环保', '生态环保'],
      '教育': ['在线教育', '教育改革', '职业教育'],
      '医疗': ['数字医疗', '精准医疗', '医疗改革'],
      'AI': ['AI应用', 'AI伦理', 'AI发展'],
      '新能源': ['太阳能', '风能发电', '电动汽车'],
    };

    const inputLower = input.toLowerCase();
    const results = [];

    Object.entries(expansions).forEach(([key, values]) => {
      if (key.toLowerCase().includes(inputLower) || inputLower.includes(key.toLowerCase())) {
        values.forEach(value => {
          results.push({ text: value, icon: '💡', type: 'expanded' });
        });
      }
    });

    return results.slice(0, 3);
  };

  // 选择建议
  const selectSuggestion = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
  };

  // 键盘事件处理
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // 切换搜索模式
  const toggleSearchMode = () => {
    const modes = ['normal', 'semantic', 'keywords'];
    const currentIndex = modes.indexOf(searchMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setSearchMode(nextMode);
  };

  const getSearchModeInfo = () => {
    switch (searchMode) {
      case 'semantic':
        return { icon: '🧠', text: '语义搜索', desc: '理解语义，找到相关内容' };
      case 'keywords':
        return { icon: '🔍', text: '关键词', desc: '精确匹配关键词' };
      default:
        return { icon: '📝', text: '普通搜索', desc: '标准文本搜索' };
    }
  };

  const modeInfo = getSearchModeInfo();

  return (
    <div className="ai-smart-search">
      <div className="search-container">
        <div className="search-input-wrapper">
          <div className="search-mode-toggle" onClick={toggleSearchMode} title={modeInfo.desc}>
            <span className="mode-icon">{modeInfo.icon}</span>
            <span className="mode-text">{modeInfo.text}</span>
          </div>
          
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="search-input"
          />
          
          <div className="search-actions">
            {query && (
              <button onClick={clearSearch} className="clear-btn" title="清除">
                ✕
              </button>
            )}
            <button 
              onClick={() => handleSearch()} 
              className="search-btn"
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? '🔄' : '🔍'}
            </button>
          </div>
        </div>

        {/* 搜索建议下拉框 */}
        {showSuggestions && (suggestions.length > 0 || smartSuggestions.length > 0) && (
          <div className="suggestions-dropdown">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${suggestion.type}`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <span className="suggestion-text">{suggestion.text}</span>
                  {suggestion.category && (
                    <span className="suggestion-category">{suggestion.category}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="smart-suggestions">
                <div className="suggestions-header">💡 智能推荐</div>
                {smartSuggestions.slice(0, 4).map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item smart"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="suggestion-icon">{suggestion.icon}</span>
                    <span className="suggestion-text">{suggestion.text}</span>
                  </div>
                ))}
              </div>
            )}
            
            {recentSearches.length > 0 && query.length <= 1 && (
              <div className="recent-searches">
                <div className="suggestions-header">🕒 最近搜索</div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <div
                    key={index}
                    className="suggestion-item recent"
                    onClick={() => selectSuggestion({ text: search })}
                  >
                    <span className="suggestion-icon">🕒</span>
                    <span className="suggestion-text">{search}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 搜索模式说明 */}
      <div className="search-mode-info">
        <small>{modeInfo.desc}</small>
      </div>
    </div>
  );
};

export default AISmartSearch; 