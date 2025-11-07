import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../store/themeStore';
import { useOfflineStore } from '../../store/offlineStore';
import { colors } from '../../utils/colors';
import SkeletonLoader from '../../components/SkeletonLoader';
import Toast from '../../components/Toast';
import api from '../../services/api';

interface RelaxationContent {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  type: string;
  category: string;
  view_count?: number;
}

export default function RelaxationScreen() {
  const isDark = useThemeStore((state) => state.isDark);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const addPendingRequest = useOfflineStore((state) => state.addPendingRequest);
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  const [content, setContent] = useState<RelaxationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('box_breathing');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Heart Rate Modal
  const [showHeartRateModal, setShowHeartRateModal] = useState(false);
  const [heartRateBefore, setHeartRateBefore] = useState('');
  const [heartRateAfter, setHeartRateAfter] = useState('');
  const [pendingSound, setPendingSound] = useState<RelaxationContent | null>(null);
  const [isWaitingForAfter, setIsWaitingForAfter] = useState(false);
  const sessionStartTime = useRef<number | null>(null);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const categories = [
    { id: 'box_breathing', name: 'Kutu Nefes', icon: '🌬️', desc: 'Nefes egzersizi' },
    { id: 'guided_imagery', name: 'Rehberli İmgeleme', icon: '🧘‍♀️', desc: 'Zihinsel rahatlama' },
    { id: 'progressive_relaxation', name: 'Kas Gevşetme', icon: '🌊', desc: 'Vücut rahatlama' },
  ];

  // Test content (API boşsa kullanılacak)
  const testContent: { [key: string]: RelaxationContent[] } = {
    box_breathing: [
      {
        id: 'test-box-1',
        title: 'Kutu Nefes Tekniği - Temel',
        description: '4-4-4-4 kutu nefes egzersizi',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 240,
        type: 'audio',
        category: 'box_breathing',
        view_count: 0,
      },
    ],
    guided_imagery: [
      {
        id: 'test-imagery-1',
        title: 'Huzurlu Orman',
        description: 'Zihinsel rahatlama',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 600,
        type: 'audio',
        category: 'guided_imagery',
        view_count: 0,
      },
    ],
    progressive_relaxation: [
      {
        id: 'test-pmr-1',
        title: 'Progresif Kas Gevşetme',
        description: 'Tüm vücut kaslarını gevşetin',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        duration: 900,
        type: 'audio',
        category: 'progressive_relaxation',
        view_count: 0,
      },
    ],
  };

  useEffect(() => {
    setupAudio();
    loadContent();

    return () => {
      cleanupSound();
    };
  }, []);

  useEffect(() => {
    // Kategori değiştiğinde sesi temizle
    cleanupSound();
    setCurrentPlaying(null);
    setProgress(0);
    loadContent();
  }, [selectedCategory]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  };

  const cleanupSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Haptics.notificationAsync(
      type === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
  };

  const loadContent = async () => {
    try {
      if (!isOnline) {
        setContent(testContent[selectedCategory] || []);
        setLoading(false);
        showToast('Offline mod - Test içeriği gösteriliyor', 'warning');
        return;
      }

      const response = await api.get(`/relaxation/content?category=${selectedCategory}`);
      const apiContent = response.data.content || [];

      if (apiContent.length === 0) {
        setContent(testContent[selectedCategory] || []);
      } else {
        setContent(apiContent);
      }
    } catch (error: any) {
      console.error('❌ Load content error:', error);
      setContent(testContent[selectedCategory] || []);
      showToast('Test içeriği yüklendi', 'warning');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadContent();
  }, [selectedCategory]);

  const handlePlay = async (item: RelaxationContent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentPlaying === item.id) {
      // Durdur
      await cleanupSound();
      setCurrentPlaying(null);
      setProgress(0);
    } else {
      // Önce kalp atışı al
      setPendingSound(item);
      setIsWaitingForAfter(false);
      setShowHeartRateModal(true);
    }
  };

  const handleHeartRateSubmit = async () => {
    if (isWaitingForAfter) {
      // Sonraki kalp atışı
      const hrAfter = parseInt(heartRateAfter);
      if (!heartRateAfter || hrAfter < 40 || hrAfter > 200) {
        showToast('Kalp atışı 40-200 arası olmalıdır', 'error');
        return;
      }

      try {
        const duration = sessionStartTime.current ? Math.floor((Date.now() - sessionStartTime.current) / 1000) : 0;

        const payload = {
          content_type: 'relaxation',
          content_id: currentPlaying,
          content_name: pendingSound?.title || 'Bilinmeyen',
          heart_rate_before: parseInt(heartRateBefore),
          heart_rate_after: hrAfter,
          duration,
        };

        if (isOnline) {
          await api.post('/heart-rate/sessions', payload);
          showToast('Kalp atım hızı kaydedildi!', 'success');
        } else {
          await addPendingRequest({
            endpoint: '/heart-rate/sessions',
            method: 'POST',
            data: payload,
          });
          showToast('Offline modda kaydedildi', 'warning');
        }

        // Temizle
        await cleanupSound();
        setCurrentPlaying(null);
        setProgress(0);
        setShowHeartRateModal(false);
        setHeartRateBefore('');
        setHeartRateAfter('');
        setPendingSound(null);
        setIsWaitingForAfter(false);
      } catch (error: any) {
        console.error('❌ Heart rate save error:', error);
        showToast('Kayıt başarısız', 'error');
      }
    } else {
      // İlk kalp atışı
      const hrBefore = parseInt(heartRateBefore);
      if (!heartRateBefore || hrBefore < 40 || hrBefore > 200) {
        showToast('Kalp atışı 40-200 arası olmalıdır', 'error');
        return;
      }

      // Sesi çal
      try {
        await cleanupSound();

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: pendingSound!.url },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        setSound(newSound);
        setCurrentPlaying(pendingSound!.id);
        sessionStartTime.current = Date.now();
        setShowHeartRateModal(false);
      } catch (error) {
        console.error('❌ Play error:', error);
        showToast('Ses oynatılamadı', 'error');
      }
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (status.durationMillis) {
        const progressPercent = (status.positionMillis / status.durationMillis) * 100;
        setProgress(progressPercent);
      }

      if (status.didJustFinish) {
        // Ses bitti, sonraki kalp atışını al
        setIsWaitingForAfter(true);
        setShowHeartRateModal(true);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} dk`;
  };

  // Skeleton Loading
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
          <SkeletonLoader width={200} height={28} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={250} height={16} />
        </View>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <SkeletonLoader width="30%" height={100} borderRadius={12} />
            <SkeletonLoader width="30%" height={100} borderRadius={12} />
            <SkeletonLoader width="30%" height={100} borderRadius={12} />
          </View>
          <SkeletonLoader width="100%" height={200} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={200} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top', 'bottom']}>
      <Toast message={toastMessage} type={toastType} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: currentColors.warning }]}>
          <Text style={styles.offlineBannerText}>📡 Offline Mod</Text>
        </View>
      )}

      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: currentColors.primary }]}>Rahatlama Merkezi</Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.secondary }]}>Meditasyon ve nefes egzersizleri</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* KATEGORİLER - BİNAURAL GİBİ BÜYÜK KARTLAR */}
        <View style={styles.typesContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor: selectedCategory === cat.id ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : currentColors.card,
                  borderColor: selectedCategory === cat.id ? currentColors.brand : currentColors.border,
                },
              ]}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Kategori değiştiğinde sesi durdur
                if (currentPlaying) {
                  await cleanupSound();
                  setCurrentPlaying(null);
                  setProgress(0);
                }
                setSelectedCategory(cat.id);
              }}
            >
              <Text style={styles.typeIcon}>{cat.icon}</Text>
              <Text style={[styles.typeName, { color: currentColors.primary }]}>{cat.name}</Text>
              <Text style={[styles.typeDesc, { color: currentColors.tertiary }]}>{cat.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* İÇERİKLER */}
        {content.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: currentColors.primary }]}>Henüz içerik yok</Text>
            <Text style={[styles.emptyText, { color: currentColors.secondary }]}>Bu kategoride içerik bulunmuyor</Text>
          </View>
        ) : (
          <View style={styles.section}>
            {content.map((item) => (
              <View key={item.id} style={[styles.contentCard, { backgroundColor: currentColors.card }]}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentIcon}>{item.type === 'audio' ? '🎵' : '🎥'}</Text>
                  <Text style={[styles.contentDuration, { color: currentColors.tertiary }]}>{formatDuration(item.duration)}</Text>
                </View>

                <Text style={[styles.contentTitle, { color: currentColors.primary }]}>{item.title}</Text>
                <Text style={[styles.contentDescription, { color: currentColors.secondary }]}>{item.description}</Text>

                {currentPlaying === item.id && (
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: currentColors.border }]}>
                      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: currentColors.brand }]} />
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.playButton,
                    { backgroundColor: currentPlaying === item.id ? currentColors.error : currentColors.brand },
                  ]}
                  onPress={() => handlePlay(item)}
                >
                  <Text style={styles.playButtonText}>{currentPlaying === item.id ? '⏸️ Durdur' : '▶️ Başlat'}</Text>
                </TouchableOpacity>

                {item.view_count && item.view_count > 0 && (
                  <Text style={[styles.viewCount, { color: currentColors.tertiary }]}>{item.view_count} kez dinlendi</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* İPUCU */}
        <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5', borderLeftColor: currentColors.success }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: isDark ? '#6ee7b7' : '#065f46' }]}>İpucu</Text>
            <Text style={[styles.tipText, { color: isDark ? '#a7f3d0' : '#047857' }]}>
              Her gün düzenli rahatlama egzersizleri uyku kalitenizi artırır. Kulaklık kullanın!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* HEART RATE MODAL */}
      <Modal visible={showHeartRateModal} animationType="fade" transparent onRequestClose={() => setShowHeartRateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { 
            backgroundColor: currentColors.card,
            marginTop: Platform.OS === 'ios' ? insets.top : 0,
          }]}>
            <Text style={[styles.modalTitle, { color: currentColors.primary }]}>
              {isWaitingForAfter ? '🫀 Ses Sonrası Kalp Atışı' : '🫀 Ses Öncesi Kalp Atışı'}
            </Text>
            <Text style={[styles.modalText, { color: currentColors.secondary }]}>
              {isWaitingForAfter ? 'Ses bitti. Şimdi kalp atışınızı ölçün.' : 'Sesi başlatmadan önce kalp atışınızı ölçün.'}
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
              value={isWaitingForAfter ? heartRateAfter : heartRateBefore}
              onChangeText={(text) => (isWaitingForAfter ? setHeartRateAfter(text) : setHeartRateBefore(text))}
              keyboardType="numeric"
              placeholder="Örn: 72"
              placeholderTextColor={currentColors.placeholder}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: currentColors.brand }]} onPress={handleHeartRateSubmit}>
                <Text style={styles.modalButtonText}>{isWaitingForAfter ? 'Kaydet' : 'Başlat'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.border }]}
                onPress={() => {
                  setShowHeartRateModal(false);
                  setHeartRateBefore('');
                  setHeartRateAfter('');
                  setPendingSound(null);
                  setIsWaitingForAfter(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.primary }]}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  typesContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  typeCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2, minHeight: 140 },
  typeIcon: { fontSize: 28, marginBottom: 8 },
  typeName: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, textAlign: 'center', lineHeight: 16 },
  typeDesc: { fontSize: 10, textAlign: 'center', color: '#94a3b8' },
  section: { padding: 16, gap: 16 },
  contentCard: { borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  contentIcon: { fontSize: 32 },
  contentDuration: { fontSize: 12 },
  contentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  contentDescription: { fontSize: 14, marginBottom: 12 },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  playButton: { padding: 14, borderRadius: 8, alignItems: 'center' },
  playButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  viewCount: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  tipCard: { flexDirection: 'row', margin: 16, padding: 16, borderRadius: 12, borderLeftWidth: 4 },
  tipIcon: { fontSize: 28, marginRight: 12 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 18 },
  emptyCard: { borderRadius: 12, padding: 32, alignItems: 'center', margin: 16 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalText: { fontSize: 14, marginBottom: 16 },
  modalInput: { padding: 14, borderRadius: 8, borderWidth: 1, fontSize: 16, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});