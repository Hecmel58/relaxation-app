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
  const [showTermsModal, setShowTermsModal] = useState(false);

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
      const response = await api.post('/auth/request-password-reset', { phone: forgotPhone });
      
      if (response.data.success) {
        setForgotMessage('✅ Talebiniz alındı! Admin onayından sonra yeni şifreniz SMS ile gönderilecektir.');
      } else {
        setForgotMessage('❌ ' + (response.data.message || 'Telefon numarası sistemde kayıtlı değil'));
      }
    } catch (err) {
      setForgotMessage('❌ ' + (err.response?.data?.message || 'Bir hata oluştu'));
    }
  };

  if (showForgotPassword) {
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

          <h2 className="text-2xl font-bold text-slate-900 mb-4">Şifremi Unuttum</h2>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                forgotMessage.includes('✅') 
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
                Talep Gönder
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

        <h2 className="text-2xl font-bold text-slate-900 mb-4">Giriş Yap</h2>

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
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-primary-600 hover:underline font-medium"
              >
                Kullanıcı sözleşmesini
              </button> okudum ve onaylıyorum
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !agreedToTerms}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-primary-600 hover:underline"
            >
              Şifremi Unuttum
            </button>
            
            <Link
              to="/register"
              className="text-primary-600 hover:underline font-medium"
            >
              Kayıt Ol
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Kullanıcı Sözleşmesi</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700">
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">1. Hizmet Kapsamı</h4>
                <p>FidBal, kullanıcılarına uyku takibi, stres yönetimi ve rahatlama teknikleri sunan bir platformdur.</p>
              </section>
              
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">2. Kullanıcı Sorumlulukları</h4>
                <p>Kullanıcılar, hesap bilgilerini gizli tutmakla yükümlüdür. Platformun kötüye kullanımından kullanıcı sorumludur.</p>
              </section>
              
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">3. Gizlilik ve Veri Koruma</h4>
                <p>Kişisel verileriniz 6698 sayılı KVKK kapsamında korunmaktadır. Detaylı bilgi için Gizlilik Politikamızı inceleyebilirsiniz.</p>
              </section>
              
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">4. Hizmet Değişiklikleri</h4>
                <p>FidBal, hizmetlerinde değişiklik yapma hakkını saklı tutar. Önemli değişiklikler kullanıcılara bildirilir.</p>
              </section>
              
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">5. Sorumluluk Reddi</h4>
                <p>FidBal tıbbi tavsiye vermez. Sağlık sorunları için mutlaka bir sağlık uzmanına danışınız.</p>
              </section>
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

export default LoginPage;