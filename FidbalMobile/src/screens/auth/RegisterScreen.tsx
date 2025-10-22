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

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    abGroup: 'control' as 'control' | 'experiment',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handlePhoneChange = (text: string) => {
    const value = text.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData({ ...formData, phone: value });
    }
  };

  const validatePassword = (password: string) => {
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

  const handleRegister = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı ve soyadınızı giriniz');
      return;
    }

    if (!formData.phone || formData.phone.length !== 10) {
      Alert.alert('Hata', 'Telefon numarası 10 haneli olmalıdır');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      Alert.alert('Şifre Hatası', passwordError);
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Hata', 'Kullanıcı sözleşmesini kabul etmelisiniz');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Kayıt yapılıyor...', formData.phone);

      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        abGroup: formData.abGroup,
      });

      console.log('✅ Kayıt başarılı:', response.data);

      Alert.alert(
        'Kayıt Başarılı!',
        'Kaydınız alındı. Admin onayından sonra uygulamaya erişebileceksiniz. Onay sonrası giriş yapabilirsiniz.',
        [
          {
            text: 'Giriş Sayfasına Dön',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Register error:', error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.response?.data?.message ||
        'Kayıt işlemi başarısız oldu';

      Alert.alert('Kayıt Hatası', errorMessage);
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

          {/* KAYIT KARTI */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kayıt Ol</Text>

            {/* AD SOYAD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor="#94a3b8"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!loading}
                autoCapitalize="words"
              />
            </View>

            {/* TELEFON */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="5XX XXX XX XX"
                placeholderTextColor="#94a3b8"
                value={formData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>

            {/* E-POSTA */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta (Opsiyonel)</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor="#94a3b8"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                editable={!loading}
                autoCapitalize="none"
              />
            </View>

            {/* GRUP SEÇİMİ */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grup Seçimi</Text>
              <View style={styles.groupButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.groupButton,
                    formData.abGroup === 'control' && styles.groupButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, abGroup: 'control' })}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.groupButtonTitle,
                      formData.abGroup === 'control' && styles.groupButtonTitleActive,
                    ]}
                  >
                    Kontrol Grubu
                  </Text>
                  <Text
                    style={[
                      styles.groupButtonSubtitle,
                      formData.abGroup === 'control' && styles.groupButtonSubtitleActive,
                    ]}
                  >
                    Standart deneyim
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.groupButton,
                    formData.abGroup === 'experiment' && styles.groupButtonActiveExperiment,
                  ]}
                  onPress={() => setFormData({ ...formData, abGroup: 'experiment' })}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.groupButtonTitle,
                      formData.abGroup === 'experiment' && styles.groupButtonTitleActive,
                    ]}
                  >
                    Deney Grubu
                  </Text>
                  <Text
                    style={[
                      styles.groupButtonSubtitle,
                      formData.abGroup === 'experiment' && styles.groupButtonSubtitleActive,
                    ]}
                  >
                    Gelişmiş özellikler
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ŞİFRE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
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

            {/* ŞİFRE GEREKSİNİMLERİ */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Şifre Gereksinimleri:</Text>
              <View style={styles.requirementItem}>
                <Text
                  style={
                    formData.password.length >= 8 ? styles.requirementMet : styles.requirementUnmet
                  }
                >
                  {formData.password.length >= 8 ? '✓' : '○'}
                </Text>
                <Text
                  style={
                    formData.password.length >= 8 ? styles.requirementTextMet : styles.requirementText
                  }
                >
                  En az 8 karakter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text
                  style={
                    /[a-z]/.test(formData.password) ? styles.requirementMet : styles.requirementUnmet
                  }
                >
                  {/[a-z]/.test(formData.password) ? '✓' : '○'}
                </Text>
                <Text
                  style={
                    /[a-z]/.test(formData.password)
                      ? styles.requirementTextMet
                      : styles.requirementText
                  }
                >
                  En az 1 küçük harf (a-z)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text
                  style={
                    /[A-Z]/.test(formData.password) ? styles.requirementMet : styles.requirementUnmet
                  }
                >
                  {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                </Text>
                <Text
                  style={
                    /[A-Z]/.test(formData.password)
                      ? styles.requirementTextMet
                      : styles.requirementText
                  }
                >
                  En az 1 büyük harf (A-Z)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text
                  style={
                    /\d/.test(formData.password) ? styles.requirementMet : styles.requirementUnmet
                  }
                >
                  {/\d/.test(formData.password) ? '✓' : '○'}
                </Text>
                <Text
                  style={
                    /\d/.test(formData.password) ? styles.requirementTextMet : styles.requirementText
                  }
                >
                  En az 1 rakam (0-9)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text
                  style={
                    /[@$!%*?&]/.test(formData.password)
                      ? styles.requirementMet
                      : styles.requirementUnmet
                  }
                >
                  {/[@$!%*?&]/.test(formData.password) ? '✓' : '○'}
                </Text>
                <Text
                  style={
                    /[@$!%*?&]/.test(formData.password)
                      ? styles.requirementTextMet
                      : styles.requirementText
                  }
                >
                  En az 1 özel karakter (@$!%*?&)
                </Text>
              </View>
            </View>

            {/* ŞİFRE TEKRAR */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre Tekrar</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '🔒'}</Text>
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

            {/* KAYIT BUTONU */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (loading || !agreedToTerms) && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading || !agreedToTerms}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            {/* GİRİŞ LİNKİ */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                <Text style={styles.loginLink}>Giriş Yap</Text>
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

      {/* KULLANICI SÖZLEŞMESİ MODAL - DETAYLI TAM İÇERİK */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kullanıcı Sözleşmesi ve Kullanım Koşulları</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

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

  // GRUP SEÇİMİ STYLES
  groupButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  groupButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  groupButtonActive: {
    borderColor: '#6b93f4',
    backgroundColor: '#dbeafe',
  },
  groupButtonActiveExperiment: {
    borderColor: '#a855f7',
    backgroundColor: '#f3e8ff',
  },
  groupButtonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    textAlign: 'center',
  },
  groupButtonTitleActive: {
    color: '#1e293b',
  },
  groupButtonSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  groupButtonSubtitleActive: {
    color: '#334155',
  },

  // ŞİFRE GEREKSİNİMLERİ
  passwordRequirements: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  requirementUnmet: {
    color: '#94a3b8',
    fontSize: 14,
    marginRight: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#64748b',
  },
  requirementTextMet: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
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
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
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