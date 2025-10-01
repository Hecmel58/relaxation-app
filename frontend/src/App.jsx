import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './api/axios';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SleepPage from './pages/SleepPage';
import RelaxationPage from './components/features/RelaxationPage';
import BinauralPage from './components/features/BinauralPage';
import FormsPage from './components/features/FormsPage';
import SupportPage from './components/features/SupportPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function App() {
  const { isAuthenticated, login, logout, restoreUser } = useAuthStore();

  useEffect(() => {
    // Önce localStorage'dan kullanıcı bilgilerini geri yükle
    restoreUser();
    
    // Sonra token varsa doğrula
    const token = localStorage.getItem('fidbal_token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        // API'den gelen user data ile login'i güncelle
        // Ama mevcut localStorage'daki ismi koru
        const savedName = localStorage.getItem('fidbal_user_name');
        const userData = {
          ...response.data.user,
          name: savedName || response.data.user.name
        };
        login(userData, token);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token geçersiz ama localStorage'da bilgi varsa logout yapma
      // Sadece yeni login gerektiğinde temizle
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sleep" element={<SleepPage />} />
          <Route path="/relaxation" element={<RelaxationPage />} />
          <Route path="/binaural" element={<BinauralPage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;