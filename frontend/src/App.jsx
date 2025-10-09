import React, { useEffect, useRef } from 'react';
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
import AdminFormResponses from './pages/admin/AdminFormResponses';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  const { isAuthenticated, token, user, setUser, logout } = useAuthStore();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (token && !user && !hasVerified.current) {
      hasVerified.current = true;
      verifyToken(token);
    }
  }, [token, user]);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success && response.data.user) {
        const userData = {
          userId: response.data.user.id,
          phone: response.data.user.phone,
          name: response.data.user.name,
          email: response.data.user.email || null,
          isAdmin: Boolean(response.data.user.is_admin),
          abGroup: response.data.user.ab_group || 'control'
        };
        
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
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
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

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
          <Route path="/admin/forms" element={<AdminFormResponses />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;