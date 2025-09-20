import './HomePage.css';
import { Link } from 'react-router-dom';

export default function HomePage({ user }) {
    return (
        <div className="home-page main-content">
            <h1>Hoş Geldiniz {user?.name || user?.phone || ''}</h1>
            <p>
                Sağlıklı bir yaşam için size özel hazırlanmış meditasyonlar, rahatlama teknikleri,
                uyku takibi ve destek hizmetlerine buradan ulaşabilirsiniz.
            </p>

            <div className="home-links">
                <Link to="/relaxation" className="home-card">
                    <div className="card-content">
                        <h2>🧘‍♀️ Rahatlama Teknikleri</h2>
                        <p>Stresinizi azaltacak video rehberler</p>
                    </div>
                </Link>

                <Link to="/binaural" className="home-card">
                    <div className="card-content">
                        <h2>🎵 Binaural Vuruşlar</h2>
                        <p>Konsantrasyon ve uyku kalitenizi artırın</p>
                    </div>
                </Link>

                <Link to="/sleep" className="home-card">
                    <div className="card-content">
                        <h2>😴 Uyku Takibi</h2>
                        <p>Uyku sürenizi ve kalitenizi kaydedin</p>
                    </div>
                </Link>

                <Link to="/support" className="home-card">
                    <div className="card-content">
                        <h2>💬 Destek</h2>
                        <p>Herhangi bir sorun veya öneri için bize ulaşın</p>
                    </div>
                </Link>

                {user?.role === 'admin' && (
                    <Link to="/admin" className="home-card admin-card">
                        <div className="card-content">
                            <h2>⚙️ Admin Paneli</h2>
                            <p>Kullanıcı ve içerik yönetimi</p>
                        </div>
                    </Link>
                )}
            </div>

            <div className="user-stats">
                <h3>Hızlı İstatistikler</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Üyelik</span>
                        <span className="stat-value">{user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Telefon</span>
                        <span className="stat-value">{user?.phone || '-'}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Kayıt Tarihi</span>
                        <span className="stat-value">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}