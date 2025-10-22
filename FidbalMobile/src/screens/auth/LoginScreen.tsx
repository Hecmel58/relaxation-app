import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handlePhoneChange = (text: string) => {
    const value = text.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Hata', 'Telefon numarası ve şifre gereklidir');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Hata', 'Kullanıcı sözleşmesini onaylamanız gerekmektedir');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Hata', 'Telefon numarası 10 haneli olmalıdır');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Giriş yapılıyor...', phone);

      const response = await api.post('/auth/login', {
        phone: phone.toString(), // ✅ String'e çevir
        password: password,
      });

      console.log('✅ Login response:', response.data);

      if (response.data.success) {
        await login(response.data.user, response.data.token);
      } else {
        Alert.alert('Giriş Başarısız', response.data.message || 'Giriş yapılamadı');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Bir hata oluştu';

      Alert.alert('Giriş Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* LOGO & BAŞLIK */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>FidBal</Text>
            <Text style={styles.subtitle}>Uyku ve Stres Yönetimi</Text>
          </View>

          {/* GİRİŞ KARTI */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Giriş Yap</Text>

            {/* TELEFON NUMARASI */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="5XX XXX XX XX"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
                autoCapitalize="none"
              />
            </View>

            {/* ŞİFRE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* KULLANICI SÖZLEŞMESİ */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              disabled={loading}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  <Text
                    style={styles.termsLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                  >
                    Kullanıcı sözleşmesini
                  </Text>
                  {' okudum ve onaylıyorum'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* GİRİŞ BUTONU */}
            <TouchableOpacity
              style={[styles.loginButton, (loading || !agreedToTerms) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading || !agreedToTerms}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {/* ALT LİNKLER */}
            <View style={styles.linksContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={loading}
              >
                <Text style={styles.link}>Şifremi Unuttum</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
                <Text style={styles.link}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© Telif Hakkı 2025, Tüm Hakları Saklıdır</Text>
            <Text style={styles.footerLink}>Hecmel Tarafından Hazırlanmıştır</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* KULLANICI SÖZLEŞMESİ MODAL */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.container} edges={[]}>
          {/* MODAL HEADER */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kullanıcı Sözleşmesi ve Kullanım Koşulları</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* MODAL İÇERİK */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
            <Text style={styles.modalSectionTitle}>1. Taraflar ve Tanımlar</Text>
            <Text style={styles.modalText}>
              İşbu Kullanıcı Sözleşmesi ("Sözleşme"), FidBal Uyku ve Stres Yönetimi platformu
              ("Platform") ve Platform'u kullanan gerçek veya tüzel kişiler ("Kullanıcı") arasında
              elektronik ortamda akdedilmiştir.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Platform Sahibi Bilgileri:</Text>
              <Text style={styles.infoBoxText}>Ad Soyad: Hasan Balkaya</Text>
              <Text style={styles.infoBoxText}>Telefon: 0539 487 00 58</Text>
              <Text style={styles.infoBoxText}>
                Adres: Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire:
                11, Sivas Merkez
              </Text>
              <Text style={styles.infoBoxText}>E-posta: ecmelazizoglu@gmail.com</Text>
            </View>

            <Text style={styles.modalSectionTitle}>2. Sözleşmenin Konusu</Text>
            <Text style={styles.modalText}>
              İşbu Sözleşme, Platform'un sunduğu hizmetlerin Kullanıcı tarafından kullanımına
              ilişkin tarafların hak ve yükümlülüklerini düzenlemektedir. Platform, akademik bir tez
              çalışması kapsamında ücretsiz olarak sunulmakta olup, uyku takibi, stres yönetimi,
              rahatlama teknikleri ve ilgili sağlık hizmetlerini içermektedir.
            </Text>

            <Text style={styles.modalSectionTitle}>3. Hizmetin Kapsamı</Text>
            <Text style={styles.modalText}>
              Platform aşağıdaki hizmetleri sunmaktadır:{'\n\n'}
              • Uyku kalitesi takibi ve analizi{'\n'}
              • Kalp atım hızı izleme{'\n'}
              • Stres seviyesi değerlendirmesi{'\n'}
              • Rahatlama sesleri ve meditasyon teknikleri{'\n'}
              • Binaural sesler ile zihinsel rahatlama{'\n'}
              • Kişiselleştirilmiş raporlama ve öneriler{'\n'}
              • Uzman desteği ve danışmanlık
            </Text>

            <Text style={styles.modalSectionTitle}>4. Kullanıcı Yükümlülükleri</Text>
            <Text style={styles.modalText}>
              Kullanıcı, Platform'u kullanırken:{'\n\n'}
              • Doğru, güncel ve eksiksiz bilgi sağlamakla yükümlüdür{'\n'}
              • Hesap güvenliğini sağlamak ve şifresini gizli tutmakla sorumludur{'\n'}
              • Platform'u yasalara uygun ve etik kurallara uygun şekilde kullanacağını kabul eder
              {'\n'}
              • Platform'un teknik altyapısına zarar verecek davranışlardan kaçınacağını taahhüt
              eder{'\n'}
              • Diğer kullanıcıların haklarına saygı gösterecektir{'\n'}
              • Ticari amaçla kullanmayacağını kabul eder{'\n'}• Platform içeriğini izinsiz
              kopyalamayacak, çoğaltmayacak veya dağıtmayacaktır
            </Text>

            <Text style={styles.modalSectionTitle}>5. Fikri Mülkiyet Hakları</Text>
            <Text style={styles.modalText}>
              Platform'daki tüm içerik, tasarım, yazılım, kod, logo, metin, görsel, ses dosyaları ve
              diğer tüm materyaller Hasan Balkaya'ya aittir ve telif hakkı, ticari marka, patent ve
              diğer fikri mülkiyet hakları ile korunmaktadır. Kullanıcı, Platform'daki hiçbir
              içeriği ticari amaçla kullanamaz, kopyalayamaz, değiştiremez veya dağıtamaz.
            </Text>
            <View style={[styles.infoBox, styles.warningBox]}>
              <Text style={styles.warningTitle}>⚠️ Önemli Uyarı:</Text>
              <Text style={styles.warningText}>
                Bu platform, akademik bir tez çalışması kapsamında geliştirilmiştir. Tüm hakları
                saklıdır. İzinsiz kullanım, kopyalama veya dağıtım yasal işlem gerektirir.
              </Text>
            </View>

            <Text style={styles.modalSectionTitle}>6. Hizmetin Ücretsiz Olması</Text>
            <Text style={styles.modalText}>
              Platform, akademik bir tez çalışması kapsamında geliştirilmiş olup, şu anda tamamen
              ücretsiz olarak sunulmaktadır. Ancak, gelecekte belirli hizmetler için ücretlendirme
              yapılması durumunda, kullanıcılar önceden bilgilendirilecek ve onayları alınacaktır.
            </Text>

            <Text style={styles.modalSectionTitle}>7. Sorumluluk Reddi ve Garanti</Text>
            <View style={[styles.infoBox, styles.dangerBox]}>
              <Text style={styles.dangerTitle}>🚨 ÖNEMLİ SAĞLIK UYARISI:</Text>
              <Text style={styles.dangerText}>
                • Platform, tıbbi teşhis veya tedavi amacı taşımamaktadır{'\n'}
                • Platform'da sunulan bilgiler, profesyonel tıbbi tavsiye yerine geçmez{'\n'}
                • Sağlık sorunları için mutlaka bir sağlık uzmanına başvurulmalıdır{'\n'}
                • Platform'un kullanımından kaynaklanan herhangi bir sağlık sorunundan Platform
                sahibi sorumlu tutulamaz{'\n'}• Acil durumlarda 112'yi arayın
              </Text>
            </View>
            <Text style={styles.modalText}>
              Platform "olduğu gibi" sunulmaktadır. Platform sahibi, hizmetin kesintisiz, hatasız
              veya güvenli olacağına dair hiçbir garanti vermemektedir.
            </Text>

            <Text style={styles.modalSectionTitle}>8. Gizlilik ve Veri Koruma</Text>
            <Text style={styles.modalText}>
              Kullanıcı verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili
              mevzuat kapsamında işlenmekte ve korunmaktadır. Kullanıcılar, kişisel verilerinin
              toplanması, işlenmesi ve saklanmasına açıkça rıza göstermiş sayılır.
            </Text>

            <Text style={styles.modalSectionTitle}>9. Hesap İptali ve Askıya Alma</Text>
            <Text style={styles.modalText}>
              Platform sahibi, aşağıdaki durumlarda Kullanıcı hesabını askıya alabilir veya
              silebilir:{'\n\n'}
              • Sözleşme hükümlerinin ihlali{'\n'}
              • Yanlış veya yanıltıcı bilgi sağlanması{'\n'}
              • Platform'a zarar verecek faaliyetler{'\n'}
              • Diğer kullanıcıların haklarının ihlali{'\n'}• Yasadışı faaliyetler{'\n\n'}
              Kullanıcı, KVKK kapsamındaki haklarını kullanarak hesabını istediği zaman silebilir.
            </Text>

            <Text style={styles.modalSectionTitle}>10. Hizmet Değişiklikleri ve Sonlandırma</Text>
            <Text style={styles.modalText}>
              Platform sahibi, önceden bildirimde bulunarak veya bulunmaksızın, Platform'un tamamını
              veya bir kısmını geçici veya kalıcı olarak değiştirme, askıya alma veya sonlandırma
              hakkını saklı tutar. Bu durumlardan dolayı Platform sahibinin herhangi bir
              sorumluluğu bulunmamaktadır.
            </Text>

            <Text style={styles.modalSectionTitle}>11. Sözleşme Değişiklikleri</Text>
            <Text style={styles.modalText}>
              Platform sahibi, işbu Sözleşme'yi dilediği zaman değiştirme hakkını saklı tutar.
              Değişiklikler Platform üzerinden duyurulacak ve yürürlük tarihinden itibaren geçerli
              olacaktır. Kullanıcı, Platform'u kullanmaya devam ederek değişiklikleri kabul etmiş
              sayılır.
            </Text>

            <Text style={styles.modalSectionTitle}>12. Uyuşmazlık Çözümü</Text>
            <Text style={styles.modalText}>
              İşbu Sözleşme'nin uygulanmasından veya yorumlanmasından doğabilecek her türlü
              uyuşmazlığın çözümünde Türkiye Cumhuriyeti yasaları uygulanır. Uyuşmazlıkların
              çözümünde <Text style={styles.boldText}>Sivas Mahkemeleri ve İcra Daireleri</Text>{' '}
              yetkilidir.
            </Text>

            <Text style={styles.modalSectionTitle}>13. Yürürlük</Text>
            <Text style={styles.modalText}>
              İşbu Sözleşme, Kullanıcı'nın Platform'a kayıt olması veya Platform'u kullanmaya
              başlaması ile yürürlüğe girer ve Kullanıcı'nın hesabını silmesi veya Platform
              tarafından hesabın kapatılması ile sona erer.
            </Text>

            <Text style={styles.modalSectionTitle}>14. İletişim</Text>
            <Text style={styles.modalText}>
              Sözleşme ile ilgili sorularınız veya talepleriniz için aşağıdaki iletişim kanallarını
              kullanabilirsiniz:
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>E-posta: ecmelazizoglu@gmail.com</Text>
              <Text style={styles.infoBoxText}>Telefon: 0539 487 00 58</Text>
              <Text style={styles.infoBoxText}>
                Adres: Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire:
                11, Sivas Merkez
              </Text>
            </View>

            <Text style={styles.modalSectionTitle}>15. Mücbir Sebepler</Text>
            <Text style={styles.modalText}>
              Doğal afetler, savaş, terör, grev, internet altyapı arızaları, siber saldırılar veya
              Platform sahibinin kontrolü dışındaki diğer olaylar nedeniyle hizmetin sunulamamasından
              Platform sahibi sorumlu tutulamaz.
            </Text>

            <Text style={styles.modalSectionTitle}>16. Delil Sözleşmesi</Text>
            <Text style={styles.modalText}>
              Taraflar, işbu Sözleşme'den doğabilecek ihtilaflarda Platform'un elektronik
              kayıtlarının, bilgisayar ve sunucu kayıtlarının, e-posta kayıtlarının geçerli,
              bağlayıcı, kesin ve münhasır delil teşkil edeceğini ve bu maddenin HMK m. 193
              anlamında delil sözleşmesi niteliğinde olduğunu kabul eder.
            </Text>

            <View style={styles.modalFooter}>
              <Text style={styles.modalFooterText}>
                Son Güncelleme Tarihi: 8 Ekim 2025{'\n'}
                Yürürlük Tarihi: 8 Ekim 2025{'\n'}
                Versiyon: 1.0{'\n\n'}
                Bu Kullanıcı Sözleşmesi, Platform'a kayıt olan veya Platform'u kullanan her kullanıcı
                tarafından kabul edilmiş sayılır.
              </Text>
            </View>
          </ScrollView>

          {/* MODAL FOOTER BUTTON */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => {
                setAgreedToTerms(true);
                setShowTermsModal(false);
              }}
            >
              <Text style={styles.acceptButtonText}>Anladım ve Kabul Ediyorum</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },

  // LOGO STYLES
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    padding: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4f7aef',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  // CARD STYLES
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
  },

  // INPUT STYLES
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeButton: {
    padding: 14,
  },
  eyeIcon: {
    fontSize: 20,
  },

  // CHECKBOX STYLES
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4f7aef',
    borderColor: '#4f7aef',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  termsLink: {
    color: '#4f7aef',
    fontWeight: '600',
  },

  // BUTTON STYLES
  loginButton: {
    backgroundColor: '#6b93f4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4f7aef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  link: {
    fontSize: 14,
    color: '#4f7aef',
    fontWeight: '600',
  },

  // FOOTER
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 12,
    color: '#4f7aef',
    fontWeight: '600',
  },

  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    paddingRight: 10,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#64748b',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderLeftColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  dangerBox: {
    backgroundColor: '#fee2e2',
    borderLeftColor: '#ef4444',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  dangerText: {
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 20,
  },
  modalFooter: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalFooterText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  modalButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  acceptButton: {
    backgroundColor: '#6b93f4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#4f7aef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});