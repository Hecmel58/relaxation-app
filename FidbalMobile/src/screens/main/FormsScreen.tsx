import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../store/themeStore';
import { useOfflineStore } from '../../store/offlineStore';
import { colors } from '../../utils/colors';
import SkeletonLoader from '../../components/SkeletonLoader';
import Toast from '../../components/Toast';
import api from '../../services/api';

interface FormType {
  id: number;
  title: string;
  description: string;
  google_form_url: string;
  is_active: boolean;
  is_filled: boolean;
  last_filled_at?: string;
  created_at: string;
}

export default function FormsScreen() {
  const isDark = useThemeStore((state) => state.isDark);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  const [forms, setForms] = useState<FormType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // WebView Modal
  const [showWebView, setShowWebView] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  useEffect(() => {
    loadForms();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Haptics.notificationAsync(
      type === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
  };

  const loadForms = async () => {
    try {
      if (!isOnline) {
        showToast('Offline modasınız. Formlar yüklenemedi.', 'warning');
        setLoading(false);
        return;
      }

      const response = await api.get('/forms/types');
      setForms(response.data || []);
    } catch (error: any) {
      console.error('❌ Load forms error:', error);
      showToast('Formlar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadForms();
  }, []);

  const handleOpenForm = async (form: FormType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isOnline) {
      showToast('Formu açmak için internet bağlantısı gerekli', 'error');
      return;
    }

    setSelectedForm(form);
    setShowWebView(true);
    setWebViewLoading(true);
  };

  const handleCloseWebView = async () => {
    setShowWebView(false);
    setSelectedForm(null);
    setWebViewLoading(true);

    // Form açıldı olarak işaretle
    if (selectedForm && isOnline) {
      try {
        await api.post('/forms/responses', {
          form_type_id: selectedForm.id,
          responses: { opened: true },
        });
        showToast('Form tamamlandı olarak işaretlendi', 'success');
        loadForms(); // Yenile
      } catch (error) {
        console.error('❌ Mark form as completed error:', error);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Stats
  const totalForms = forms.length;
  const completedForms = forms.filter((f) => f.is_filled).length;
  const pendingForms = totalForms - completedForms;

  // Skeleton Loading
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
          <SkeletonLoader width={150} height={28} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={200} height={16} />
        </View>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <SkeletonLoader width="32%" height={100} borderRadius={12} />
            <SkeletonLoader width="32%" height={100} borderRadius={12} />
            <SkeletonLoader width="32%" height={100} borderRadius={12} />
          </View>
          <SkeletonLoader width="100%" height={150} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={150} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
      <Toast message={toastMessage} type={toastType} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: currentColors.warning }]}>
          <Text style={styles.offlineBannerText}>📡 Offline Mod - Formlar kullanılamaz</Text>
        </View>
      )}

      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: currentColors.primary }]}>Formlar</Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.secondary }]}>Değerlendirme formları</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* İSTATİSTİKLER */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe' }]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: currentColors.info }]}>{totalForms}</Text>
            <Text style={[styles.statLabel, { color: currentColors.secondary }]}>Toplam</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5' }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={[styles.statValue, { color: currentColors.success }]}>{completedForms}</Text>
            <Text style={[styles.statLabel, { color: currentColors.secondary }]}>Tamamlanan</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7' }]}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={[styles.statValue, { color: currentColors.warning }]}>{pendingForms}</Text>
            <Text style={[styles.statLabel, { color: currentColors.secondary }]}>Bekleyen</Text>
          </View>
        </View>

        {/* FORMLAR */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>
            Mevcut Formlar {totalForms > 0 && `(${totalForms})`}
          </Text>

          {totalForms === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyTitle, { color: currentColors.primary }]}>Henüz form yok</Text>
              <Text style={[styles.emptyText, { color: currentColors.secondary }]}>Şu anda doldurulacak form bulunmuyor</Text>
            </View>
          ) : (
            forms.map((form) => (
              <View key={form.id} style={[styles.formCard, { backgroundColor: currentColors.card }]}>
                <View style={styles.formHeader}>
                  <Text style={styles.formIcon}>📋</Text>
                  {form.is_filled && (
                    <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5' }]}>
                      <Text style={[styles.statusText, { color: currentColors.success }]}>✓ Tamamlandı</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.formTitle, { color: currentColors.primary }]}>{form.title}</Text>
                <Text style={[styles.formDescription, { color: currentColors.secondary }]}>{form.description}</Text>

                {form.is_filled && form.last_filled_at && (
                  <Text style={[styles.formDate, { color: currentColors.tertiary }]}>
                    Son: {formatDate(form.last_filled_at)}
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.formButton,
                    {
                      backgroundColor: form.is_filled
                        ? isDark
                          ? 'rgba(71, 85, 105, 0.3)'
                          : '#e2e8f0'
                        : currentColors.brand,
                    },
                    !isOnline && { opacity: 0.5 },
                  ]}
                  onPress={() => handleOpenForm(form)}
                  disabled={!isOnline}
                >
                  <Text
                    style={[
                      styles.formButtonText,
                      {
                        color: form.is_filled ? currentColors.secondary : '#fff',
                      },
                    ]}
                  >
                    {form.is_filled ? '🔄 Tekrar Doldur' : '📝 Formu Aç'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* BİLGİ KARTI */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe', borderLeftColor: currentColors.info },
          ]}
        >
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Formlar Hakkında</Text>
            <Text style={[styles.infoText, { color: isDark ? '#93c5fd' : '#1e3a8a' }]}>
              Formlar uygulama içinde açılır. Doldurduğunuz formlar otomatik olarak kaydedilir ve burada işaretlenir.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* WEBVIEW MODAL - iOS SafeArea Düzeltmesi */}
      <Modal visible={showWebView} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCloseWebView}>
        <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
          {/* HEADER - SafeArea İÇİNDE */}
          <View
            style={[
              styles.webViewHeader,
              {
                backgroundColor: currentColors.surface,
                borderBottomColor: currentColors.border,
                paddingTop: Platform.OS === 'ios' ? insets.top : 0,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.webViewTitle, { color: currentColors.primary }]} numberOfLines={1}>
                {selectedForm?.title}
              </Text>
            </View>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: currentColors.error }]} onPress={handleCloseWebView}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* LOADING */}
          {webViewLoading && (
            <View style={styles.webViewLoadingContainer}>
              <ActivityIndicator size="large" color={currentColors.brand} />
              <Text style={[styles.webViewLoadingText, { color: currentColors.secondary }]}>Form yükleniyor...</Text>
            </View>
          )}

          {/* WEBVIEW - contentInset ile SafeArea */}
          {selectedForm && (
            <WebView
              source={{ uri: selectedForm.google_form_url }}
              style={styles.webView}
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => setWebViewLoading(false)}
              onError={() => {
                setWebViewLoading(false);
                showToast('Form yüklenemedi', 'error');
              }}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              contentInset={{ top: 0, bottom: insets.bottom }}
            />
          )}
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
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 10 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  emptyCard: { borderRadius: 12, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  formIcon: { fontSize: 32 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  formTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  formDescription: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  formDate: { fontSize: 12, marginBottom: 12 },
  formButton: { padding: 14, borderRadius: 8, alignItems: 'center' },
  formButtonText: { fontSize: 15, fontWeight: '600' },
  infoCard: { flexDirection: 'row', margin: 16, padding: 16, borderRadius: 12, borderLeftWidth: 4 },
  infoIcon: { fontSize: 28, marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 18 },
  modalContainer: { flex: 1 },
  webViewHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
  webViewTitle: { fontSize: 16, fontWeight: 'bold' },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  webView: { flex: 1 },
  webViewLoadingContainer: { position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center', zIndex: 1 },
  webViewLoadingText: { marginTop: 12, fontSize: 14 },
});