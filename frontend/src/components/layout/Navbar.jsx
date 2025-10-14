import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      // Her 2 dakikada bir güncelle
      const interval = setInterval(fetchUnreadMessages, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/chat/unread-count');
      console.log('📬 Unread count response:', response.data); // ✅ Debug log
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Unread messages fetch error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fidbal_token');
    logout();
    navigate('/login');
  };

  // ✅ YENİ: Mesaj ikonuna tıklandığında unread count'u sıfırla
  const handleMessageClick = () => {
    setUnreadCount(0);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="FidBal Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-lg font-bold text-slate-900">
                FidBal Uyku ve Stres Yönetimi
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mesaj Bildirimi */}
            <Link 
              to="/support" 
              className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={handleMessageClick} // ✅ DÜZELT: Fonksiyon çağrısı
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profil */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-2"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">{user?.name || 'Kullanıcı'}</p>
                  <p className="text-xs text-slate-500">{user?.phone}</p>
                </div>
                {user?.abGroup === 'experiment' && (
                  <span className="px-2 py-1 bg-warning-100 text-warning-800 rounded text-xs font-medium">BETA</span>
                )}
                {user?.isAdmin && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">ADMIN</span>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.phone}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;