import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useOfflineStore } from '../../store/offlineStore';
import { colors } from '../../utils/colors';
import SkeletonLoader from '../../components/SkeletonLoader';
import Toast from '../../components/Toast';
import api from '../../services/api';

const AVATAR_OPTIONS = [
  { id: 'man', emoji: '👨', label: 'Erkek' },
  { id: 'woman', emoji: '👩', label: 'Kadın' },
  { id: 'man_beard', emoji: '🧔', label: 'Sakallı Erkek' },
  { id: 'woman_curly', emoji: '👩‍🦱', label: 'Kıvırcık Saçlı Kadın' },
  { id: 'person', emoji: '🧑', label: 'Kişi' },
  { id: 'older_man', emoji: '👴', label: 'Yaşlı Erkek' },
  { id: 'older_woman', emoji: '👵', label: 'Yaşlı Kadın' },
];

// ✅ KULLANICI SÖZLEŞMESİ HTML İÇERİĞİ
const TERMS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; line-height: 1.6; color: #1e293b; }
    h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #0f172a; }
    h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: #334155; }
    p { margin-bottom: 12px; }
    ul { margin-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 8px; }
    .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 8px; }
    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px; }
    .danger-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; border-radius: 8px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Kullanıcı Sözleşmesi ve Kullanım Koşulları</h1>

  <h2>1. Taraflar ve Tanımlar</h2>
  <p>İşbu Kullanıcı Sözleşmesi ("Sözleşme"), FidBal Uyku ve Stres Yönetimi platformu ("Platform") ve Platform'u kullanan gerçek veya tüzel kişiler ("Kullanıcı") arasında elektronik ortamda akdedilmiştir.</p>
  <div class="info-box">
    <strong>Platform Sahibi Bilgileri:</strong><br>
    Ad Soyad: Hasan Balkaya<br>
    E-posta: Hecmel@fidbal.com
  </div>

  <h2>2. Sözleşmenin Konusu</h2>
  <p>İşbu Sözleşme, Platform'un sunduğu hizmetlerin Kullanıcı tarafından kullanımına ilişkin tarafların hak ve yükümlülüklerini düzenlemektedir. Platform, akademik bir tez çalışması kapsamında ücretsiz olarak sunulmakta olup, uyku takibi, stres yönetimi, rahatlama teknikleri ve ilgili sağlık hizmetlerini içermektedir.</p>

  <h2>3. Hizmetin Kapsamı</h2>
  <p>Platform aşağıdaki hizmetleri sunmaktadır:</p>
  <ul>
    <li>Uyku kalitesi takibi ve analizi</li>
    <li>Kalp atım hızı izleme</li>
    <li>Stres seviyesi değerlendirmesi</li>
    <li>Rahatlama sesleri ve meditasyon teknikleri</li>
    <li>Binaural sesler ile zihinsel rahatlama</li>
    <li>Kişiselleştirilmiş raporlama ve öneriler</li>
    <li>Uzman desteği ve danışmanlık</li>
  </ul>

  <h2>4. Kullanıcı Yükümlülükleri</h2>
  <p>Kullanıcı, Platform'u kullanırken:</p>
  <ul>
    <li>Doğru, güncel ve eksiksiz bilgi sağlamakla yükümlüdür</li>
    <li>Hesap güvenliğini sağlamak ve şifresini gizli tutmakla sorumludur</li>
    <li>Platform'u yasalara uygun ve etik kurallara uygun şekilde kullanacağını kabul eder</li>
    <li>Platform'un teknik altyapısına zarar verecek davranışlardan kaçınacağını taahhüt eder</li>
    <li>Diğer kullanıcıların haklarına saygı gösterecektir</li>
    <li>Ticari amaçla kullanmayacağını kabul eder</li>
    <li>Platform içeriğini izinsiz kopyalamayacak, çoğaltmayacak veya dağıtmayacaktır</li>
  </ul>

  <h2>5. Fikri Mülkiyet Hakları</h2>
  <p>Platform'daki tüm içerik, tasarım, yazılım, kod, logo, metin, görsel, ses dosyaları ve diğer tüm materyaller Hasan Balkaya'ya aittir ve telif hakkı, ticari marka, patent ve diğer fikri mülkiyet hakları ile korunmaktadır. Kullanıcı, Platform'daki hiçbir içeriği ticari amaçla kullanamaz, kopyalayamaz, değiştiremez veya dağıtamaz.</p>
  <div class="warning-box">
    <strong>⚠️ Önemli Uyarı:</strong><br>
    Bu platform, akademik bir tez çalışması kapsamında geliştirilmiştir. Tüm hakları saklıdır. İzinsiz kullanım, kopyalama veya dağıtım yasal işlem gerektirir.
  </div>

  <h2>6. Hizmetin Ücretsiz Olması</h2>
  <p>Platform, akademik bir tez çalışması kapsamında geliştirilmiş olup, şu anda tamamen ücretsiz olarak sunulmaktadır. Ancak, gelecekte belirli hizmetler için ücretlendirme yapılması durumunda, kullanıcılar önceden bilgilendirilecek ve onayları alınacaktır.</p>

  <h2>7. Sorumluluk Reddi ve Garanti</h2>
  <div class="danger-box">
    <strong>🚨 ÖNEMLİ SAĞLIK UYARISI:</strong><br>
    • Platform, tıbbi teşhis veya tedavi amacı taşımamaktadır<br>
    • Platform'da sunulan bilgiler, profesyonel tıbbi tavsiye yerine geçmez<br>
    • Sağlık sorunları için mutlaka bir sağlık uzmanına başvurulmalıdır<br>
    • Platform'un kullanımından kaynaklanan herhangi bir sağlık sorunundan Platform sahibi sorumlu tutulamaz<br>
    • Acil durumlarda 112'yi arayın
  </div>
  <p>Platform "olduğu gibi" sunulmaktadır. Platform sahibi, hizmetin kesintisiz, hatasız veya güvenli olacağına dair hiçbir garanti vermemektedir.</p>

  <h2>8. Gizlilik ve Veri Koruma</h2>
  <p>Kullanıcı verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat kapsamında işlenmekte ve korunmaktadır. Kullanıcılar, kişisel verilerinin toplanması, işlenmesi ve saklanmasına açıkça rıza göstermiş sayılır.</p>

  <h2>9. Hesap İptali ve Askıya Alma</h2>
  <p>Platform sahibi, aşağıdaki durumlarda Kullanıcı hesabını askıya alabilir veya silebilir:</p>
  <ul>
    <li>Sözleşme hükümlerinin ihlali</li>
    <li>Yanlış veya yanıltıcı bilgi sağlanması</li>
    <li>Platform'a zarar verecek faaliyetler</li>
    <li>Diğer kullanıcıların haklarının ihlali</li>
    <li>Yasadışı faaliyetler</li>
  </ul>
  <p>Kullanıcı, KVKK kapsamındaki haklarını kullanarak hesabını istediği zaman silebilir.</p>

  <h2>10. Hizmet Değişiklikleri ve Sonlandırma</h2>
  <p>Platform sahibi, önceden bildirimde bulunarak veya bulunmaksızın, Platform'un tamamını veya bir kısmını geçici veya kalıcı olarak değiştirme, askıya alma veya sonlandırma hakkını saklı tutar. Bu durumlardan dolayı Platform sahibinin herhangi bir sorumluluğu bulunmamaktadır.</p>

  <h2>11. Sözleşme Değişiklikleri</h2>
  <p>Platform sahibi, işbu Sözleşme'yi dilediği zaman değiştirme hakkını saklı tutar. Değişiklikler Platform üzerinden duyurulacak ve yürürlük tarihinden itibaren geçerli olacaktır. Kullanıcı, Platform'u kullanmaya devam ederek değişiklikleri kabul etmiş sayılır.</p>

  <h2>12. Uyuşmazlık Çözümü</h2>
  <p>İşbu Sözleşme'nin uygulanmasından veya yorumlanmasından doğabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti yasaları uygulanır. Uyuşmazlıkların çözümünde <strong>Sivas Mahkemeleri ve İcra Daireleri</strong> yetkilidir.</p>

  <h2>13. Yürürlük</h2>
  <p>İşbu Sözleşme, Kullanıcı'nın Platform'a kayıt olması veya Platform'u kullanmaya başlaması ile yürürlüğe girer ve Kullanıcı'nın hesabını silmesi veya Platform tarafından hesabın kapatılması ile sona erer.</p>

  <h2>14. İletişim</h2>
  <p>Sözleşme ile ilgili sorularınız veya talepleriniz için aşağıdaki iletişim kanallarını kullanabilirsiniz:</p>
  <div class="info-box">
    E-posta: Hecmel@fidbal.com
  </div>

  <h2>15. Mücbir Sebepler</h2>
  <p>Doğal afetler, savaş, terör, grev, internet altyapı arızaları, siber saldırılar veya Platform sahibinin kontrolü dışındaki diğer olaylar nedeniyle hizmetin sunulamamasından Platform sahibi sorumlu tutulamaz.</p>

  <h2>16. Delil Sözleşmesi</h2>
  <p>Taraflar, işbu Sözleşme'den doğabilecek ihtilaflarda Platform'un elektronik kayıtlarının, bilgisayar ve sunucu kayıtlarının, e-posta kayıtlarının geçerli, bağlayıcı, kesin ve münhasır delil teşkil edeceğini ve bu maddenin HMK m. 193 anlamında delil sözleşmesi niteliğinde olduğunu kabul eder.</p>

  <div class="footer">
    <strong>Son Güncelleme Tarihi:</strong> 8 Ekim 2025<br>
    <strong>Yürürlük Tarihi:</strong> 8 Ekim 2025<br>
    <strong>Versiyon:</strong> 1.0<br><br>
    Bu Kullanıcı Sözleşmesi, Platform'a kayıt olan veya Platform'u kullanan her kullanıcı tarafından kabul edilmiş sayılır.
  </div>
