import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
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

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
      showToast('Veriler yüklenirken hata oluştu', 'error');
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

    // Basınca animasyon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate(route as never);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // ✅ İSTATİSTİKLER
  const lastSleep = sleepSessions[0];
  const avgQuality =
    sleepSessions.length > 0
      ? (sleepSessions.reduce((sum, s) => sum + (s.sleep_quality || 0), 0) / sleepSessions.length).toFixed(1)
      : '0';
  const totalRecords = sleepSessions.length;

  const stats = [
    {
      title: 'Son Uyku Kalitesi',
      value: lastSleep ? `${lastSleep.sleep_quality}/10` : '—',
      subtitle: lastSleep ? formatDate(lastSleep.sleep_date) : 'Henüz kayıt yok',
      icon: '😴',
      color: currentColors.info,
      bgColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
    },
    {
      title: 'Ortalama Kalite',
      value: avgQuality !== '0' ? `${avgQuality}/10` : '—',
      subtitle: `${totalRecords} kayıt`,
      icon: '📊',
      color: currentColors.success,
      bgColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
    },
    {
      title: 'A/B Test Grubu',
      value: user?.abGroup === 'experiment' || user?.ab_group === 'experiment' ? 'Deney' : 'Kontrol',
      subtitle:
        user?.abGroup === 'experiment' || user?.ab_group === 'experiment'
          ? 'Beta özellikler'
          : 'Temel özellikler',
      icon: user?.abGroup === 'experiment' || user?.ab_group === 'experiment' ? '🧪' : '🔬',
      color: currentColors.warning,
      bgColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
    },
  ];

  const quickActions = [
    {
      id: 'sleep',
      title: 'Uyku Kaydı',
      icon: '😴',
      color: currentColors.info,
      route: 'Sleep',
      show: true,
    },
    {
      id: 'relaxation',
      title: 'Rahatlama',
      icon: '🧘‍♀️',
      color: currentColors.success,
      route: 'Relaxation',
      show:
        user?.abGroup === 'experiment' || user?.ab_group === 'experiment' || user?.isAdmin || user?.is_admin,
    },
    {
      id: 'binaural',
      title: 'Binaural',
      icon: '🎵',
      color: '#8b5cf6',
      route: 'Binaural',
      show:
        user?.abGroup === 'experiment' || user?.ab_group === 'experiment' || user?.isAdmin || user?.is_admin,
    },
    {
      id: 'forms',
      title: 'Formlar',
      icon: '📋',
      color: currentColors.warning,
      route: 'Forms',
      show: true,
    },
    {
      id: 'support',
      title: 'Destek',
      icon: '💬',
      color: '#ec4899',
      route: 'Support',
      show: true,
    },
  ];

  // ✅ SKELETON LOADING
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
      {/* TOAST */}
      <Toast message={toastMessage} type={toastType} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {/* OFFLINE BANNER */}
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: currentColors.warning }]}>
          <Text style={styles.offlineBannerText}>📡 Offline Mod - İnternet bağlantısı yok</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
          <View>
            <Text style={[styles.greeting, { color: currentColors.secondary }]}>Hoş Geldiniz</Text>
            <Text style={[styles.userName, { color: currentColors.primary }]}>{user?.name || 'Kullanıcı'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: currentColors.brand }]}
            onPress={() => handleCardPress('Profile')}
          >
            <Text style={styles.profileButtonText}>{user?.name?.charAt(0)?.toUpperCase() || '👤'}</Text>
          </TouchableOpacity>
        </View>

        {/* İSTATİSTİKLER */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Animated.View
              key={index}
              style={[styles.statCard, { backgroundColor: stat.bgColor, transform: [{ scale: scaleAnim }] }]}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statTitle, { color: currentColors.secondary }]}>{stat.title}</Text>
              <Text style={[styles.statSubtitle, { color: currentColors.tertiary }]}>{stat.subtitle}</Text>
            </Animated.View>
          ))}
        </View>

        {/* HIZLI İŞLEMLER */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            {quickActions
              .filter((action) => action.show)
              .map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionCard, { backgroundColor: isDark ? currentColors.card : action.color + '15' }]}
                  onPress={() => handleCardPress(action.route)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={[styles.actionTitle, { color: action.color }]}>{action.title}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* SON UYKU KAYITLARI */}
        {sleepSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Son Uyku Kayıtları</Text>
              <TouchableOpacity onPress={() => handleCardPress('Sleep')}>
                <Text style={[styles.seeAllText, { color: currentColors.brand }]}>Tümü →</Text>
              </TouchableOpacity>
            </View>
            {sleepSessions.slice(0, 3).map((session) => (
              <View key={session.id} style={[styles.recordCard, { backgroundColor: currentColors.card }]}>
                <View style={styles.recordLeft}>
                  <Text style={[styles.recordDate, { color: currentColors.primary }]}>{formatDate(session.sleep_date)}</Text>
                  {session.notes && (
                    <Text style={[styles.recordNotes, { color: currentColors.secondary }]} numberOfLines={1}>
                      {session.notes}
                    </Text>
                  )}
                </View>
                <View style={styles.recordRight}>
                  <Text style={[styles.recordQuality, { color: currentColors.brand }]}>{session.sleep_quality}/10</Text>
                  <Text style={[styles.recordLabel, { color: currentColors.tertiary }]}>kalite</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* BETA KULLANICI BİLGİSİ */}
        {(user?.abGroup === 'experiment' || user?.ab_group === 'experiment') && (
          <View style={[styles.betaCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', borderLeftColor: currentColors.warning }]}>
            <Text style={styles.betaIcon}>🧪</Text>
            <View style={styles.betaContent}>
              <Text style={[styles.betaTitle, { color: isDark ? '#fbbf24' : '#92400e' }]}>Beta Kullanıcısı</Text>
              <Text style={[styles.betaText, { color: isDark ? '#fde68a' : '#78350f' }]}>
                Yeni özellikleri test ediyorsunuz: Rahatlama teknikleri ve Binaural sesler. Deneyimlerinizi
                uzmanlarımızla paylaşmayı unutmayın!
              </Text>
            </View>
          </View>
        )}

        {/* YENİ KULLANICILAR İÇİN HOŞGELDİN MESAJI */}
        {sleepSessions.length === 0 && (
          <View style={[styles.welcomeCard, { backgroundColor: currentColors.card }]}>
            <Text style={styles.welcomeIcon}>👋</Text>
            <Text style={[styles.welcomeTitle, { color: currentColors.primary }]}>FidBal'e Hoş Geldiniz!</Text>
            <Text style={[styles.welcomeText, { color: currentColors.secondary }]}>
              Uyku kalitenizi takip etmeye hazır mısınız?{'\n'}
              İlk uyku kaydınızı ekleyerek başlayın!
            </Text>
            <TouchableOpacity style={[styles.welcomeButton, { backgroundColor: currentColors.brand }]} onPress={() => handleCardPress('Sleep')}>
              <Text style={styles.welcomeButtonText}>İlk Kaydı Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  offlineBanner: { padding: 12, alignItems: 'center' },
  offlineBannerText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  greeting: { fontSize: 14, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: 'bold' },
  profileButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  profileButtonText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', minHeight: 140, justifyContent: 'center' },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  statSubtitle: { fontSize: 10, textAlign: 'center' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  seeAllText: { fontSize: 14, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '48%', aspectRatio: 1.5, borderRadius: 16, padding: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionIcon: { fontSize: 40, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  recordCard: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  recordLeft: { flex: 1 },
  recordDate: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  recordNotes: { fontSize: 13 },
  recordRight: { alignItems: 'flex-end', justifyContent: 'center' },
  recordQuality: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  recordLabel: { fontSize: 11 },
  betaCard: { flexDirection: 'row', margin: 16, padding: 16, borderRadius: 16, borderLeftWidth: 4, gap: 12 },
  betaIcon: { fontSize: 32 },
  betaContent: { flex: 1 },
  betaTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  betaText: { fontSize: 13, lineHeight: 18 },
  welcomeCard: { margin: 16, padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  welcomeIcon: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  welcomeText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  welcomeButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  welcomeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});