import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();

  // Admin kullanıcılar her zaman beta özelliklerine erişebilir
  const hasExperimentalAccess = user?.isAdmin || user?.abGroup === 'experiment';

  const menuItems = [
    { path: '/dashboard', label: 'Ana Sayfa', icon: '🏠' },
    { path: '/sleep', label: 'Uyku Takibi', icon: '😴' },
    ...(hasExperimentalAccess ? [
      { path: '/relaxation', label: 'Rahatlama', icon: '🧘‍♀️' },
      { path: '/binaural', label: 'Binaural Sesler', icon: '🎵' }
    ] : []),
    { path: '/forms', label: 'Formlar', icon: '📝' },
    { path: '/support', label: 'Uzman Desteği', icon: '💬' },
    { path: '/profile', label: 'Profil', icon: '👤' },
    ...(user?.isAdmin ? [
      { path: '/admin', label: 'Admin Panel', icon: '⚙️' }
    ] : [])
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;