</body>
</html>
`;

export default function ProfileScreen() {
  const isDark = useThemeStore((state) => state.isDark);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const { user, logout } = useAuthStore();
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'man');

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Haptics.notificationAsync(
      type === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
  };

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Avatar Değiştir
  const handleAvatarChange = async (avatarId: string) => {
    try {
      setSelectedAvatar(avatarId);
      showToast('Profil resmi güncellendi', 'success');
      setShowAvatarModal(false);
    } catch (error) {
      console.error('Avatar update error:', error);
      showToast('Profil resmi güncellenemedi', 'error');
    }
  };

  // ✅ DÜZELTİLDİ: Verileri İndir
  const handleDownloadData = async () => {
    if (!isOnline) {
      showToast('Verileri indirmek için internet bağlantısı gerekli', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDownloading(true);

    try {
      const response = await api.get('/user/data/download');

      const filename = `fidbal-verilerim-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(response.data, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        showToast('Verileriniz başarıyla indirildi!', 'success');
      } else {
        showToast('Dosya paylaşımı bu cihazda desteklenmiyor', 'error');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      showToast('Veri indirme sırasında hata oluştu', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Hesabı Sil
  const handleDeleteAccount = () => {
    if (!isOnline) {
      showToast('Hesap silmek için internet bağlantısı gerekli', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      '⚠️ UYARI',
      'Hesabınız ve TÜM verileriniz kalıcı olarak silinecektir. Bu işlem GERİ ALINAMAZ!\n\nDevam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Devam Et',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.prompt(
      'SON UYARI',
      "Hesabınızı silmek için 'SİL' yazın:",
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async (text) => {
            if (text === 'SİL') {
              await executeDeleteAccount();
            } else {
              showToast('İptal edildi', 'info');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const executeDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await api.delete('/user/account');
      if (response.data.success) {
        showToast('Hesabınız başarıyla silindi. Güle güle!', 'success');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Hesap silme başarısız');
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      showToast(error.response?.data?.error || 'Hesap silme sırasında hata oluştu', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // İletişim
  const handleContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: 'Öneri ve şikayetleriniz için: Hecmel@fidbal.com',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Çıkış Yap
  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
      <Toast message={toastMessage} type={toastType} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: currentColors.warning }]}>
          <Text style={styles.offlineBannerText}>📡 Offline Mod</Text>
        </View>
      )}

      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <Text style={[styles.headerTitle, { color: currentColors.primary }]}>Profil</Text>
        <Text style={[styles.headerSubtitle, { color: currentColors.secondary }]}>Hesap bilgileriniz ve ayarlarınız</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR & KULLANICI BİLGİLERİ */}
        <View style={[styles.profileCard, { backgroundColor: currentColors.card }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowAvatarModal(true)}>
            <Text style={styles.avatarEmoji}>{currentAvatar.emoji}</Text>
            <View style={[styles.editBadge, { backgroundColor: currentColors.brand }]}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: currentColors.primary }]}>{user?.name || 'Kullanıcı'}</Text>
          <Text style={[styles.userPhone, { color: currentColors.secondary }]}>{user?.phone}</Text>

          {user?.email && <Text style={[styles.userEmail, { color: currentColors.tertiary }]}>{user.email}</Text>}

          <View style={[styles.groupBadge, { backgroundColor: user?.abGroup === 'experiment' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
            <Text style={[styles.groupBadgeText, { color: user?.abGroup === 'experiment' ? currentColors.warning : currentColors.info }]}>
              {user?.abGroup === 'experiment' ? '🧪 Deney Grubu' : '📊 Kontrol Grubu'}
            </Text>
          </View>
        </View>

        {/* KVKK BÖLÜMÜ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>📋 Kişisel Verilerim (KVKK)</Text>
          <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe', borderLeftColor: currentColors.info }]}>
            <Text style={[styles.infoText, { color: isDark ? '#93c5fd' : '#1e3a8a' }]}>
              6698 sayılı KVKK kapsamında kişisel verilerinizi indirebilir veya hesabınızı silebilirsiniz.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentColors.info }, downloading && { opacity: 0.7 }]}
            onPress={handleDownloadData}
            disabled={downloading || !isOnline}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>📥</Text>
                <Text style={styles.actionButtonText}>Verilerimi İndir (JSON)</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentColors.error }, deleting && { opacity: 0.7 }]}
            onPress={handleDeleteAccount}
            disabled={deleting || !isOnline}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>🗑️</Text>
                <Text style={styles.actionButtonText}>Hesabımı Kalıcı Olarak Sil</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* YASAL BELGELER */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>📄 Yasal Belgeler</Text>

          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}
            onPress={() => setShowTermsModal(true)}
          >
            <Text style={[styles.linkButtonText, { color: currentColors.primary }]}>Kullanıcı Sözleşmesi</Text>
            <Text style={[styles.linkButtonIcon, { color: currentColors.tertiary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}
            onPress={() => setShowPrivacyModal(true)}
          >
            <Text style={[styles.linkButtonText, { color: currentColors.primary }]}>Gizlilik Politikası & KVKK</Text>
            <Text style={[styles.linkButtonIcon, { color: currentColors.tertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* İLETİŞİM */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>💬 Öneri ve Şikayetler</Text>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5', borderLeftColor: currentColors.success }]}
            onPress={handleContact}
          >
            <Text style={[styles.contactIcon]}>✉️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactTitle, { color: isDark ? '#6ee7b7' : '#065f46' }]}>İletişim</Text>
              <Text style={[styles.contactText, { color: isDark ? '#a7f3d0' : '#047857' }]}>Hecmel@fidbal.com</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ÇIKIŞ YAP */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: currentColors.error }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: currentColors.tertiary }]}>
            © 2025 FidBal - Tüm Hakları Saklıdır
          </Text>
          <Text style={[styles.footerText, { color: currentColors.tertiary }]}>
            Hecmel Tarafından Hazırlanmıştır
          </Text>
        </View>
      </ScrollView>

      {/* ✅ DÜZELTİLDİ: AVATAR SEÇİM MODAL (Arka Plan Rengi Eklendi) */}
      <Modal visible={showAvatarModal} animationType="slide" transparent onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.avatarModalCard, { backgroundColor: currentColors.card }]}>
            <Text style={[styles.avatarModalTitle, { color: currentColors.primary }]}>Profil Resmini Seç</Text>
            <ScrollView style={styles.avatarGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarGridInner}>
                {AVATAR_OPTIONS.map((avatar) => (
                  <TouchableOpacity
                    key={avatar.id}
                    style={[
                      styles.avatarOption,
                      { borderColor: currentColors.border },
                      selectedAvatar === avatar.id && { backgroundColor: currentColors.brand, borderColor: currentColors.brand },
                    ]}
                    onPress={() => handleAvatarChange(avatar.id)}
                  >
                    <Text style={styles.avatarOptionEmoji}>{avatar.emoji}</Text>
                    <Text style={[styles.avatarOptionLabel, { color: selectedAvatar === avatar.id ? '#fff' : currentColors.secondary }]}>
                      {avatar.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: currentColors.border }]}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={[styles.closeModalButtonText, { color: currentColors.primary }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ DÜZELTİLDİ: KULLANICI SÖZLEŞMESİ MODAL (HTML İçerik) */}
      <Modal visible={showTermsModal} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowTermsModal(false)}>
        <View style={[styles.webViewModalContainer, { backgroundColor: currentColors.background }]}>
          <View
            style={[
              styles.webViewHeader,
              {
                backgroundColor: currentColors.surface,
                borderBottomColor: currentColors.border,
                paddingTop: Platform.OS === 'ios' ? insets.top : 16,
              },
            ]}
          >
            <Text style={[styles.webViewTitle, { color: currentColors.primary }]}>Kullanıcı Sözleşmesi</Text>
            <TouchableOpacity style={[styles.webViewCloseButton, { backgroundColor: currentColors.error }]} onPress={() => setShowTermsModal(false)}>
              <Text style={styles.webViewCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: TERMS_HTML }}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            contentInset={{ top: 0, bottom: insets.bottom }}
          />
        </View>
      </Modal>

      {/* GİZLİLİK POLİTİKASI MODAL */}
      <Modal visible={showPrivacyModal} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowPrivacyModal(false)}>
        <View style={[styles.webViewModalContainer, { backgroundColor: currentColors.background }]}>
          <View
            style={[
              styles.webViewHeader,
              {
                backgroundColor: currentColors.surface,
                borderBottomColor: currentColors.border,
                paddingTop: Platform.OS === 'ios' ? insets.top : 16,
              },
            ]}
          >
            <Text style={[styles.webViewTitle, { color: currentColors.primary }]}>Gizlilik Politikası & KVKK</Text>
            <TouchableOpacity style={[styles.webViewCloseButton, { backgroundColor: currentColors.error }]} onPress={() => setShowPrivacyModal(false)}>
              <Text style={styles.webViewCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: 'https://fidbal.com/privacy-policy' }}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            contentInset={{ top: 0, bottom: insets.bottom }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  offlineBanner: { padding: 8, alignItems: 'center' },
  offlineBannerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  content: { flex: 1 },
  profileCard: { margin: 16, borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarEmoji: { fontSize: 80 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  editBadgeText: { fontSize: 16 },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  userPhone: { fontSize: 15, marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 12 },
  groupBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 8 },
  groupBadgeText: { fontSize: 13, fontWeight: '600' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  infoBox: { padding: 12, borderRadius: 8, borderLeftWidth: 4, marginBottom: 16 },
  infoText: { fontSize: 13, lineHeight: 18 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  actionButtonIcon: { fontSize: 20, marginRight: 8 },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  linkButtonText: { fontSize: 15, fontWeight: '600' },
  linkButtonIcon: { fontSize: 24 },
  contactCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderLeftWidth: 4 },
  contactIcon: { fontSize: 32, marginRight: 12 },
  contactTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  contactText: { fontSize: 14 },
  logoutButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', padding: 24 },
  footerText: { fontSize: 12, marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  avatarModalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  avatarModalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  avatarGrid: { flex: 1 },
  avatarGridInner: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 },
  avatarOption: { width: '30%', aspectRatio: 1, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarOptionEmoji: { fontSize: 40, marginBottom: 4 },
  avatarOptionLabel: { fontSize: 10, textAlign: 'center' },
  closeModalButton: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  closeModalButtonText: { fontSize: 15, fontWeight: '600' },
  webViewModalContainer: { flex: 1 },
  webViewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  webViewTitle: { fontSize: 18, fontWeight: 'bold' },
  webViewCloseButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  webViewCloseButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  webView: { flex: 1 },
});