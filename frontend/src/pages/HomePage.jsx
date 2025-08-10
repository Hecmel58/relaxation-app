import './HomePage.css';
import { Link } from 'react-router-dom';

export default function HomePage({ user }) {
    return (
        <div className="home-page main-content">
            <h1>Hoş Geldiniz {user?.name || ''}</h1>
            <p>
                Sağlıklı bir yaşam için size özel hazırlanmış meditasyonlar, rahatlama teknikleri,
                uyku takibi ve destek hizmetlerine buradan ulaşabilirsiniz.
            </p>

            <div className="home-links">
                <Link to="/relaxation" className="home-card">
                    <h2>Rahatlama Teknikleri</h2>
                    <p>Stresinizi azaltacak video rehberler</p>
                </Link>

                <Link to="/binaural" className="home-card">
                    <h2>Binaural Vuruşlar</h2>
                    <p>Konsantrasyon ve uyku kalitenizi artırın</p>
                </Link>

                <Link to="/sleep" className="home-card">
                    <h2>Uyku Takibi</h2>
                    <p>Uyku sürenizi ve kalitenizi kaydedin</p>
                </Link>

                <Link to="/support" className="home-card">
                    <h2>Destek</h2>
                    <p>Herhangi bir sorun veya öneri için bize ulaşın</p>
                </Link>

                {user?.role === 'admin' && (
                    <Link to="/admin" className="home-card admin-card">
                        <h2>Admin Paneli</h2>
                        <p>Kullanıcı ve içerik yönetimi</p>
                    </Link>
                )}
            </div>
        </div>
    );
}
