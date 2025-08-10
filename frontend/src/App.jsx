import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

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
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(JSON.parse(userData));
                } else {
                    console.warn('Token süresi dolmuş, otomatik çıkış yapılıyor');
                    handleLogout();
                }
            } catch (error) {
                console.error('Token parse hatası:', error);
                handleLogout();
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.clear();
        window.location.href = '/';
    };

    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }

    return (
        <BrowserRouter>
            {user && <Header user={user} onLogout={handleLogout} />}

            <div className={user ? 'main-content' : ''}>
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
                    {user && user.role === 'admin' && (
                        <Route path="/admin" element={<AdminPage user={user} />} />
                    )}

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
                        element={user ? <SupportPage /> : <Navigate to="/" />}
                    />

                    {/* Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
