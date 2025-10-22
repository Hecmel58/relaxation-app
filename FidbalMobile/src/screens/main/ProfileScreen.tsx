import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const TERMS_OF_SERVICE = `FidBal Kullanıcı Sözleşmesi

1. TARAFLAR VE TANIMLAR
Platform Sahibi: Hasan Balkaya
Telefon: 0539 487 00 58
E-posta: ecmelazizoglu@gmail.com

2. HİZMETİN KAPSAMI
Platform, akademik bir tez çalışması kapsamında ücretsiz olarak sunulmaktadır.

3. SORUMLULUK REDDİ
🚨 ÖNEMLİ: Platform tıbbi teşhis veya tedavi amacı taşımamaktadır.

4. İLETİŞİM
ecmelazizoglu@gmail.com
0539 487 00 58`;

const PRIVACY_POLICY = `Gizlilik Politikası

FidBal olarak gizliliğinize önem veriyoruz.

1. TOPLANAN BİLGİLER
- Hesap bilgileri
- Uyku ve sağlık verileri
- Kullanım verileri

2. GÜVENLİK
Verileriniz şifrelenerek saklanır.

İletişim: ecmelazizoglu@gmail.com`;

const KVKK_TEXT = `KVKK Aydınlatma Metni

1. VERİ SORUMLUSU
Hasan Balkaya
E-posta: ecmelazizoglu@gmail.com

2. İŞLENEN KİŞİSEL VERİLER
- Kimlik Bilgileri
- Sağlık Verileri
- Platform Kullanım Verileri

3. HAKLARINIZ
- Verilerinize erişim hakkı
- Düzeltme talep etme hakkı
- Silme talep etme hakkı

İletişim: ecmelazizoglu@gmail.com`;

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDocument, setShowDocument] = useState<{visible: boolean, title: string, content: string}>({
    visible: false,
    title: '',
    content: ''
  });

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const handleDownloadData = async () => {
    if (!user?.userId && !user?.id) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    setExportLoading(true);
    try {
      console.log('📥 Veriler indiriliyor...');
      const response = await api.get('/user/data/download', {
        responseType: 'blob'
      });

      const fileName = `FidBal_Verilerim_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Blob'u string'e çevir
      const reader = new FileReader();
      reader.onloadend = async () => {
        const jsonData = reader.result as string;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Verilerinizi Kaydedin'
          });
          Alert.alert('✅ Başarılı', 'Verileriniz başarıyla indirildi!');
        } else {
          Alert.alert('✅ Veriler Hazır', `Verileriniz ${fileName} dosyasına kaydedildi.`);
        }
      };
      reader.readAsText(response.data);

      console.log('✅ Veriler başarıyla indirildi');
    } catch (error: any) {
      console.error('❌ Data export error:', error);
      Alert.alert('Hata', 'Veriler indirilemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Hesap Silme',
      'Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem:\n• Tüm uyku kayıtlarınızı\n• Tüm mesajlarınızı\n• Tüm form yanıtlarınızı\nkalıcı olarak silecektir.\n\nBu işlem GERİ ALINAMAZ!',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '🚨 Son Uyarı',
              'Bu işlem geri alınamaz! Devam etmek istediğinize EMİN MİSİNİZ?',
              [
                { text: 'İptal', style: 'cancel' },
                {
                  text: 'Evet, Kesinlikle Sil',
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      console.log('🗑️ Hesap siliniyor...');
                      const response = await api.delete('/user/account');

                      if (response.data.success) {
                        Alert.alert(
                          '✅ Hesap Silindi',
                          'Hesabınız ve tüm verileriniz kalıcı olarak silindi.',
                          [{
                            text: 'Tamam',
                            onPress: () => logout()
                          }]
                        );
                      } else {
                        throw new Error(response.data.error || 'Hesap silme başarısız');
                      }
                    } catch (error: any) {
                      console.error('❌ Delete account error:', error);
                      Alert.alert('Hata', 'Hesap silinemedi: ' + (error.response?.data?.error || error.message));
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const openDocument = (type: 'terms' | 'kvkk' | 'privacy') => {
    const docs = {
      terms: { title: 'Kullanıcı Sözleşmesi', content: TERMS_OF_SERVICE },
      kvkk: { title: 'KVKK Aydınlatma Metni', content: KVKK_TEXT },
      privacy: { title: 'Gizlilik Politikası', content: PRIVACY_POLICY }
    };

    setShowDocument({
      visible: true,
      title: docs[type].title,
      content: docs[type].content
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Kullanıcı Kartı */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
          <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          {user?.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}
          {(user?.isAdmin || user?.is_admin) && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>👑 Admin</Text>
            </View>
          )}
          {(user?.abGroup === 'experiment' || user?.ab_group === 'experiment') && (
            <View style={styles.experimentBadge}>
              <Text style={styles.experimentBadgeText}>🧪 Beta Kullanıcı</Text>
            </View>
          )}
        </View>

        {/* Hesap Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap Ayarları</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDownloadData}
            disabled={exportLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📥</Text>
            <Text style={styles.menuText}>Verilerimi İndir</Text>
            {exportLoading && <ActivityIndicator size="small" color="#3b82f6" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeleteAccount}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🗑️</Text>
            <Text style={[styles.menuText, styles.dangerText]}>Hesabımı Sil</Text>
            {loading && <ActivityIndicator size="small" color="#ef4444" />}
          </TouchableOpacity>
        </View>

        {/* Hukuki Belgeler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hukuki Belgeler</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openDocument('terms')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>Kullanıcı Sözleşmesi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openDocument('kvkk')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>KVKK Aydınlatma Metni</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openDocument('privacy')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuText}>Gizlilik Politikası</Text>
          </TouchableOpacity>
        </View>

        {/* Uygulama Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Versiyon</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>İletişim</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:ecmelazizoglu@gmail.com')}>
              <Text style={[styles.infoValue, styles.linkText]}>ecmelazizoglu@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Çıkış Yap Butonu */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 FidBal</Text>
          <Text style={styles.footerSubtext}>Uyku ve Stres Yönetimi</Text>
        </View>
      </ScrollView>

      {/* Document Modal */}
      <Modal
        visible={showDocument.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDocument({visible: false, title: '', content: ''})}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{showDocument.title}</Text>
            <TouchableOpacity
              onPress={() => setShowDocument({visible: false, title: '', content: ''})}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{ paddingBottom: insets.bottom }}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.modalText}>{showDocument.content}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  content: { flex: 1 },
  userCard: { backgroundColor: '#fff', alignItems: 'center', padding: 32, marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 42, color: '#fff', fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  userPhone: { fontSize: 16, color: '#64748b', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#94a3b8' },
  adminBadge: { backgroundColor: '#fbbf24', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, marginTop: 12 },
  adminBadgeText: { fontSize: 14, fontWeight: '600', color: '#78350f' },
  experimentBadge: { backgroundColor: '#a78bfa', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, marginTop: 8 },
  experimentBadgeText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  section: { backgroundColor: '#fff', marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#f8fafc' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuIcon: { fontSize: 24, marginRight: 16, width: 32 },
  menuText: { flex: 1, fontSize: 16, color: '#0f172a', fontWeight: '500' },
  dangerText: { color: '#ef4444' },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 16, color: '#64748b' },
  infoValue: { fontSize: 16, color: '#0f172a', fontWeight: '500' },
  linkText: { color: '#3b82f6', textDecorationLine: 'underline' },
  logoutButton: { backgroundColor: '#ef4444', marginHorizontal: 16, marginVertical: 16, padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  logoutButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  footer: { alignItems: 'center', padding: 32, paddingBottom: 40 },
  footerText: { fontSize: 14, color: '#64748b', marginBottom: 4, fontWeight: '600' },
  footerSubtext: { fontSize: 12, color: '#94a3b8' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', flex: 1 },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 28, color: '#64748b' },
  modalContent: { flex: 1, padding: 20 },
  modalText: { fontSize: 14, color: '#475569', lineHeight: 22 },
});