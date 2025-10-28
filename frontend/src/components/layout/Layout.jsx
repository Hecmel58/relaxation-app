import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      // Her 10 saniyede bir güncelle
      const interval = setInterval(fetchUnreadMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/chat/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Unread messages fetch error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMessageClick = async () => {
    // Mesajları okundu olarak işaretle
    try {
      await api.post('/chat/mark-all-read');
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark read error:', error);
    }
    
    // Admin ise admin panelindeki mesajlar sekmesine, değilse support sayfasına git
    if (user?.isAdmin) {
      navigate('/admin');
      // Admin panelinde Mesajlar tab'ına geçmek için state gönder
      setTimeout(() => {
        const messagesTab = document.querySelector('[data-tab="messages"]');
        if (messagesTab) messagesTab.click();
      }, 100);
    } else {
      navigate('/support');
    }
  };

  // Tüm kullanıcılar için temel menü
  const baseMenuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Ana Sayfa' },
    { path: '/sleep', icon: '😴', label: 'Uyku Takibi' },
    { path: '/forms', icon: '📋', label: 'Formlar' },
    { path: '/support', icon: '💬', label: 'Uzman Desteği' },
    { path: '/profile', icon: '👤', label: 'Profil' }
  ];

  // Deney grubu için ek sayfalar
  const experimentalItems = [
    { path: '/relaxation', icon: '🧘‍♀️', label: 'Rahatlama' },
    { path: '/binaural', icon: '🎵', label: 'Binaural Sesler' }
  ];

  // Menü öğelerini oluştur
  let menuItems = [...baseMenuItems];

  // Admin veya deney grubundaysa ek sayfaları ekle (Uyku Takibi'nden sonra)
  if (user?.isAdmin || user?.abGroup === 'experiment') {
    menuItems.splice(2, 0, ...experimentalItems);
  }

  // Admin ise admin paneli ekle
  if (user?.isAdmin) {
    menuItems.push({ path: '/admin', icon: '⚙️', label: 'Admin Panel' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

            <div className="flex items-center space-x-4">
              {/* Mesaj Bildirimi */}
              <button
                onClick={handleMessageClick}
                className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-colors"
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
              </button>

              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">
                  {user?.name || 'Kullanıcı'}
                  {user?.isAdmin && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                      ADMIN
                    </span>
                  )}
                  {user?.abGroup === 'experiment' && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                      BETA
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{user?.phone}</div>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
            >
              <span className="text-xl">🚪</span>
              <span>Çıkış Yap</span>
            </button>
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;