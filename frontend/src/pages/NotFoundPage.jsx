import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
    return (
        <div className="not-found-page main-content">
            <h1>404 - Sayfa Bulunamadı</h1>
            <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            <Link to="/" className="back-home-btn">
                Ana Sayfaya Dön
            </Link>
        </div>
    );
}
