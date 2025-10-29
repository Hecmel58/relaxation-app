import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import logoImage from '../assets/logo.png';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    abGroup: 'control'
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToKVKK, setAgreedToKVKK] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setFormData({ ...formData, phone: value });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Şifre en az 8 karakter olmalıdır';
    }
    if (!/[a-z]/.test(password)) {
      return 'Şifre en az bir küçük harf içermelidir';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Şifre en az bir büyük harf içermelidir';
    }
    if (!/\d/.test(password)) {
      return 'Şifre en az bir rakam içermelidir';
    }
    if (!/[@$!%*?&]/.test(password)) {
      return 'Şifre en az bir özel karakter (@$!%*?&) içermelidir';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms || !agreedToKVKK) {
      setError('Kullanıcı sözleşmesi ve KVKK aydınlatma metnini onaylamanız gerekmektedir');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        abGroup: formData.abGroup
      });

      if (response.data.success) {
        setRegistrationSuccess(true);
      } else {
        setError(response.data.message || 'Kayıt başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center bg-green-100 rounded-full">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Kayıt Başarılı!</h2>
            <p className="text-slate-600 mb-6">
              Kaydınız alındı. Admin onayından sonra uygulamaya erişebileceksiniz. Onay sonrası giriş yapabilirsiniz.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Giriş Sayfasına Dön
            </Button>
          </div>
        </Card>
        
        <footer className="mt-8 text-center">
          <p className="text-sm text-slate-600">© Telif Hakkı 2025, Tüm Hakları Saklıdır</p>
          <p className="text-sm text-blue-600 font-medium mt-1">Hecmel Tarafından Hazırlanmıştır</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 mb-3 flex items-center justify-center bg-white rounded-2xl shadow-lg p-3">
            <img 
              src={logoImage}
              alt="FidBal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            FidBal
          </h1>
          <p className="text-lg font-semibold text-slate-800">Uyku ve Stres Yönetimi</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">Kayıt Ol</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Ad Soyad"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ad Soyad"
            required
          />

          <Input
            label="Telefon Numarası"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="5XX XXX XX XX"
            maxLength={11}
            required
          />

          <Input
            label="E-posta (Opsiyonel)"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ornek@email.com"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Grup Seçimi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, abGroup: 'control' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.abGroup === 'control'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">Kontrol Grubu</div>
                <div className="text-xs mt-1">Standart deneyim</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, abGroup: 'experiment' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.abGroup === 'experiment'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">Deney Grubu</div>
                <div className="text-xs mt-1">Gelişmiş özellikler</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={8}
                required
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">Şifre Gereksinimleri:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li className={formData.password.length >= 8 ? 'text-green-700 font-semibold' : ''}>
                {formData.password.length >= 8 ? '✓' : '○'} En az 8 karakter
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/[a-z]/.test(formData.password) ? '✓' : '○'} En az 1 küçük harf (a-z)
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/[A-Z]/.test(formData.password) ? '✓' : '○'} En az 1 büyük harf (A-Z)
              </li>
              <li className={/\d/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/\d/.test(formData.password) ? '✓' : '○'} En az 1 rakam (0-9)
              </li>
              <li className={/[@$!%*?&]/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/[@$!%*?&]/.test(formData.password) ? '✓' : '○'} En az 1 özel karakter (@$!%*?&)
              </li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Şifre Tekrar
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={8}
                required
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 mr-2 h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-700">
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-primary-600 hover:underline font-medium"
                >
                  Kullanıcı sözleşmesini
                </Link> okudum ve onaylıyorum
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="kvkk"
                checked={agreedToKVKK}
                onChange={(e) => setAgreedToKVKK(e.target.checked)}
                className="mt-1 mr-2 h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="kvkk" className="text-sm text-slate-700">
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  className="text-primary-600 hover:underline font-medium"
                >
                  KVKK aydınlatma metnini
                </Link> okudum ve onaylıyorum
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !agreedToTerms || !agreedToKVKK}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-slate-600">Zaten hesabınız var mı? </span>
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              Giriş Yap
            </Link>
          </div>
        </form>
      </Card>

      <footer className="mt-8 text-center">
        <p className="text-sm text-slate-600">© Telif Hakkı 2025, Tüm Hakları Saklıdır</p>
        <p className="text-sm text-blue-600 font-medium mt-1">Hecmel Tarafından Hazırlanmıştır</p>
      </footer>

      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowTermsModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-slate-900">Kullanıcı Sözleşmesi ve Kullanım Koşulları</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6 text-sm text-slate-700">
              {/* Modal içeriği aynı kalacak */}
              {/* ... mevcut modal içeriği ... */}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <Button
                onClick={() => {
                  setShowTermsModal(false);
                  setAgreedToTerms(true);
                }}
                className="w-full"
              >
                Anladım ve Kabul Ediyorum
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
