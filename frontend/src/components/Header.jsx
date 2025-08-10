import { Link } from 'react-router-dom';
import './header.css';

export default function Header({ user, onLogout }) {
    return (
        <header className="site-header">
            <div className="header-left">
                {/* Logo */}
                <Link to="/home" className="logo-link">
                    <img
                        src="/assets/logo.png" // Senin public/assets klasöründeki logo dosyan
                        alt="Logo"
                        className="site-logo"
                    />
                </Link>
            </div>

            <nav className="header-nav">
                <Link to="/home">Ana Sayfa</Link>
                <Link to="/relaxation">Rahatlama</Link>
                <Link to="/binaural">Binaural</Link>
                <Link to="/sleep">Uyku</Link>
                <Link to="/support">Destek</Link>
                {user?.role === 'admin' && <Link to="/admin">Admin Paneli</Link>}
            </nav>

            <div className="header-right">
        <span className="welcome-msg">
          Hoşgeldiniz, {user?.name || 'Misafir'}
        </span>
                <button onClick={onLogout} className="logout-btn">
                    Çıkış
                </button>
            </div>
        </header>
    );
}
