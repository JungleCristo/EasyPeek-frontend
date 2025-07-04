// HTML工具函数

/**
 * 去除HTML标签，保留纯文本内容
 * @param {string} htmlString - 包含HTML标签的字符串
 * @returns {string} 去除HTML标签后的纯文本
 */
export const stripHtmlTags = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }

  // 创建一个临时的div元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  
  // 获取纯文本内容
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // 清理多余的空白字符
  textContent = textContent.replace(/\s+/g, ' ').trim();
  
  return textContent;
};

/**
 * 清理HTML实体编码
 * @param {string} str - 包含HTML实体的字符串
 * @returns {string} 解码后的字符串
 */
export const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = str;
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * 清理新闻标题格式，去除"0x版xx - "这种前缀
 * @param {string} title - 原始标题
 * @returns {string} 清理后的标题
 */
export const cleanNewsTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return '';
  }

  // 去除"0x版xx - "格式的前缀
  // 匹配模式：数字 + 版 + 任意字符 + 空格 + - + 空格
  const titlePrefixPattern = /^\d+版[^-]*-\s*/;
  let cleanTitle = title.replace(titlePrefixPattern, '');
  
  // 去除其他可能的版面格式
  // 匹配模式：任意字符 + 版 + 任意字符 + - + 空格
  const generalPrefixPattern = /^[^-]*版[^-]*-\s*/;
  cleanTitle = cleanTitle.replace(generalPrefixPattern, '');
  
  // 去除开头的"- "
  cleanTitle = cleanTitle.replace(/^-\s*/, '');
  
  // 清理多余的空白字符
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
  
  return cleanTitle || title; // 如果清理后为空，返回原标题
};

/**
 * 综合清理HTML内容：去除标签 + 解码实体 + 清理空白
 * @param {string} htmlContent - 原始HTML内容
 * @param {number} maxLength - 最大长度（可选）
 * @returns {string} 清理后的纯文本
 */
export const cleanHtmlContent = (htmlContent, maxLength = null) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // 先去除HTML标签
  let cleanText = stripHtmlTags(htmlContent);
  
  // 解码HTML实体
  cleanText = decodeHtmlEntities(cleanText);
  
  // 清理多余的空白字符和换行
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  // 如果指定了最大长度，进行截取
  if (maxLength && cleanText.length > maxLength) {
    cleanText = cleanText.substring(0, maxLength);
    
    // 尝试在单词边界截断
    const lastSpace = cleanText.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      cleanText = cleanText.substring(0, lastSpace);
    }
    
    cleanText = cleanText.trim() + '...';
  }
  
  return cleanText;
};

/**
 * 为段落分割文本内容，保持换行结构
 * @param {string} content - 文本内容
 * @returns {string[]} 段落数组
 */
export const splitIntoParagraphs = (content) => {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // 首先清理HTML标签
  const cleanContent = cleanHtmlContent(content);
  
  // 按换行符分割段落
  const paragraphs = cleanContent
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  return paragraphs;
};

/**
 * 安全地显示HTML内容（去除所有HTML标签）
 * @param {string} content - 原始内容
 * @param {number} maxLength - 最大显示长度
 * @returns {string} 安全的纯文本内容
 */
export const safeDisplayText = (content, maxLength = null) => {
  return cleanHtmlContent(content, maxLength);
};

/**
 * 安全地显示新闻标题（去除HTML标签并清理标题格式）
 * @param {string} title - 原始标题
 * @param {number} maxLength - 最大显示长度
 * @returns {string} 清理后的标题
 */
export const safeDisplayTitle = (title, maxLength = null) => {
  if (!title) return '';
  
  // 首先清理HTML标签
  let cleanTitle = cleanHtmlContent(title);
  
  // 然后清理标题格式
  cleanTitle = cleanNewsTitle(cleanTitle);
  
  // 如果指定了最大长度，进行截取
  if (maxLength && cleanTitle.length > maxLength) {
    cleanTitle = cleanTitle.substring(0, maxLength);
    
    // 尝试在单词边界截断
    const lastSpace = cleanTitle.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      cleanTitle = cleanTitle.substring(0, lastSpace);
    }
    
    cleanTitle = cleanTitle.trim() + '...';
  }
  
  return cleanTitle;
}; 