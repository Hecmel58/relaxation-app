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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

    if (!agreedToTerms) {
      setError('Kullanıcı sözleşmesini onaylamanız gerekmektedir');
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

          <Input
            label="Şifre"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            minLength={8}
            required
          />

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

          <Input
            label="Şifre Tekrar"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            minLength={8}
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
              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">1. Taraflar ve Tanımlar</h4>
                <p className="mb-2">
                  İşbu Kullanıcı Sözleşmesi ("Sözleşme"), FidBal Uyku ve Stres Yönetimi platformu ("Platform") ve Platform'u kullanan gerçek veya tüzel kişiler ("Kullanıcı") arasında elektronik ortamda akdedilmiştir.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mt-3">
                  <p className="font-semibold mb-2">Platform Sahibi Bilgileri:</p>
                  <ul className="text-sm space-y-1">
                    <li><strong>Ad Soyad:</strong> Hasan Balkaya</li>
                    <li><strong>Telefon:</strong> 0539 487 00 58</li>
                    <li><strong>Adres:</strong> Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire: 11, Sivas Merkez</li>
                    <li><strong>E-posta:</strong> ecmelazizoglu@gmail.com</li>
                  </ul>
                </div>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">2. Sözleşmenin Konusu</h4>
                <p>
                  İşbu Sözleşme, Platform'un sunduğu hizmetlerin Kullanıcı tarafından kullanımına ilişkin tarafların hak ve yükümlülüklerini düzenlemektedir. Platform, akademik bir tez çalışması kapsamında ücretsiz olarak sunulmakta olup, uyku takibi, stres yönetimi, rahatlama teknikleri ve ilgili sağlık hizmetlerini içermektedir.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">3. Hizmetin Kapsamı</h4>
                <p className="mb-2">Platform aşağıdaki hizmetleri sunmaktadır:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Uyku kalitesi takibi ve analizi</li>
                  <li>Kalp atım hızı izleme</li>
                  <li>Stres seviyesi değerlendirmesi</li>
                  <li>Rahatlama sesleri ve meditasyon teknikleri</li>
                  <li>Binaural sesler ile zihinsel rahatlama</li>
                  <li>Kişiselleştirilmiş raporlama ve öneriler</li>
                  <li>Uzman desteği ve danışmanlık</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">4. Kullanıcı Yükümlülükleri</h4>
                <p className="mb-2">Kullanıcı, Platform'u kullanırken:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Doğru, güncel ve eksiksiz bilgi sağlamakla yükümlüdür</li>
                  <li>Hesap güvenliğini sağlamak ve şifresini gizli tutmakla sorumludur</li>
                  <li>Platform'u yasalara uygun ve etik kurallara uygun şekilde kullanacağını kabul eder</li>
                  <li>Platform'un teknik altyapısına zarar verecek davranışlardan kaçınacağını taahhüt eder</li>
                  <li>Diğer kullanıcıların haklarına saygı gösterecektir</li>
                  <li>Ticari amaçla kullanmayacağını kabul eder</li>
                  <li>Platform içeriğini izinsiz kopyalamayacak, çoğaltmayacak veya dağıtmayacaktır</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">5. Fikri Mülkiyet Hakları</h4>
                <p>
                  Platform'daki tüm içerik, tasarım, yazılım, kod, logo, metin, görsel, ses dosyaları ve diğer tüm materyaller Hasan Balkaya'ya aittir ve telif hakkı, ticari marka, patent ve diğer fikri mülkiyet hakları ile korunmaktadır. Kullanıcı, Platform'daki hiçbir içeriği ticari amaçla kullanamaz, kopyalayamaz, değiştiremez veya dağıtamaz.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg mt-3">
                  <p className="font-semibold text-amber-900">⚠️ Önemli Uyarı:</p>
                  <p className="text-sm text-amber-800">
                    Bu platform, akademik bir tez çalışması kapsamında geliştirilmiştir. Tüm hakları saklıdır. İzinsiz kullanım, kopyalama veya dağıtım yasal işlem gerektirir.
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">6. Hizmetin Ücretsiz Olması</h4>
                <p>
                  Platform, akademik bir tez çalışması kapsamında geliştirilmiş olup, şu anda tamamen ücretsiz olarak sunulmaktadır. Ancak, gelecekte belirli hizmetler için ücretlendirme yapılması durumunda, kullanıcılar önceden bilgilendirilecek ve onayları alınacaktır.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">7. Sorumluluk Reddi ve Garanti</h4>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2">🚨 ÖNEMLİ SAĞLIK UYARISI:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-red-800">
                    <li>Platform, tıbbi teşhis veya tedavi amacı taşımamaktadır</li>
                    <li>Platform'da sunulan bilgiler, profesyonel tıbbi tavsiye yerine geçmez</li>
                    <li>Sağlık sorunları için mutlaka bir sağlık uzmanına başvurulmalıdır</li>
                    <li>Platform'un kullanımından kaynaklanan herhangi bir sağlık sorunundan Platform sahibi sorumlu tutulamaz</li>
                    <li>Acil durumlarda 112'yi arayın</li>
                  </ul>
                </div>
                <p className="mt-3">
                  Platform "olduğu gibi" sunulmaktadır. Platform sahibi, hizmetin kesintisiz, hatasız veya güvenli olacağına dair hiçbir garanti vermemektedir.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">8. Gizlilik ve Veri Koruma</h4>
                <p>
                  Kullanıcı verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat kapsamında işlenmekte ve korunmaktadır. Kullanıcılar, kişisel verilerinin toplanması, işlenmesi ve saklanmasına açıkça rıza göstermiş sayılır.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">9. Hesap İptali ve Askıya Alma</h4>
                <p className="mb-2">Platform sahibi, aşağıdaki durumlarda Kullanıcı hesabını askıya alabilir veya silebilir:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Sözleşme hükümlerinin ihlali</li>
                  <li>Yanlış veya yanıltıcı bilgi sağlanması</li>
                  <li>Platform'a zarar verecek faaliyetler</li>
                  <li>Diğer kullanıcıların haklarının ihlali</li>
                  <li>Yasadışı faaliyetler</li>
                </ul>
                <p className="mt-2">
                  Kullanıcı, KVKK kapsamındaki haklarını kullanarak hesabını istediği zaman silebilir.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">10. Hizmet Değişiklikleri ve Sonlandırma</h4>
                <p>
                  Platform sahibi, önceden bildirimde bulunarak veya bulunmaksızın, Platform'un tamamını veya bir kısmını geçici veya kalıcı olarak değiştirme, askıya alma veya sonlandırma hakkını saklı tutar.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">11. Sözleşme Değişiklikleri</h4>
                <p>
                  Platform sahibi, işbu Sözleşme'yi dilediği zaman değiştirme hakkını saklı tutar. Değişiklikler Platform üzerinden duyurulacak ve yürürlük tarihinden itibaren geçerli olacaktır.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">12. Uyuşmazlık Çözümü</h4>
                <p>
                  İşbu Sözleşme'nin uygulanmasından veya yorumlanmasından doğabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti yasaları uygulanır. Uyuşmazlıkların çözümünde <strong>Sivas Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">13. İletişim</h4>
                <p className="mb-2">
                  Sözleşme ile ilgili sorularınız veya talepleriniz için:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-1 text-sm">
                    <li><strong>E-posta:</strong> ecmelazizoglu@gmail.com</li>
                    <li><strong>Telefon:</strong> 0539 487 00 58</li>
                    <li><strong>Adres:</strong> Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire: 11, Sivas Merkez</li>
                  </ul>
                </div>
              </section>

              <section className="border-t pt-4 mt-6">
                <p className="text-xs text-gray-600">
                  <strong>Son Güncelleme:</strong> 8 Ekim 2025<br/>
                  <strong>Versiyon:</strong> 1.0
                </p>
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

export default RegisterPage;