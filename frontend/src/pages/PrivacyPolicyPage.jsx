import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ana Sayfaya Dön
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Veri Sorumlusu</h2>
              <p>FidBal Uyku ve Stres Yönetimi olarak kişisel verilerinizin korunmasına önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla, kişisel verilerinizin işlenmesine ilişkin olarak sizi bilgilendirmek isteriz.</p>
              <div className="bg-blue-50 p-4 rounded-lg mt-3">
                <p className="font-semibold mb-2">Veri Sorumlusu Bilgileri:</p>
                <ul className="text-sm space-y-1">
                  <li><strong>E-posta:</strong> Hecmel@fidbal.com</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. İşlenen Kişisel Veriler</h2>
              <p className="mb-2">Platformumuz üzerinde aşağıdaki kişisel verileriniz işlenmektedir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
                <li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi</li>
                <li><strong>Sağlık Verileri:</strong> Uyku kalitesi, uyku süresi, kalp atım hızı, stres seviyesi, ruh hali bilgileri</li>
                <li><strong>Kullanıcı İşlem Verileri:</strong> Uygulama kullanım geçmişi, tercihler, form yanıtları</li>
                <li><strong>İşlem Güvenliği Verileri:</strong> IP adresi, giriş saati, cihaz bilgisi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Verilerin İşlenme Amacı</h2>
              <p className="mb-2">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uyku ve stres yönetimi hizmeti sunmak</li>
                <li>Kullanıcı deneyimini kişiselleştirmek ve iyileştirmek</li>
                <li>Sağlık ve yaşam kalitesi analizi yapmak</li>
                <li>İstatistiksel analiz ve araştırma yapmak (akademik tez çalışması)</li>
                <li>Hizmet kalitesini artırmak</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
                <li>Platform güvenliğini sağlamak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Verilerin İşlenme Hukuki Sebepleri</h2>
              <p className="mb-2">Kişisel verileriniz KVKK m.5 ve m.6 kapsamında aşağıdaki hukuki sebeplerle işlenmektedir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Açık rızanızın bulunması (KVKK m.5/1)</li>
                <li>Sözleşmenin kurulması veya ifası için gerekli olması (KVKK m.5/2-c)</li>
                <li>Hukuki yükümlülüğün yerine getirilmesi (KVKK m.5/2-ç)</li>
                <li>Bilimsel araştırma amacıyla işlenmesi (KVKK m.6/3)</li>
                <li>Kamu sağlığının korunması amacıyla işlenmesi (KVKK m.6/3)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Verilerin Aktarılması</h2>
              <p className="mb-2">Verileriniz aşağıdaki altyapı sağlayıcılarla güvenli şekilde paylaşılmaktadır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Neon (Veritabanı):</strong> ABD - Veri saklama</li>
                <li><strong>Vercel (Hosting):</strong> ABD - Uygulama barındırma</li>
                <li><strong>Cloudflare (CDN):</strong> Küresel - İçerik dağıtım ağı</li>
                <li><strong>Firebase (Bildirimler):</strong> ABD - Anlık bildirimler</li>
              </ul>
              <p className="mt-2">Tüm veri aktarımları SSL/TLS 256-bit şifreleme ile güvenli şekilde yapılmakta ve KVKK m.9 uyarınca yeterli koruma sağlanmaktadır.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Kişisel Veri Sahibi Olarak Haklarınız (KVKK m.11)</h2>
              <p className="mb-2">KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme ve yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                <li><strong>Veri taşınabilirliği hakkı:</strong> Verilerinizi yapılandırılmış ve yaygın kullanılan bir formatta indirme (JSON)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Veri Saklama Süresi</h2>
              <p>Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen saklama süreleri dahilinde saklanmaktadır. Hizmet sözleşmesi sona erdikten sonra yasal saklama yükümlülüğü bulunmayan veriler silinmekte, yok edilmekte veya anonim hale getirilmektedir.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Veri Güvenliği</h2>
              <p className="mb-2">Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari tedbirler alınmıştır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>256-bit SSL/TLS şifreleme ile veri iletimi</li>
                <li>Şifrelerin bcrypt algoritması ile hashlenmiş saklanması</li>
                <li>Düzenli güvenlik güncellemeleri ve yamaları</li>
                <li>Erişim kontrolü ve yetkilendirme mekanizmaları</li>
                <li>Güvenlik duvarı ve DDoS koruması</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Veri yedekleme ve kurtarma planları</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Çerez (Cookie) Politikası</h2>
              <p className="mb-2">Platformumuzda kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi için gerekli</li>
                <li><strong>Analitik Çerezler:</strong> Platform kullanım istatistikleri</li>
                <li><strong>Tercih Çerezleri:</strong> Kullanıcı tercihlerinin hatırlanması</li>
              </ul>
              <p className="mt-2">Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Haklarınızı Kullanma Yolları</h2>
              <p className="mb-2">KVKK kapsamındaki haklarınızı kullanmak için:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>E-posta:</strong> Hecmel@fidbal.com</li>
                <li><strong>Platform Üzerinden:</strong> Profil → Hesap Ayarları → "Verilerimi İndir" veya "Hesabımı Sil"</li>
              </ul>
              <p className="mt-2">Başvurularınız en geç 30 gün içinde ücretsiz olarak yanıtlanacaktır. Başvurunun ayrıca bir maliyet gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınacaktır.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Veri İhlali Bildirimi</h2>
              <p>Kişisel verilerinizle ilgili herhangi bir güvenlik ihlali tespit edildiğinde, KVKK m.12 uyarınca ilgili kişilere ve Kişisel Verileri Koruma Kurulu'na gecikmeksizin bildirimde bulunulacaktır.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Değişiklikler</h2>
              <p>Bu Gizlilik Politikası ve KVKK Aydınlatma Metni gerektiğinde güncellenebilir. Önemli değişiklikler platformumuz üzerinden duyurulacaktır. Güncel metni düzenli olarak kontrol etmenizi öneririz.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. İletişim</h2>
              <p className="mb-2">Kişisel verilerinizin işlenmesi hakkında sorularınız için:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-none space-y-2">
                  <li><strong>E-posta:</strong> Hecmel@fidbal.com</li>
                </ul>
              </div>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-gray-600">
                <strong>Son Güncelleme Tarihi:</strong> 15 Aralık 2023<br/>
                <strong>Yürürlük Tarihi:</strong> 15 Aralık 2023<br/>
                <strong>Versiyon:</strong> 2.0<br/><br/>
                Bu metin 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat uyarınca hazırlanmıştır.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;