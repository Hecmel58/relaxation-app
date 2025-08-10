import { useState } from 'react'
import { apiService } from '../services/api'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [agree, setAgree] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!agree) {
            setError('Kullanıcı sözleşmesini onaylayın')
            return
        }
        if (!phone || !password) {
            setError('Telefon numarası ve şifre gerekli')
            return
        }

        setLoading(true)
        try {
            const response = await apiService.login(phone, password)
            onLogin(response.user)
        } catch (err) {
            setError(err.message || 'Giriş başarısız')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <main className="center">
                {/* Logo ve site adı */}
                <img
                    src="/assets/logo.png"
                    alt="logo"
                    className="logo-large"
                    width="200"
                    height="200"
                />
                <h1 className="site-title">Stres ve Uyku Yönetimi</h1>

                {/* Giriş paneli */}
                <form className="login-box" onSubmit={handleSubmit}>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Telefon Numarası"
                        maxLength={11}
                        disabled={loading}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifre"
                        disabled={loading}
                    />

                    <label className="agree">
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                            disabled={loading}
                        />
                        <span>Kullanıcı sözleşmesini okudum onaylıyorum</span>
                    </label>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>

                    {error && <p className="msg error">{error}</p>}
                </form>
            </main>

            <footer className="footer">© Telif Hakkı 2025, Tüm Hakları Saklıdır</footer>
        </div>
    )
}
