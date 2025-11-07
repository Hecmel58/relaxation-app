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
import { WebView } from 'react-native-webview';
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
  const [agreedToKVKK, setAgreedToKVKK] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showKVKKModal, setShowKVKKModal] = useState(false);

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

    if (!agreedToTerms || !agreedToKVKK) {
      Alert.alert('Hata', 'Kullanıcı sözleşmesi ve KVKK aydınlatma metnini onaylamanız gerekmektedir');
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
                    {'Kontrol\nGrubu'}
                  </Text>
                  <Text
                    style={[
                      styles.groupButtonSubtitle,
                      formData.abGroup === 'control' && styles.groupButtonSubtitleActive,
                    ]}
                  >
                    Standart
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
                    {'Deney\nGrubu'}
                  </Text>
                  <Text
                    style={[
                      styles.groupButtonSubtitle,
                      formData.abGroup === 'experiment' && styles.groupButtonSubtitleActive,
                    ]}
                  >
                    Gelişmiş
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
                    formData.password.length >= 8
                      ? styles.requirementMet
                      : styles.requirementUnmet
                  }
                >
                  {formData.password.length >= 8 ? '✓' : '○'}
                </Text>
                <Text
                  style={
                    formData.password.length >= 8
                      ? styles.requirementTextMet
                      : styles.requirementText
                  }
                >
                  En az 8 karakter
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Text
                  style={
                    /[a-z]/.test(formData.password)
                      ? styles.requirementMet
                      : styles.requirementUnmet
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
                  En az bir küçük harf
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Text
                  style={
                    /[A-Z]/.test(formData.password)
                      ? styles.requirementMet
                      : styles.requirementUnmet
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
                  En az bir büyük harf
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
                    /\d/.test(formData.password)
                      ? styles.requirementTextMet
                      : styles.requirementText
                  }
                >
                  En az bir rakam
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
                  En az bir özel karakter (@$!%*?&)
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

            {/* KULLANICI SÖZLEŞMESİ CHECKBOX */}
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

            {/* KVKK CHECKBOX */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreedToKVKK(!agreedToKVKK)}
              disabled={loading}
            >
              <View style={[styles.checkbox, agreedToKVKK && styles.checkboxChecked]}>
                {agreedToKVKK && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  <Text
                    style={styles.termsLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowKVKKModal(true);
                    }}
                  >
                    KVKK aydınlatma metnini
                  </Text>
                  {' okudum ve onaylıyorum'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* KAYIT OL BUTONU */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (loading || !agreedToTerms || !agreedToKVKK) && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading || !agreedToTerms || !agreedToKVKK}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            {/* GİRİŞ YAPIN LİNKİ */}
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

      {/* KULLANICI SÖZLEŞMESİ MODAL - WebView */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kullanıcı Sözleşmesi</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <WebView
            source={{ uri: 'https://www.fidbal.com/terms' }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f7aef" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            )}
          />

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

      {/* KVKK AYDINLATMA METNİ MODAL - WebView */}
      <Modal
        visible={showKVKKModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowKVKKModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>KVKK Aydınlatma Metni</Text>
            <TouchableOpacity onPress={() => setShowKVKKModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <WebView
            source={{ uri: 'https://www.fidbal.com/privacy-policy' }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f7aef" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            )}
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => {
                setAgreedToKVKK(true);
                setShowKVKKModal(false);
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
  // GENEL CONTAINER
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

  // LOGO & BAŞLIK
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

  // KART
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
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  groupButtonTitleActive: {
    color: '#1e293b',
  },
  groupButtonSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  groupButtonSubtitleActive: {
    color: '#64748b',
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
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
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
