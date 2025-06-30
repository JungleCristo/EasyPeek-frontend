import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '', style = {} }) => {
  const { theme, toggleTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // 自动隐藏逻辑
  useEffect(() => {
    let timer;
    if (isExpanded) {
      timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000); // 3秒后自动隐藏
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isExpanded]);

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      toggleTheme();
      // 切换主题后立即隐藏
      setIsExpanded(false);
    }
  };

  const handleMouseEnter = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <Button
      type="text"
      icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`theme-toggle ${theme} ${className} ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={style}
      title={theme === 'light' ? '切换到黑夜模式' : '切换到白天模式'}
    />
  );
};

export default ThemeToggle;