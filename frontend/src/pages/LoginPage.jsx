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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  const handleForgotPhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setForgotPhone(value);
    }
  };

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

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
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
              onChange={handleForgotPhoneChange}
              placeholder="5XX XXX XX XX"
              maxLength={11}
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
            onChange={handlePhoneChange}
            placeholder="5XX XXX XX XX"
            maxLength={11}
            required
          />

          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
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
                  Platform sahibi, önceden bildirimde bulunarak veya bulunmaksızın, Platform'un tamamını veya bir kısmını geçici veya kalıcı olarak değiştirme, askıya alma veya sonlandırma hakkını saklı tutar. Bu durumlardan dolayı Platform sahibinin herhangi bir sorumluluğu bulunmamaktadır.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">11. Sözleşme Değişiklikleri</h4>
                <p>
                  Platform sahibi, işbu Sözleşme'yi dilediği zaman değiştirme hakkını saklı tutar. Değişiklikler Platform üzerinden duyurulacak ve yürürlük tarihinden itibaren geçerli olacaktır. Kullanıcı, Platform'u kullanmaya devam ederek değişiklikleri kabul etmiş sayılır.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">12. Uyuşmazlık Çözümü</h4>
                <p>
                  İşbu Sözleşme'nin uygulanmasından veya yorumlanmasından doğabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti yasaları uygulanır. Uyuşmazlıkların çözümünde <strong>Sivas Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">13. Yürürlük</h4>
                <p>
                  İşbu Sözleşme, Kullanıcı'nın Platform'a kayıt olması veya Platform'u kullanmaya başlaması ile yürürlüğe girer ve Kullanıcı'nın hesabını silmesi veya Platform tarafından hesabın kapatılması ile sona erer.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">14. İletişim</h4>
                <p className="mb-2">
                  Sözleşme ile ilgili sorularınız veya talepleriniz için aşağıdaki iletişim kanallarını kullanabilirsiniz:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-1 text-sm">
                    <li><strong>E-posta:</strong> ecmelazizoglu@gmail.com</li>
                    <li><strong>Telefon:</strong> 0539 487 00 58</li>
                    <li><strong>Adres:</strong> Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire: 11, Sivas Merkez</li>
                  </ul>
                </div>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">15. Mücbir Sebepler</h4>
                <p>
                  Doğal afetler, savaş, terör, grev, internet altyapı arızaları, siber saldırılar veya Platform sahibinin kontrolü dışındaki diğer olaylar nedeniyle hizmetin sunulamamasından Platform sahibi sorumlu tutulamaz.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">16. Delil Sözleşmesi</h4>
                <p>
                  Taraflar, işbu Sözleşme'den doğabilecek ihtilaflarda Platform'un elektronik kayıtlarının, bilgisayar ve sunucu kayıtlarının, e-posta kayıtlarının geçerli, bağlayıcı, kesin ve münhasır delil teşkil edeceğini ve bu maddenin HMK m. 193 anlamında delil sözleşmesi niteliğinde olduğunu kabul eder.
                </p>
              </section>

              <section className="border-t pt-4 mt-6">
                <p className="text-xs text-gray-600">
                  <strong>Son Güncelleme Tarihi:</strong> 8 Ekim 2025<br/>
                  <strong>Yürürlük Tarihi:</strong> 8 Ekim 2025<br/>
                  <strong>Versiyon:</strong> 1.0<br/><br/>
                  Bu Kullanıcı Sözleşmesi, Platform'a kayıt olan veya Platform'u kullanan her kullanıcı tarafından kabul edilmiş sayılır.
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

export default LoginPage;