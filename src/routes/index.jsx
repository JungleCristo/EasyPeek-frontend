import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../user/Login';
import Register from '../user/Register';

import HomePage from '../pages/HomePage';
import NewsPage from '../pages/newspage';
import StoryPage from '../pages/StoryPage';
import StoryDetailPage from '../pages/StoryDetailPage';
import GlobalPage from '../pages/global';
import ProfilePage from '../user/profile';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // 修复：正确获取登录状态
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};


const router = createBrowserRouter([
  {
    path: '/',

    element: <Navigate to="/HomePage" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/HomePage',
    element: <HomePage />
  },
  {
    path: '/newspage/:id',
    element: <NewsPage />
  },
  {
    path: '/stories',
    element: <StoryPage />
  },
  {
    path: '/story/:id',
    element: <StoryDetailPage />
  },
  {
    path: '/global',
    element: <GlobalPage />
  },
  {
    path: '/profile',
    element:(
      <ProtectedRoute> 
        <ProfilePage /> 
      </ProtectedRoute>
    )
  }
  // {
  //   path: '/HomePage',
  //   element: (
  //     <ProtectedRoute>
  //       <HomePage />
  //     </ProtectedRoute>
  //   )
  // }
]);

export default router;

