import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Bileşenler
import Header from './components/Header';

// Sayfalar
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import RelaxationPage from './pages/RelaxationPage';
import BinauralPage from './pages/BinauralPage';
import SleepPage from './pages/SleepPage';
import SupportPage from './pages/SupportPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const decoded = jwtDecode(token);
                
                // Token süresi kontrolü
                if (decoded.exp * 1000 > Date.now()) {
                    const parsedUser = JSON.parse(userData);
                    console.log('🔍 App.jsx - Kullanıcı yüklendi:', parsedUser);
                    setUser(parsedUser);
                } else {
                    console.warn('⚠️ Token süresi dolmuş, otomatik çıkış yapılıyor');
                    handleLogout();
                }
            } catch (error) {
                console.error('❌ Token parse hatası:', error);
                handleLogout();
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        console.log('🔐 App.jsx - Giriş yapıldı:', userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        console.log('👋 Çıkış yapılıyor...');
        setUser(null);
        localStorage.clear();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="loading-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div className="spinner"></div>
                Yükleniyor...
            </div>
        );
    }

    return (
        <BrowserRouter>
            {/* Header sadece giriş yapılmışsa gösterilir */}
            {user && <Header user={user} onLogout={handleLogout} />}

            {/* Ana İçerik */}
            <div className={user ? 'app-content' : 'app-login'}>
                <Routes>
                    {/* Login */}
                    <Route
                        path="/"
                        element={user ? <Navigate to="/home" /> : <LoginPage onLogin={handleLogin} />}
                    />

                    {/* Home */}
                    <Route
                        path="/home"
                        element={user ? <HomePage user={user} /> : <Navigate to="/" />}
                    />

                    {/* Admin Panel - sadece admin */}
                    <Route
                        path="/admin"
                        element={
                            user ? (
                                user.role === 'admin' ? (
                                    <AdminPage user={user} />
                                ) : (
                                    <div className="main-content">
                                        <div className="alert error">
                                            <h2>❌ Yetkisiz Erişim</h2>
                                            <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                                            <p><strong>Mevcut Rol:</strong> {user.role}</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* Relaxation */}
                    <Route
                        path="/relaxation"
                        element={user ? <RelaxationPage /> : <Navigate to="/" />}
                    />

                    {/* Binaural */}
                    <Route
                        path="/binaural"
                        element={user ? <BinauralPage /> : <Navigate to="/" />}
                    />

                    {/* Sleep */}
                    <Route
                        path="/sleep"
                        element={user ? <SleepPage user={user} /> : <Navigate to="/" />}
                    />

                    {/* Support */}
                    <Route
                        path="/support"
                        element={user ? <SupportPage user={user} /> : <Navigate to="/" />}
                    />

                    {/* Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}