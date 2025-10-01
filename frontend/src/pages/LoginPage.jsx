import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import logoImage from '../assets/logo.png';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Kullanıcı sözleşmesini onaylamanız gerekmektedir');
      return;
    }

    if (!phone || !password) {
      setError('Telefon numarası ve şifre gereklidir');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { phone, password });
      
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Giriş başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');

    if (!forgotPhone) {
      setForgotMessage('Telefon numarası gereklidir');
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', { phone: forgotPhone });
      
      if (response.data.success) {
        setForgotMessage('Şifreniz telefon numaranıza gönderildi');
      } else {
        setForgotMessage(response.data.message || 'Telefon numarası sistemde kayıtlı değil');
      }
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'Bir hata oluştu');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-32 h-32 mb-4 flex items-center justify-center bg-white rounded-2xl shadow-lg p-4">
              <img 
                src={logoImage}
                alt="FidBal Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              FidBal
            </h1>
            <p className="text-xl font-semibold text-slate-800">Uyku ve Stres Yönetimi</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">Şifremi Unuttum</h2>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                forgotMessage.includes('gönderildi') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {forgotMessage}
              </div>
            )}

            <Input
              label="Telefon Numarası"
              type="tel"
              value={forgotPhone}
              onChange={(e) => setForgotPhone(e.target.value)}
              placeholder="5XX XXX XX XX"
              required
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Şifremi Gönder
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
              >
                Geri Dön
              </Button>
            </div>
          </form>
        </Card>

        <footer className="absolute bottom-4 text-center text-sm text-slate-600">
          © Telif Hakkı 2025, Tüm Hakları Saklıdır
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-32 h-32 mb-4 flex items-center justify-center bg-white rounded-2xl shadow-lg p-4">
            <img 
              src={logoImage}
              alt="FidBal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            FidBal
          </h1>
          <p className="text-xl font-semibold text-slate-800">Uyku ve Stres Yönetimi</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Giriş Yap</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Telefon Numarası"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5XX XXX XX XX"
            required
          />

          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 mr-2 h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="terms" className="text-sm text-slate-700">
              <Link to="/terms" className="text-primary-600 hover:underline">
                Kullanıcı sözleşmesini
              </Link> okudum ve onaylıyorum
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !agreedToTerms}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="w-full text-center text-sm text-primary-600 hover:underline mt-4"
          >
            Şifremi Unuttum
          </button>
        </form>
      </Card>

      <footer className="absolute bottom-4 text-center text-sm text-slate-600">
        © Telif Hakkı 2025, Tüm Hakları Saklıdır
      </footer>
    </div>
  );
}

export default LoginPage;