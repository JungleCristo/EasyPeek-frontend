// 事件状态配置
export const eventStatusConfig = {
  ongoing: { 
    label: "进行中", 
    color: "#10b981", 
    bgColor: "rgba(16, 185, 129, 0.1)" 
  },
  ended: { 
    label: "已结束", 
    color: "#6b7280", 
    bgColor: "rgba(107, 114, 128, 0.1)" 
  },
  breaking: { 
    label: "突发", 
    color: "#ef4444", 
    bgColor: "rgba(239, 68, 68, 0.1)" 
  }
};

// 事件配置
export const eventConfig = {
  "AI技术发展": { 
    label: "AI技术发展", 
    bgColor: "rgba(59, 130, 246, 0.9)" 
  },
  "气候变会议": { 
    label: "气候变会议", 
    bgColor: "rgba(16, 185, 129, 0.9)" 
  },
  "新能源汽车发展": { 
    label: "新能源汽车发展", 
    bgColor: "rgba(245, 158, 11, 0.9)" 
  },
  "太空探索计划": { 
    label: "太空探索计划", 
    bgColor: "rgba(139, 92, 246, 0.9)" 
  },
  "全球经济复苏": { 
    label: "全球经济复苏", 
    bgColor: "rgba(34, 197, 94, 0.9)" 
  },
  "奥运会筹备": { 
    label: "奥运会筹备", 
    bgColor: "rgba(251, 146, 60, 0.9)" 
  }
};

// 重要性配置
export const importanceConfig = {
  high: { 
    label: "高", 
    color: "#ef4444", 
    bgColor: "rgba(239, 68, 68, 0.1)" 
  },
  medium: { 
    label: "中", 
    color: "#f59e0b", 
    bgColor: "rgba(245, 158, 11, 0.1)" 
  },
  low: { 
    label: "低", 
    color: "#10b981", 
    bgColor: "rgba(16, 185, 129, 0.1)" 
  }
};

// 新闻分类配置
export const newsCategoryConfig = {
  // 原有分类
  '科技': { 
    id: 'tech', 
    name: '科技', 
    icon: '🤖', 
    color: '#3b82f6',
    bgColor: 'bg-blue-100'
  },
  '政治': { 
    id: 'politics', 
    name: '政治', 
    icon: '🏛️', 
    color: '#ef4444',
    bgColor: 'bg-red-100'
  },
  '经济': { 
    id: 'economy', 
    name: '经济', 
    icon: '📈', 
    color: '#10b981',
    bgColor: 'bg-green-100'
  },
  '环境': { 
    id: 'environment', 
    name: '环境', 
    icon: '🌍', 
    color: '#059669',
    bgColor: 'bg-emerald-100'
  },
  '医疗': { 
    id: 'health', 
    name: '医疗', 
    icon: '⚕️', 
    color: '#dc2626',
    bgColor: 'bg-red-100'
  },
  '教育': { 
    id: 'education', 
    name: '教育', 
    icon: '📚', 
    color: '#f59e0b',
    bgColor: 'bg-yellow-100'
  },
  '体育': { 
    id: 'sports', 
    name: '体育', 
    icon: '⚽', 
    color: '#8b5cf6',
    bgColor: 'bg-purple-100'
  },
  '娱乐': { 
    id: 'entertainment', 
    name: '娱乐', 
    icon: '🎭', 
    color: '#ec4899',
    bgColor: 'bg-pink-100'
  },
  '军事': { 
    id: 'military', 
    name: '军事', 
    icon: '🛡️', 
    color: '#374151',
    bgColor: 'bg-gray-100'
  },
  '国际': { 
    id: 'international', 
    name: '国际', 
    icon: '🌐', 
    color: '#0ea5e9',
    bgColor: 'bg-sky-100'
  },
  '社会': { 
    id: 'social', 
    name: '社会', 
    icon: '👥', 
    color: '#7c3aed',
    bgColor: 'bg-violet-100'
  },
  '健康': { 
    id: 'wellness', 
    name: '健康', 
    icon: '💊', 
    color: '#16a34a',
    bgColor: 'bg-green-100'
  },
  '文化': { 
    id: 'culture', 
    name: '文化', 
    icon: '🎨', 
    color: '#c2410c',
    bgColor: 'bg-orange-100'
  },
  
  // 新增分类（根据RSS源）
  '国内新闻': { 
    id: 'domestic', 
    name: '国内新闻', 
    icon: '🇨🇳', 
    color: '#dc2626',
    bgColor: 'bg-red-100'
  },
  '综合新闻': { 
    id: 'general', 
    name: '综合新闻', 
    icon: '📰', 
    color: '#374151',
    bgColor: 'bg-gray-100'
  },
  '时政新闻': { 
    id: 'current_affairs', 
    name: '时政新闻', 
    icon: '⚖️', 
    color: '#991b1b',
    bgColor: 'bg-red-100'
  },
  '财经新闻': { 
    id: 'finance', 
    name: '财经新闻', 
    icon: '💰', 
    color: '#059669',
    bgColor: 'bg-emerald-100'
  }
};

// 获取所有分类列表
export const getAllCategories = () => {
  return Object.values(newsCategoryConfig);
};

// 获取分类名称列表
export const getCategoryNames = () => {
  return Object.keys(newsCategoryConfig);
};

// 根据分类名称获取配置
export const getCategoryConfig = (categoryName) => {
  return newsCategoryConfig[categoryName] || {
    id: 'other',
    name: categoryName,
    icon: '📄',
    color: '#6b7280',
    bgColor: 'bg-gray-100'
  };
};

// 根据ID获取分类名称
export const getCategoryNameById = (id) => {
  const category = Object.values(newsCategoryConfig).find(cat => cat.id === id);
  return category ? category.name : id;
};

// 根据名称获取分类ID
export const getCategoryIdByName = (name) => {
  const category = newsCategoryConfig[name];
  return category ? category.id : 'other';
};

// 获取状态颜色的工具函数
export const getStatusColor = (status) => {
  return eventStatusConfig[status]?.color || '#6b7280';
};

// 获取状态文本的工具函数
export const getStatusText = (status) => {
  return eventStatusConfig[status]?.label || '未知';
};

// 获取重要性颜色的工具函数
export const getImportanceColor = (importance) => {
  return importanceConfig[importance]?.color || '#6b7280';
};

// 获取重要性文本的工具函数
export const getImportanceText = (importance) => {
  return importanceConfig[importance]?.label || '未知';
};