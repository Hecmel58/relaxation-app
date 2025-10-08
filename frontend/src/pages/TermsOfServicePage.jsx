import React from 'react';
import { Link } from 'react-router-dom';

function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Kullanıcı Sözleşmesi ve Kullanım Koşulları</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Taraflar ve Tanımlar</h2>
              <p className="mb-2">
                İşbu Kullanıcı Sözleşmesi ("Sözleşme"), FidBal Uyku ve Stres Yönetimi platformu ("Platform") ve Platform'u kullanan gerçek veya tüzel kişiler ("Kullanıcı") arasında elektronik ortamda akdedilmiştir.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mt-3">
                <p className="font-semibold mb-2">Platform Sahibi Bilgileri:</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Ad Soyad:</strong> Hasan Balkaya</li>
                  <li><strong>Telefon:</strong> 0539 487 00 58</li>
                  <li><strong>Adres:</strong> Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire: 11, Sivas Merkez</li>
                  <li><strong>E-posta:</strong> hecmel58@gmail.com</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Sözleşmenin Konusu</h2>
              <p>
                İşbu Sözleşme, Platform'un sunduğu hizmetlerin Kullanıcı tarafından kullanımına ilişkin tarafların hak ve yükümlülüklerini düzenlemektedir. Platform, akademik bir tez çalışması kapsamında ücretsiz olarak sunulmakta olup, uyku takibi, stres yönetimi, rahatlama teknikleri ve ilgili sağlık hizmetlerini içermektedir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Hizmetin Kapsamı</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Kullanıcı Yükümlülükleri</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Fikri Mülkiyet Hakları</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Hizmetin Ücretsiz Olması</h2>
              <p>
                Platform, akademik bir tez çalışması kapsamında geliştirilmiş olup, şu anda tamamen ücretsiz olarak sunulmaktadır. Ancak, gelecekte belirli hizmetler için ücretlendirme yapılması durumunda, kullanıcılar önceden bilgilendirilecek ve onayları alınacaktır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Sorumluluk Reddi ve Garanti</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Gizlilik ve Veri Koruma</h2>
              <p>
                Kullanıcı verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat kapsamında işlenmekte ve korunmaktadır. Detaylı bilgi için <Link to="/privacy-policy" className="text-indigo-600 hover:underline">Gizlilik Politikası</Link> sayfasını inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Hesap İptali ve Askıya Alma</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Hizmet Değişiklikleri ve Sonlandırma</h2>
              <p>
                Platform sahibi, önceden bildirimde bulunarak veya bulunmaksızın, Platform'un tamamını veya bir kısmını geçici veya kalıcı olarak değiştirme, askıya alma veya sonlandırma hakkını saklı tutar. Bu durumlardan dolayı Platform sahibinin herhangi bir sorumluluğu bulunmamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Sözleşme Değişiklikleri</h2>
              <p>
                Platform sahibi, işbu Sözleşme'yi dilediği zaman değiştirme hakkını saklı tutar. Değişiklikler Platform üzerinden duyurulacak ve yürürlük tarihinden itibaren geçerli olacaktır. Kullanıcı, Platform'u kullanmaya devam ederek değişiklikleri kabul etmiş sayılır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Uyuşmazlık Çözümü</h2>
              <p>
                İşbu Sözleşme'nin uygulanmasından veya yorumlanmasından doğabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti yasaları uygulanır. Uyuşmazlıkların çözümünde <strong>Sivas Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Yürürlük</h2>
              <p>
                İşbu Sözleşme, Kullanıcı'nın Platform'a kayıt olması veya Platform'u kullanmaya başlaması ile yürürlüğe girer ve Kullanıcı'nın hesabını silmesi veya Platform tarafından hesabın kapatılması ile sona erer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. İletişim</h2>
              <p className="mb-2">
                Sözleşme ile ilgili sorularınız veya talepleriniz için aşağıdaki iletişim kanallarını kullanabilirsiniz:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-1 text-sm">
                  <li><strong>E-posta:</strong> hecmel58@gmail.com</li>
                  <li><strong>Telefon:</strong> 0539 487 00 58</li>
                  <li><strong>Adres:</strong> Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire: 11, Sivas Merkez</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Mücbir Sebepler</h2>
              <p>
                Doğal afetler, savaş, terör, grev, internet altyapı arızaları, siber saldırılar veya Platform sahibinin kontrolü dışındaki diğer olaylar nedeniyle hizmetin sunulamamasından Platform sahibi sorumlu tutulamaz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Delil Sözleşmesi</h2>
              <p>
                Taraflar, işbu Sözleşme'den doğabilecek ihtilaflarda Platform'un elektronik kayıtlarının, bilgisayar ve sunucu kayıtlarının, e-posta kayıtlarının geçerli, bağlayıcı, kesin ve münhasır delil teşkil edeceğini ve bu maddenin HMK m. 193 anlamında delil sözleşmesi niteliğinde olduğunu kabul eder.
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                <strong>Son Güncelleme Tarihi:</strong> 8 Ekim 2025<br/>
                <strong>Yürürlük Tarihi:</strong> 8 Ekim 2025<br/>
                <strong>Versiyon:</strong> 1.0<br/><br/>
                Bu Kullanıcı Sözleşmesi, Platform'a kayıt olan veya Platform'u kullanan her kullanıcı tarafından kabul edilmiş sayılır.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;