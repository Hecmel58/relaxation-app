import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import {
  FiHome,
  FiMoon,
  FiActivity,
  FiCalendar,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiBarChart2,
  FiHeart,
  FiHeadphones,
  FiSmile,
  FiMessageCircle
} from 'react-icons/fi';

function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      // setInterval KALDIRILDI - Navbar zaten polling yapıyor
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/chat/unread-count');
      if (response.data) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Unread messages fetch error:', error);
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', name: 'Ana Sayfa', icon: FiHome },
    { path: '/sleep-tracking', name: 'Uyku Takibi', icon: FiMoon },
    { path: '/sleep-analysis', name: 'Uyku Analizi', icon: FiBarChart2 },
    { path: '/calendar', name: 'Takvim', icon: FiCalendar },
    { path: '/meditation', name: 'Meditasyon', icon: FiActivity },
    { path: '/relaxation', name: 'Rahatlama', icon: FiHeart },
    { path: '/binaural', name: 'Binaural Beats', icon: FiHeadphones },
    { path: '/mood', name: 'Ruh Hali', icon: FiSmile },
    { path: '/support', name: 'Destek', icon: FiMessageCircle, badge: true },
    { path: '/profile', name: 'Profil', icon: FiUser }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-wellness-50 to-info-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-wellness-600 rounded-lg flex items-center justify-center">
              <FiMoon className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-wellness-600 bg-clip-text text-transparent">
              FidBal
            </span>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600">
          Merhaba, {user?.name || 'Kullanıcı'}
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out z-40`}>
          
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-wellness-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiMoon className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-2xl bg-gradient-to-r from-primary-600 to-wellness-600 bg-clip-text text-transparent">
                  FidBal
                </h1>
                <p className="text-xs text-gray-500">Uyku Takip Sistemi</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-wellness-50 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-wellness-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.name || 'Kullanıcı'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        setIsSidebarOpen(false);
                        if (item.badge) {
                          setUnreadCount(0);
                        }
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-primary-600 to-wellness-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`${
                          isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                        } transition-colors`} size={20} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.badge && unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <FiLogOut className="group-hover:translate-x-1 transition-transform" size={20} />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;