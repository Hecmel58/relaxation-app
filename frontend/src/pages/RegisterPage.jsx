import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function RegisterPage() {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        phone: formData.phone,
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token) {
        localStorage.setItem('fidbal_token', response.data.token);
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <span className="text-white text-2xl">🌙</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Fidbal</h1>
          <p className="text-slate-600 mt-2">Uyku ve Stres Yönetimi</p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Kayıt Ol</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
              <input
                type="text"
                className="input"
                placeholder="Adınız Soyadınız"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefon Numarası</label>
              <input
                type="tel"
                className="input"
                placeholder="5XX XXX XX XX"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-posta (Opsiyonel)</label>
              <input
                type="email"
                className="input"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
              <input
                type="password"
                className="input"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Şifre Tekrar</label>
              <input
                type="password"
                className="input"
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Giriş Yap
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;