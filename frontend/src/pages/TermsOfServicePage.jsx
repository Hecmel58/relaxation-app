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
                  
                  <li><strong>E-posta:</strong> Hecmel@fidbal.com</li>
                </ul>
              </div>
              <p className="mt-3 text-sm">
                <strong>Tanımlar:</strong><br/>
                <strong>Platform:</strong> FidBal Uyku ve Stres Yönetimi web sitesi ve mobil uygulaması.<br/>
                <strong>Kullanıcı:</strong> Platform'a kayıt olan veya Platform'u kullanan her gerçek veya tüzel kişi.<br/>
                <strong>Hizmet:</strong> Platform üzerinden sunulan tüm içerik, özellik ve fonksiyonlar.<br/>
                <strong>Kişisel Veri:</strong> Kullanıcıya ait her türlü tanımlayıcı bilgi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Sözleşmenin Konusu</h2>
              <p>
                İşbu Sözleşme, Platform'un sunduğu hizmetlerin Kullanıcı tarafından kullanımına ilişkin tarafların hak ve yükümlülüklerini düzenlemektedir. Platform, akademik bir tez çalışması kapsamında ücretsiz olarak sunulmakta olup, uyku takibi, stres yönetimi, rahatlama teknikleri ve ilgili sağlık hizmetlerini içermektedir.
              </p>
              <p className="mt-2">
                Kullanıcı, Platform'a kayıt olarak veya Platform'u kullanarak işbu Sözleşme'nin tüm hükümlerini kabul ettiğini beyan ve taahhüt eder.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Hizmetin Kapsamı</h2>
              <p className="mb-2">Platform aşağıdaki hizmetleri sunmaktadır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Uyku Takibi:</strong> Kullanıcıların uyku kalitesi, süresi ve düzenini takip etme imkanı</li>
                <li><strong>Kalp Atım Hızı İzleme:</strong> Gerçek zamanlı kalp atım hızı ölçümü ve analizi</li>
                <li><strong>Stres Değerlendirmesi:</strong> Kullanıcıların stres seviyelerini değerlendirme araçları</li>
                <li><strong>Rahatlama Sesleri:</strong> Meditasyon, doğa sesleri ve rahatlama müzikleri</li>
                <li><strong>Binaural Sesler:</strong> Zihinsel rahatlama için özel olarak tasarlanmış ses terapileri</li>
                <li><strong>Kişiselleştirilmiş Raporlama:</strong> Kullanıcı verilerine dayalı özelleştirilmiş analizler ve öneriler</li>
                <li><strong>Uzman Desteği:</strong> Sağlık profesyonelleri ile iletişim imkanı</li>
                <li><strong>Eğitim İçerikleri:</strong> Uyku hijyeni ve stres yönetimi konularında bilgilendirici materyaller</li>
              </ul>
              <p className="mt-3 text-sm bg-amber-50 p-3 rounded">
                <strong>Not:</strong> Platform sahibi, sunulan hizmetlerin kapsamını, özelliklerini ve içeriğini önceden bildirimde bulunmaksızın değiştirme, genişletme veya daraltma hakkını saklı tutar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Kullanıcı Yükümlülükleri</h2>
              <p className="mb-2">Kullanıcı, Platform'u kullanırken aşağıdaki yükümlülükleri kabul eder:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kayıt sırasında doğru, güncel ve eksiksiz bilgi sağlamak</li>
                <li>Hesap güvenliğini sağlamak ve şifresini üçüncü kişilerle paylaşmamak</li>
                <li>Hesabında gerçekleşen tüm faaliyetlerden sorumlu olmak</li>
                <li>Platform'u yasalara, ahlak kurallarına ve etik ilkelere uygun şekilde kullanmak</li>
                <li>Platform'un teknik altyapısına zarar verecek davranışlardan (virüs, zararlı yazılım vb.) kaçınmak</li>
                <li>Diğer kullanıcıların haklarına ve gizliliğine saygı göstermek</li>
                <li>Platform'u ticari amaçla kullanmamak (izin alınmadıkça)</li>
                <li>Platform içeriğini izinsiz kopyalamamak, çoğaltmamak, değiştirmemek veya dağıtmamak</li>
                <li>Yanıltıcı, aldatıcı veya yanlış bilgi paylaşmamak</li>
                <li>Spam, istenmeyen reklam veya zararlı içerik göndermemek</li>
                <li>Platform'u başkalarının haklarını ihlal edecek şekilde kullanmamak</li>
                <li>Güvenlik açıklarını keşfetmesi halinde derhal Platform sahibine bildirmek</li>
              </ul>
              <p className="mt-3 text-sm bg-red-50 p-3 rounded">
                <strong>Uyarı:</strong> Kullanıcı yükümlülüklerinin ihlali durumunda, Platform sahibi hiçbir ön bildirimde bulunmaksızın kullanıcı hesabını askıya alabilir veya tamamen kapatabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Fikri Mülkiyet Hakları</h2>
              <p>
                Platform'daki tüm içerik, tasarım, yazılım, kaynak kodu, logo, marka, metin, görsel, video, ses dosyaları, grafik, veri tabanı ve diğer tüm materyaller Hasan Balkaya'ya aittir ve Türkiye Cumhuriyeti ve uluslararası telif hakkı, ticari marka, patent ve diğer fikri mülkiyet hakları yasaları ile korunmaktadır.
              </p>
              <p className="mt-2">
                Kullanıcı, Platform'daki hiçbir içeriği ticari amaçla kullanamaz, kopyalayamaz, değiştiremez, dağıtamaz, yeniden yayımlayamaz, tersine mühendislik yapamaz veya türev eserler oluşturamaz. Platform'un kullanımı, kullanıcıya herhangi bir fikri mülkiyet hakkı devretmez.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg mt-3">
                <p className="font-semibold text-amber-900 mb-2">⚠️ Önemli Uyarı:</p>
                <p className="text-sm text-amber-800">
                  Bu platform, akademik bir tez çalışması kapsamında geliştirilmiştir. Tüm hakları saklıdır. İzinsiz kullanım, kopyalama veya dağıtım 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında suç teşkil eder ve hukuki ve cezai yaptırım gerektirir.
                </p>
              </div>
              <p className="mt-3">
                <strong>Kullanıcı İçerikleri:</strong> Kullanıcıların Platform'a yüklediği içeriklerin (yorumlar, geri bildirimler vb.) fikri mülkiyet hakları kullanıcıya aittir. Ancak kullanıcı, Platform sahibine bu içerikleri Platform üzerinde kullanma, gösterme, işleme ve akademik amaçlarla paylaşma konusunda dünya çapında, telifsiz, devredilebilir bir lisans vermiş olur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Hizmetin Ücretsiz Olması ve Gelecek Düzenlemeler</h2>
              <p>
                Platform, akademik bir tez çalışması kapsamında geliştirilmiş olup, şu anda tamamen <strong>ücretsiz</strong> olarak sunulmaktadır. Kullanıcılardan herhangi bir ücret talep edilmemektedir.
              </p>
              <p className="mt-2">
                Gelecekte, Platform'un tamamı veya belirli hizmetleri için ücretlendirme modeli uygulanması durumunda:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Kullanıcılar en az 30 gün önceden bilgilendirilecektir</li>
                <li>Mevcut kullanıcılar için geçiş dönemi tanınacaktır</li>
                <li>Ücretlendirme planları açıkça belirtilecektir</li>
                <li>Kullanıcıların onayı alınacaktır</li>
                <li>Ücretli hizmetleri kullanmak istemeyen kullanıcılar hesaplarını ücretsiz kapatabilirler</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Sorumluluk Reddi ve Garanti</h2>
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                <p className="font-semibold text-red-900 mb-2">🚨 ÖNEMLİ SAĞLIK UYARISI:</p>
                <ul className="list-disc list-inside space-y-2 text-sm text-red-800">
                  <li><strong>Platform, tıbbi teşhis veya tedavi amacı taşımamaktadır.</strong> Platform bir sağlık hizmeti sunucusu değildir.</li>
                  <li>Platform'da sunulan bilgiler, içerikler ve öneriler, profesyonel tıbbi tavsiye, teşhis veya tedavi yerine geçmez ve geçmemesi gerekir.</li>
                  <li>Herhangi bir sağlık sorunu, hastalık veya belirti yaşıyorsanız, mutlaka lisanslı bir sağlık uzmanına başvurunuz.</li>
                  <li>Platform'un kullanımından kaynaklanan herhangi bir sağlık sorunu, yaralanma veya olumsuz sonuçtan Platform sahibi sorumlu tutulamaz.</li>
                  <li>Mevcut bir tedavi görüyorsanız veya ilaç kullanıyorsanız, doktorunuza danışmadan Platform'daki teknikleri uygulamayınız.</li>
                  <li><strong>Acil durumlarda mutlaka 112'yi arayın.</strong> Platform acil tıbbi durumlar için kullanılmamalıdır.</li>
                  <li>Hamilelik, epilepsi, kalp rahatsızlığı veya psikolojik rahatsızlık durumunda doktorunuza danışmadan binaural ses teknolojilerini kullanmayınız.</li>
                </ul>
              </div>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Genel Sorumluluk Reddi:</h3>
              <p>
                Platform "olduğu gibi" ve "mevcut haliyle" sunulmaktadır. Platform sahibi, aşağıdaki hususlarla sınırlı olmamak üzere hiçbir konuda garanti vermez:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Hizmetin kesintisiz, hatasız, güvenli veya virüs içermeyeceği</li>
                <li>Hizmetin kullanıcının ihtiyaçlarını karşılayacağı</li>
                <li>Hizmetten elde edilecek sonuçların doğru veya güvenilir olacağı</li>
                <li>Platform üzerindeki bilgilerin güncel, doğru veya eksiksiz olduğu</li>
                <li>Platform'un hataların veya eksikliklerin düzeltileceği</li>
              </ul>
              
              <p className="mt-3">
                Platform sahibi, kullanıcının Platform'u kullanmasından veya kullanamamasından kaynaklanan doğrudan, dolaylı, arızi, özel veya sonuç olarak ortaya çıkan zararlardan (kâr kaybı, veri kaybı, iş kaybı dahil ancak bunlarla sınırlı olmamak üzere) sorumlu değildir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Gizlilik ve Veri Koruma</h2>
              <p>
                Kullanıcı verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat kapsamında işlenmekte ve korunmaktadır.
              </p>
              
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">Toplanan Veriler:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Kimlik bilgileri (ad, soyad)</li>
                <li>İletişim bilgileri (telefon, e-posta)</li>
                <li>Uyku verileri (uyku süresi, kalitesi, düzeni)</li>
                <li>Sağlık verileri (kalp atım hızı, stres seviyeleri)</li>
                <li>Platform kullanım verileri (giriş saatleri, kullanım sıklığı)</li>
                <li>Teknik veriler (IP adresi, cihaz bilgisi, tarayıcı bilgisi)</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">Verilerin Kullanım Amaçları:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Hizmetin sunulması ve geliştirilmesi</li>
                <li>Kişiselleştirilmiş önerilerin oluşturulması</li>
                <li>Akademik araştırma ve analiz (anonimleştirilmiş)</li>
                <li>Platform güvenliğinin sağlanması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Kullanıcı ile iletişim kurulması</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">Kullanıcı Hakları (KVKK m.11):</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                <li>Kişisel verilerin aktarıldığı üçüncü kişilere yukarıdaki düzeltme ve silme taleplerinin bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
              </ul>
              
              <p className="mt-3">
                Detaylı bilgi için <Link to="/privacy-policy" className="text-primary-600 hover:underline font-medium">Gizlilik Politikası</Link> sayfasını inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Hesap İptali ve Askıya Alma</h2>
              <p className="mb-2">Platform sahibi, aşağıdaki durumlarda önceden bildirimde bulunarak veya bulunmaksızın kullanıcı hesabını askıya alabilir, kısıtlayabilir veya tamamen silebilir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>İşbu Sözleşme hükümlerinin ihlali</li>
                <li>Yanlış, yanıltıcı veya sahte bilgi sağlanması</li>
                <li>Platform'un güvenliğine veya işleyişine zarar verecek faaliyetler</li>
                <li>Diğer kullanıcıların haklarının veya gizliliğinin ihlali</li>
                <li>Yasadışı faaliyetler veya suç teşkil eden davranışlar</li>
                <li>Spam, kötü amaçlı yazılım veya zararlı içerik paylaşımı</li>
                <li>Ticari kullanım (izin verilmemişse)</li>
                <li>Hesabın uzun süre kullanılmaması (1 yıldan fazla)</li>
              </ul>
              <p className="mt-2">
                Kullanıcı, KVKK kapsamındaki haklarını kullanarak hesabını ve tüm verilerini istediği zaman silme talebinde bulunabilir. Hesap kapatma talebi 30 gün içinde işleme alınır.
              </p>
              <p className="mt-2 text-sm bg-blue-50 p-3 rounded">
                <strong>Not:</strong> Hesap kapatıldıktan sonra, yasal saklama yükümlülükleri dışında tüm kullanıcı verileri kalıcı olarak silinir ve geri getirilemez.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Hizmet Değişiklikleri ve Sonlandırma</h2>
              <p>
                Platform sahibi, aşağıdaki hususlarda tek taraflı karar alma hakkını saklı tutar:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Platform'un tamamını veya bir kısmını geçici veya kalıcı olarak değiştirme</li>
                <li>Hizmetleri askıya alma, durdurma veya sonlandırma</li>
                <li>Yeni özellikler ekleme veya mevcut özellikleri kaldırma</li>
                <li>Platform'un teknik altyapısını değiştirme</li>
                <li>Kullanım koşullarını güncelleme</li>
              </ul>
              <p className="mt-2">
                Önemli değişiklikler veya hizmetin sonlandırılması durumunda, kullanıcılar mümkün olduğunca önceden bilgilendirilir. Ancak acil güvenlik önlemleri, teknik sorunlar veya yasal zorunluluklar nedeniyle önceden bildirimde bulunulamayabilir.
              </p>
              <p className="mt-2">
                Platform sahibi, hizmetin kesintiye uğraması, değiştirilmesi veya sonlandırılmasından dolayı ortaya çıkabilecek herhangi bir zarardan sorumlu tutulamaz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Sözleşme Değişiklikleri</h2>
              <p>
                Platform sahibi, işbu Sözleşme'yi dilediği zaman tek taraflı olarak değiştirme, güncelleme veya revize etme hakkını saklı tutar. Değişiklikler, Platform üzerinden duyurulacak ve yürürlük tarihinden itibaren geçerli olacaktır.
              </p>
              <p className="mt-2">
                Önemli değişiklikler e-posta veya Platform içi bildirim yoluyla kullanıcılara bildirilir. Kullanıcı, değişiklikler yürürlüğe girdikten sonra Platform'u kullanmaya devam ederek güncel Sözleşme'yi kabul etmiş sayılır.
              </p>
              <p className="mt-2">
                Değişiklikleri kabul etmeyen kullanıcılar, hesaplarını kapatarak Platform'u kullanmayı durdurabilirler.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Uyuşmazlık Çözümü ve Yetkili Mahkeme</h2>
              <p>
                İşbu Sözleşme'nin uygulanmasından, yorumlanmasından veya Sözleşme ile ilgili olarak doğabilecek her türlü uyuşmazlığın çözümünde <strong>Türkiye Cumhuriyeti yasaları</strong> uygulanır.
              </p>
              <p className="mt-2">
                Taraflar arasında doğabilecek her türlü uyuşmazlığın çözümünde <strong>Sivas Mahkemeleri ve İcra Daireleri</strong> yetkilidir. Bu yetki anlaşması, tüketici işlemleri için Tüketicinin Korunması Hakkında Kanun'dan doğan haklarını sınırlamaz.
              </p>
              <p className="mt-2">
                Uyuşmazlıklar öncelikle taraflar arasında dostane görüşme yoluyla çözülmeye çalışılır. Çözüm sağlanamaz ise yasal yollara başvurulabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Yürürlük ve Süre</h2>
              <p>
                İşbu Sözleşme, Kullanıcı'nın Platform'a kayıt olması, "Kabul Ediyorum" butonuna tıklaması veya Platform'u kullanmaya başlaması ile yürürlüğe girer ve aşağıdaki durumlardan birinin gerçekleşmesine kadar geçerli kalır:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Kullanıcı'nın hesabını silmesi</li>
                <li>Platform tarafından hesabın kapatılması</li>
                <li>Platform'un hizmetini sonlandırması</li>
                <li>Taraflardan birinin Sözleşme'yi feshetmesi</li>
              </ul>
              <p className="mt-2">
                Sözleşme sona erdiğinde bile, doğası gereği devam etmesi gereken hükümler (sorumluluk reddi, fikri mülkiyet, uyuşmazlık çözümü vb.) yürürlükte kalmaya devam eder.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. İletişim Bilgileri ve Başvuru</h2>
              <p className="mb-2">
                İşbu Sözleşme ile ilgili sorularınız, talepleriniz, şikayetleriniz veya KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki iletişim kanallarını kullanabilirsiniz:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li><strong>E-posta:</strong> Hecmel@fidbal.com</li>
                                  </ul>
              </div>
              <p className="mt-3 text-sm">
                Talepleriniz en geç 30 gün içinde değerlendirilir ve size geri dönüş yapılır. KVKK kapsamındaki başvurularınız için kimlik tespiti gerekebilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Mücbir Sebepler (Force Majeure)</h2>
              <p>
                Aşağıdaki durumlar mücbir sebep sayılır ve Platform sahibi bu durumlardan kaynaklanan yükümlülüklerini yerine getiremediğinden sorumlu tutulamaz:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Doğal afetler (deprem, sel, yangın, fırtına vb.)</li>
                <li>Savaş, terör, seferberlik, ayaklanma, iç savaş</li>
                <li>Grev, lokavt, genel işçi hareketleri</li>
                <li>İnternet altyapı arızaları veya kesintileri</li>
                <li>Elektrik kesintisi veya enerji krizi</li>
                <li>Siber saldırılar, DDoS saldırıları, hacking girişimleri</li>
                <li>Resmi makamların kararları, yasaklar, ambargolar</li>
                <li>Salgın hastalıklar, pandemi</li>
                <li>Hosting veya sunucu sağlayıcılardan kaynaklanan sorunlar</li>
                <li>Platform sahibinin kontrolü dışındaki diğer olaylar</li>
              </ul>
              <p className="mt-2">
                Mücbir sebep durumunda Platform sahibi, kullanıcıları mümkün olan en kısa sürede bilgilendirir ve normal hizmete dönmek için gerekli çabayı gösterir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Delil Sözleşmesi</h2>
              <p>
                Taraflar, işbu Sözleşme'den veya Platform kullanımından doğabilecek her türlü uyuşmazlıkta aşağıdaki kayıtların geçerli, bağlayıcı, kesin ve münhasır delil teşkil edeceğini kabul eder:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Platform'un elektronik kayıtları ve veritabanı kayıtları</li>
                <li>Sunucu log kayıtları ve sistem logları</li>
                <li>E-posta kayıtları ve bildirimler</li>
                <li>Kullanıcı işlem geçmişi</li>
                <li>IP adresi ve oturum kayıtları</li>
                <li>Platform içi mesajlaşma kayıtları</li>
              </ul>
              <p className="mt-2">
                Bu madde, 6100 sayılı Hukuk Muhakemeleri Kanunu'nun 193. maddesi anlamında bir delil sözleşmesi niteliğindedir. Taraflar, bu kayıtların HMK m. 193 uyarınca delil olarak kabul edilmesini ve mahkeme veya hakem heyeti tarafından değerlendirilmesini kabul ederler.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">17. Çeşitli Hükümler</h2>
              
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">17.1. Bütünlük:</h3>
              <p>
                İşbu Sözleşme, taraflar arasındaki ilişkiyi düzenleyen tam ve eksiksiz anlaşmadır. Daha önce yapılmış sözlü veya yazılı tüm anlaşmaların yerine geçer.
              </p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">17.2. Kısmi Geçersizlik:</h3>
              <p>
                Sözleşme'nin herhangi bir hükmünün geçersiz, yasadışı veya uygulanamaz olması durumunda, bu durum diğer hükümlerin geçerliliğini etkilemez. Geçersiz hüküm, amacına en yakın geçerli bir hükümle değiştirilmiş sayılır.
              </p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">17.3. Feragat:</h3>
              <p>
                Platform sahibinin herhangi bir hakkını kullanmaması veya gecikmeli kullanması, o haktan feragat ettiği anlamına gelmez.
              </p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">17.4. Devir Yasağı:</h3>
              <p>
                Kullanıcı, Platform sahibinin önceden yazılı onayı olmadan işbu Sözleşme'den doğan hak ve yükümlülüklerini üçüncü kişilere devredemez. Platform sahibi ise haklarını ve yükümlülüklerini serbestçe devredebilir.
              </p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">17.5. Bildirimler:</h3>
              <p>
                Platform sahibi tarafından yapılacak tüm bildirimler, kullanıcının kayıt sırasında verdiği e-posta adresine veya Platform içi bildirim sistemi ile gönderilir ve gönderildiği anda tebliğ edilmiş sayılır.
              </p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">17.6. Dil:</h3>
              <p>
                İşbu Sözleşme'nin geçerli dili Türkçe'dir. Başka dillere çevrilmiş versiyonlar yalnızca kolaylık sağlamak içindir ve Türkçe versiyonla çelişki halinde Türkçe versiyon geçerlidir.
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">18. Son Hükümler</h2>
              <p>
                İşbu Kullanıcı Sözleşmesi, Platform'a kayıt olan, "Kabul Ediyorum" butonuna tıklayan veya Platform'u kullanan her kullanıcı tarafından okunmuş, anlaşılmış ve kabul edilmiş sayılır.
              </p>
              <p className="mt-2">
                Kullanıcı, Sözleşme'yi kabul ederek 18 yaşını doldurduğunu veya yasal temsilcisinin onayı ile hareket ettiğini beyan ve taahhüt eder.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Son Güncelleme Tarihi:</strong> 8 Ekim 2025<br/>
                  <strong>Yürürlük Tarihi:</strong> 8 Ekim 2025<br/>
                  <strong>Sözleşme Versiyonu:</strong> 1.0<br/>
                  <strong>E-posta:</strong> Hecmel@fidbal.com
                </p>
              </div>

              <p className="mt-4 text-sm italic text-gray-600">
                Bu Kullanıcı Sözleşmesi, 6098 sayılı Türk Borçlar Kanunu, 6502 sayılı Tüketicinin Korunması Hakkında Kanun, 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat hükümleri çerçevesinde hazırlanmıştır.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;