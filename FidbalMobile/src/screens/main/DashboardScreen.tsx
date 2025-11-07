import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useOfflineStore } from '../../store/offlineStore';
import { colors } from '../../utils/colors';
import SkeletonLoader from '../../components/SkeletonLoader';
import Toast from '../../components/Toast';
import api from '../../services/api';

interface SleepSession {
  id: number;
  sleep_date: string;
  sleep_quality: number;
  sleep_duration?: number;
  notes?: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const loadDashboardData = async () => {
    try {
      console.log('📊 Dashboard verileri yükleniyor...');

      if (!isOnline) {
        showToast('Offline modasınız. Veriler güncel olmayabilir.', 'warning');
        setLoading(false);
        return;
      }

      // ✅ ORİJİNAL ÇALIŞAN ENDPOINT
      const response = await api.get('/sleep/sessions');

      if (response.data && response.data.sessions) {
        setSleepSessions(response.data.sessions);
        console.log('✅ Uyku kayıtları yüklendi:', response.data.sessions.length);
      } else {
        console.log('⚠️ Uyku kaydı bulunamadı');
        setSleepSessions([]);
      }
    } catch (error: any) {
      console.error('❌ Dashboard data load error:', error);
      
      // ✅ GELİŞTİRİLMİŞ ERROR HANDLING
      const status = error.response?.status;
      const errorData = error.response?.data;
      let errorMessage = 'Veriler yüklenirken hata oluştu';

      if (status === 401) {
        errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      } else if (status === 403) {
        errorMessage = 'Bu verilere erişim yetkiniz yok.';
      } else if (status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'İnternet bağlantınızı kontrol edin.';
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      showToast(errorMessage, 'error');
      setSleepSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const handleCardPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(route);
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0sa 0dk';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}sa ${mins}dk`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // ✅ İSTATİSTİKLERİ HESAPLA
  const calculateStats = () => {
    if (!sleepSessions || sleepSessions.length === 0) {
      return {
        totalSessions: 0,
        avgQuality: 0,
        avgDuration: 0,
        lastSession: null,
      };
    }

    const totalQuality = sleepSessions.reduce((sum, s) => sum + (s.sleep_quality || 0), 0);
    const totalDuration = sleepSessions.reduce((sum, s) => sum + (s.sleep_duration || 0), 0);

    return {
      totalSessions: sleepSessions.length,
      avgQuality: totalQuality / sleepSessions.length,
      avgDuration: totalDuration / sleepSessions.length,
      lastSession: sleepSessions[0],
    };
  };

  const stats = calculateStats();

  const quickActions = [
    {
      id: 'sleep',
      title: 'Uyku Takibi',
      icon: '😴',
      color: '#6366f1',
      route: 'Sleep',
      show: true,
    },
    {
      id: 'binaural',
      title: 'Binaural Sesler',
      icon: '🎵',
      color: '#8b5cf6',
      route: 'Binaural',
      show: true,
    },
    {
      id: 'relaxation',
      title: 'Rahatlama',
      icon: '🧘',
      color: '#10b981',
      route: 'Relaxation',
      show: true,
    },
    {
      id: 'forms',
      title: 'Formlar',
      icon: '📋',
      color: '#f59e0b',
      route: 'Forms',
      show: true,
    },
    {
      id: 'videocall',
      title: 'Video Görüşme',
      icon: '📹',
      color: '#ef4444',
      route: 'VideoCall',
      show: user?.abGroup === 'experiment',
    },
    {
      id: 'support',
      title: 'Destek',
      icon: '💬',
      route: 'Support',
      color: '#ec4899',
      show: true,
    },
  ];

  // ✅ SKELETON LOADING
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
          <View>
            <SkeletonLoader width={80} height={16} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={150} height={24} />
          </View>
          <SkeletonLoader width={50} height={50} borderRadius={25} />
        </View>

        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <SkeletonLoader width="32%" height={140} borderRadius={16} />
            <SkeletonLoader width="32%" height={140} borderRadius={16} />
            <SkeletonLoader width="32%" height={140} borderRadius={16} />
          </View>

          <SkeletonLoader width={150} height={20} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <SkeletonLoader width="48%" height={120} borderRadius={16} />
            <SkeletonLoader width="48%" height={120} borderRadius={16} />
            <SkeletonLoader width="48%" height={120} borderRadius={16} />
            <SkeletonLoader width="48%" height={120} borderRadius={16} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top', 'bottom']}>
      {/* TOAST */}
      <Toast message={toastMessage} type={toastType} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {/* OFFLINE BANNER */}
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: currentColors.warning }]}>
          <Text style={styles.offlineBannerText}>📡 Offline Mod - İnternet bağlantısı yok</Text>
        </View>
      )}

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: currentColors.secondary }]}>{getGreeting()},</Text>
          <Text style={[styles.userName, { color: currentColors.primary }]}>{user?.name || 'Kullanıcı'}</Text>
        </View>
        <View style={[styles.avatarContainer, { backgroundColor: currentColors.brand }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentColors.brand}
            colors={[currentColors.brand]}
          />
        }
      >
        {/* İSTATİSTİK KARTLARI */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff' }]}>
            <Text style={styles.statIcon}>🛌</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#a5b4fc' : '#6366f1' }]}>Toplam Kayıt</Text>
            <Text style={[styles.statValue, { color: isDark ? '#818cf8' : '#4f46e5' }]}>
              {stats.totalSessions}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5' }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#6ee7b7' : '#10b981' }]}>Ort. Kalite</Text>
            <Text style={[styles.statValue, { color: isDark ? '#34d399' : '#059669' }]}>
              {stats.avgQuality > 0 ? stats.avgQuality.toFixed(1) : '0'}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7' }]}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#fcd34d' : '#f59e0b' }]}>Ort. Süre</Text>
            <Text style={[styles.statValue, { color: isDark ? '#fbbf24' : '#d97706' }]}>
              {Math.round(stats.avgDuration)} dk
            </Text>
          </View>
        </View>

        {/* SON UYKU KAYDI */}
        {stats.lastSession && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>😴 Son Uyku Kaydınız</Text>
            <View style={[styles.lastSessionCard, { backgroundColor: currentColors.card }]}>
              <View style={styles.lastSessionHeader}>
                <Text style={[styles.lastSessionDate, { color: currentColors.secondary }]}>
                  {new Date(stats.lastSession.sleep_date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.lastSessionStats}>
                <View style={styles.lastSessionStat}>
                  <Text style={[styles.lastSessionStatLabel, { color: currentColors.tertiary }]}>Kalite</Text>
                  <Text style={[styles.lastSessionStatValue, { color: currentColors.primary }]}>
                    {stats.lastSession.sleep_quality}/10
                  </Text>
                </View>
                {stats.lastSession.sleep_duration && (
                  <View style={styles.lastSessionStat}>
                    <Text style={[styles.lastSessionStatLabel, { color: currentColors.tertiary }]}>Süre</Text>
                    <Text style={[styles.lastSessionStatValue, { color: currentColors.primary }]}>
                      {Math.round(stats.lastSession.sleep_duration)} dk
                    </Text>
                  </View>
                )}
              </View>
              {stats.lastSession.notes && (
                <Text style={[styles.lastSessionNotes, { color: currentColors.secondary }]}>
                  {stats.lastSession.notes}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* HIZLI ERİŞİM */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>⚡ Hızlı Erişim</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions
              .filter((action) => action.show)
              .map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, { backgroundColor: currentColors.card }]}
                  onPress={() => handleCardPress(action.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIconContainer, { backgroundColor: action.color + '20' }]}>
                    <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={[styles.quickActionTitle, { color: currentColors.primary }]}>{action.title}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* İPUCU */}
        <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe', borderLeftColor: currentColors.info }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>İpucu</Text>
            <Text style={[styles.tipText, { color: isDark ? '#93c5fd' : '#3b82f6' }]}>
              Düzenli uyku takibi yaparak uyku kalitenizi artırabilir ve daha iyi uyku alışkanlıkları geliştirebilirsiniz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  offlineBanner: { padding: 8, alignItems: 'center' },
  offlineBannerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  greeting: { fontSize: 14, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: 'bold' },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1 },

  // İSTATİSTİKLER
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { 
    flex: 1, 
    borderRadius: 16, 
    padding: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  statIcon: { fontSize: 32, marginBottom: 8, textAlign: 'center' },
  statLabel: { fontSize: 11, textAlign: 'center', marginBottom: 4, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },

  // SON UYKU KAYDI
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  lastSessionCard: { borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  lastSessionHeader: { marginBottom: 12 },
  lastSessionDate: { fontSize: 14 },
  lastSessionStats: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  lastSessionStat: { flex: 1 },
  lastSessionStatLabel: { fontSize: 12, marginBottom: 4 },
  lastSessionStatValue: { fontSize: 20, fontWeight: 'bold' },
  lastSessionNotes: { fontSize: 13, marginTop: 8, fontStyle: 'italic' },

  // HIZLI ERİŞİM
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionCard: { width: '48%', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  quickActionIconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickActionIcon: { fontSize: 28 },
  quickActionTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center' },

  // İPUCU
  tipCard: { margin: 16, borderRadius: 12, padding: 16, flexDirection: 'row', borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tipIcon: { fontSize: 28, marginRight: 12 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 18 },
});
