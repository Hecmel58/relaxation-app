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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (text: string) => {
    const value = text.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleResetPassword = async () => {
    if (!phone) {
      Alert.alert('Hata', 'Lütfen telefon numaranızı giriniz');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Hata', 'Telefon numarası 10 haneli olmalıdır');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Şifre sıfırlama talebi gönderiliyor...', phone);

      const response = await api.post('/auth/request-password-reset', {
        phone: phone,
      });

      console.log('✅ Şifre sıfırlama response:', response.data);

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);

      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 404 || errorData?.message?.includes('bulunamadı')) {
        Alert.alert('Kayıt Bulunamadı', 'Bu telefon numarası ile kayıtlı kullanıcı bulunamadı');
      } else {
        const errorMessage =
          errorData?.error || errorData?.message || error.message || 'Bir hata oluştu';

        Alert.alert('Hata', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
          </View>
          <Text style={styles.successTitle}>Talep Alındı!</Text>
          <Text style={styles.successText}>
            Şifre sıfırlama talebiniz başarıyla alındı.{'\n\n'}
            Admin onayından sonra yeni şifreniz tarafınıza iletilecektir.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backButtonText}>Giriş Sayfasına Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* GERİ BUTONU */}
          <TouchableOpacity
            style={styles.backButtonTop}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>

          {/* LOGO & BAŞLIK */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Kayıtlı telefon numaranızı girin, şifre sıfırlama talebinizi yöneticiye ileteceğiz
          </Text>

          {/* FORM KARTI */}
          <View style={styles.card}>
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

            <TouchableOpacity
              style={[styles.resetButton, loading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.resetButtonText}>Şifre Sıfırlama Talebi Gönder</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* BİLGİLENDİRME KARTI */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Bilgilendirme</Text>
              <Text style={styles.infoText}>
                • Kayıtlı telefon numaranızı girmelisiniz{'\n'}
                • Talebiniz yöneticiye iletilecektir{'\n'}
                • Onay sonrası yeni şifreniz e-postanıza gönderilir{'\n'}
                • Kayıtlı olmayan numaralar kabul edilmez
              </Text>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© Telif Hakkı 2025, Tüm Hakları Saklıdır</Text>
            <Text style={styles.footerLink}>Hecmel Tarafından Hazırlanmıştır</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  // GERİ BUTONU
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#4f7aef',
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4f7aef',
    fontWeight: '600',
  },

  // LOGO STYLES
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    padding: 16,
    borderWidth: 3,
    borderColor: '#4f7aef',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // CARD STYLES
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  resetButton: {
    backgroundColor: '#6b93f4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#4f7aef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // BİLGİ KARTI
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#4f7aef',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
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

  // BAŞARI EKRANI
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconWrapper: {
    marginBottom: 24,
  },
  successIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  successIconText: {
    fontSize: 64,
    color: '#10b981',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#6b93f4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#4f7aef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});