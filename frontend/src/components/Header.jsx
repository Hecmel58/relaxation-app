import { Link } from 'react-router-dom';
import './header.css';

export default function Header({ user, onLogout }) {
    return (
        <div className="site-layout">
            {/* Üst Bar - Logo ve Kullanıcı Bilgisi */}
            <div className="top-bar">
                <div className="logo-section">
                    <Link to="/home" className="logo-link">
                        <img
                            src="/assets/logo.png"
                            alt="Logo"
                            className="site-logo"
                        />
                        <span className="site-name">Stres ve Uyku Yönetimi</span>
                    </Link>
                </div>
                
                <div className="user-section">
                    <div className="user-info">
                        <span className="welcome-text">
                            Hoşgeldiniz, {user?.name || user?.phone || 'Misafir'}
                        </span>
                        <span className="user-role">
                            {user?.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}
                        </span>
                    </div>
                    <button onClick={onLogout} className="logout-btn">
                        Çıkış
                    </button>
                </div>
            </div>

            {/* Ana Menü */}
            <nav className="main-nav">
                <div className="nav-container">
                    <Link to="/home" className="nav-link">
                        🏠 Ana Sayfa
                    </Link>
                    <Link to="/relaxation" className="nav-link">
                        🧘‍♀️ Rahatlama
                    </Link>
                    <Link to="/binaural" className="nav-link">
                        🎵 Binaural
                    </Link>
                    <Link to="/sleep" className="nav-link">
                        😴 Uyku
                    </Link>
                    <Link to="/support" className="nav-link">
                        💬 Destek
                    </Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="nav-link admin-link">
                            ⚙️ Admin Paneli
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
}