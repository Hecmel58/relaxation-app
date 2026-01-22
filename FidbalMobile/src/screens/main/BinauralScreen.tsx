import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  AppState,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../store/themeStore';
import { useOfflineStore } from '../../store/offlineStore';
import { colors } from '../../utils/colors';
import SkeletonLoader from '../../components/SkeletonLoader';
import Toast from '../../components/Toast';
import api from '../../services/api';

interface BinauralSound {
  id: string;
  name: string;
  description: string;
  url: string;
  base_frequency: number;
  binaural_frequency: number;
  duration: number;
  purpose: string;
  brainwave_type: string;
  play_count?: number;
}

export default function BinauralScreen({ navigation }: any) {
  const isDark = useThemeStore((state) => state.isDark);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const addPendingRequest = useOfflineStore((state) => state.addPendingRequest);
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  const [sounds, setSounds] = useState<BinauralSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('delta');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Heart Rate Modal
  const [showHeartRateModal, setShowHeartRateModal] = useState(false);
  const [heartRateBefore, setHeartRateBefore] = useState('');
  const [heartRateAfter, setHeartRateAfter] = useState('');
  const [pendingSound, setPendingSound] = useState<BinauralSound | null>(null);
  const [isWaitingForAfter, setIsWaitingForAfter] = useState(false);
  const sessionStartTime = useRef<number | null>(null);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const brainwaveTypes = [
    { id: 'delta', name: 'Delta', freq: '0.5-4 Hz', icon: '🌙', desc: 'Derin uyku', color: '#6366f1' },
    { id: 'theta', name: 'Theta', freq: '4-8 Hz', icon: '🌅', desc: 'Meditasyon', color: '#8b5cf6' },
    { id: 'alpha', name: 'Alpha', freq: '8-13 Hz', icon: '☀️', desc: 'Rahatlama', color: '#f59e0b' },
  ];

  // Test sounds
  const testSounds: { [key: string]: BinauralSound[] } = {
    delta: [
      {
        id: 'test-delta-1',
        name: 'Derin Uyku 1Hz',
        description: 'Derin uyku için delta dalgası',
        base_frequency: 100,
        binaural_frequency: 1,
        duration: 3600,
        purpose: 'Derin uyku, fiziksel iyileşme',
        brainwave_type: 'delta',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        play_count: 0,
      },
    ],
    theta: [
      {
        id: 'test-theta-1',
        name: 'REM Uyku 6Hz',
        description: 'REM uykusu için theta dalgası',
        base_frequency: 200,
        binaural_frequency: 6,
        duration: 2400,
        purpose: 'Derin rahatlama, meditasyon, REM uykusu',
        brainwave_type: 'theta',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        play_count: 0,
      },
    ],
    alpha: [
      {
        id: 'test-alpha-1',
        name: 'Rahat Uyanıklık 10Hz',
        description: 'Rahat ama uyanık durum için alpha',
        base_frequency: 200,
        binaural_frequency: 10,
        duration: 1800,
        purpose: 'Rahat uyanıklık, odaklanma',
        brainwave_type: 'alpha',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        play_count: 0,
      },
    ],
  };

  // ✅ CLEANUP SOUND - useCallback ile optimize edildi
  const cleanupSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        console.log('🔇 Ses temizleniyor...');
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  }, [soundRef.current]);

  // ✅ SESSION RESET
  const resetSession = useCallback(() => {
    setShowHeartRateModal(false);
    setHeartRateBefore('');
    setHeartRateAfter('');
    setPendingSound(null);
    setIsWaitingForAfter(false);
    sessionStartTime.current = null;
  }, []);

  // ✅ SHOW TOAST - useCallback ile optimize edildi
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Haptics.notificationAsync(
      type === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
  }, []);

  // ✅ SAYFADAN AYRILINCA SESİ DURDUR
  const handlePageLeave = useCallback(async () => {
    if (soundRef.current || currentPlaying) {
      console.log('🔇 Sayfa değişimi: Ses durduruluyor...');
      await cleanupSound();
      setCurrentPlaying(null);
      setProgress(0);
      
      if (showHeartRateModal) {
        resetSession();
      }
    }
  }, [soundRef.current, currentPlaying, showHeartRateModal, cleanupSound, resetSession]);

  // ✅ NAVIGATION LISTENER - Sayfa değişince sesi durdur
  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('🚪 Sayfadan ayrılıyor, ses durduruluyor...');
      handlePageLeave();
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      console.log('🎯 Binaural sayfasına gelindi');
    });

    return () => {
      unsubscribeBlur();
      unsubscribeFocus();
    };
  }, [navigation, handlePageLeave]);

  // ✅ APPSTATE LISTENER - Uygulama background'a gidince sesi durdur
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (soundRef.current || currentPlaying) {
          console.log('📱 Uygulama background: Ses durduruluyor...');
          await cleanupSound();
          setCurrentPlaying(null);
          setProgress(0);
          if (showHeartRateModal) {
            resetSession();
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [soundRef.current, currentPlaying, showHeartRateModal, cleanupSound, resetSession]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  };

  const loadSounds = async () => {
    try {
      if (!isOnline) {
        setSounds(testSounds[selectedType] || []);
        setLoading(false);
        showToast('Offline mod - Test sesleri gösteriliyor', 'warning');
        return;
      }

      const response = await api.get(`/binaural/sounds?category=${selectedType}`);
      const apiSounds = response.data.sounds || [];

      if (apiSounds.length === 0) {
        setSounds(testSounds[selectedType] || []);
        showToast('Test sesleri yüklendi', 'info');
      } else {
        setSounds(apiSounds);
      }
    } catch (error: any) {
      console.error('❌ Load sounds error:', error);
      setSounds(testSounds[selectedType] || []);
      showToast('Test sesleri yüklendi', 'warning');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setupAudio();
    loadSounds();

    return () => {
      cleanupSound();
    };
  }, []);

  // Kategori değişince sesi durdur
  useEffect(() => {
    const handleCategoryChange = async () => {
      await cleanupSound();
      setCurrentPlaying(null);
      setProgress(0);
      loadSounds();
    };

    handleCategoryChange();
  }, [selectedType]);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadSounds();
  }, [selectedType]);

  const handlePlay = async (item: BinauralSound) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentPlaying === item.id) {
      // Durdur
      await cleanupSound();
      setCurrentPlaying(null);
      setProgress(0);
      showToast('Ses durduruldu', 'info');
    } else {
      // Önce mevcut sesi temizle
      if (currentPlaying) {
        await cleanupSound();
        setCurrentPlaying(null);
        setProgress(0);
      }

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
          content_type: 'binaural',
          content_id: currentPlaying,
          content_name: pendingSound?.name || 'Bilinmeyen',
          heart_rate_before: parseInt(heartRateBefore),
          heart_rate_after: hrAfter,
          duration,
        };

        console.log('📤 Heart rate payload:', JSON.stringify(payload, null, 2));

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
        resetSession();
      } catch (error: any) {
        console.error('❌ Heart rate save error:', error);
        console.error('❌ Error response:', error.response?.data);
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

        console.log('🎵 Ses çalınıyor:', pendingSound?.url);

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: pendingSound!.url },
          { 
            shouldPlay: true,
            isLooping: false,
            volume: 1.0,
          },
          onPlaybackStatusUpdate
        );

        soundRef.current = newSound;
        setCurrentPlaying(pendingSound!.id);
        sessionStartTime.current = Date.now();
        setShowHeartRateModal(false);
        
        showToast('Ses başlatıldı - Kulaklığınızı takın!', 'success');
      } catch (error) {
        console.error('❌ Play error:', error);
        showToast('Ses oynatılamadı. Kulaklık takın!', 'error');
        resetSession();
      }
    }
  };

  // ✅ Hata yakalama eklendi
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    try {
      if (status.isLoaded) {
        if (status.durationMillis) {
          const progressPercent = (status.positionMillis / status.durationMillis) * 100;
          setProgress(progressPercent);
        }

        if (status.didJustFinish) {
          console.log('✅ Ses bitti, son kalp atışı isteniyor');
          setIsWaitingForAfter(true);
          setShowHeartRateModal(true);
        }
      } else if ('error' in status && status.error) {
        console.error('Playback error:', status.error);
        showToast('Ses çalarken hata oluştu', 'error');
        cleanupSound();
        setCurrentPlaying(null);
        setProgress(0);
      }
    } catch (error) {
      console.error('Status update error:', error);
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

      {/* OFFLINE BANNER */}
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: currentColors.warning }]}>
          <Text style={styles.offlineBannerText}>📡 Offline Mod</Text>
        </View>
      )}

      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: currentColors.primary }]}>Binaural Sesler</Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.secondary }]}>Beyin dalgalarını etkileyin</Text>
        </View>

        {/* ✅ SES DURUMU GÖSTERGESİ */}
        {currentPlaying && (
          <View style={[styles.playingIndicator, { backgroundColor: currentColors.success }]}>
            <Text style={styles.playingIndicatorText}>🎵 Çalıyor</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* UYARI KARTI */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe', borderLeftColor: currentColors.info }]}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Binaural Sesler Nedir?</Text>
            <Text style={[styles.infoText, { color: isDark ? '#93c5fd' : '#1e3a8a' }]}>
              Her kulağa farklı frekansta ses gönderilerek beyninizin belirli bir frekansı oluşturması sağlanır.{'\n\n'}
              <Text style={{ fontWeight: 'bold' }}>Önemli:</Text> Kulaklık kullanmanız gerekir!
            </Text>
          </View>
        </View>

        {/* BRAINWAVE TİPLERİ */}
        <View style={styles.typesContainer}>
          {brainwaveTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor: selectedType === type.id ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : currentColors.card,
                  borderColor: selectedType === type.id ? type.color : currentColors.border,
                },
              ]}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (currentPlaying) {
                  await cleanupSound();
                  setCurrentPlaying(null);
                  setProgress(0);
                  showToast('Kategori değişti, ses durduruldu', 'info');
                }
                setSelectedType(type.id);
              }}
              accessibilityLabel={`${type.name} kategorisi`}
              accessibilityHint={`${type.desc} için ${type.freq} frekans`}
              accessibilityRole="button"
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[styles.typeName, { color: currentColors.primary }]}>{type.name}</Text>
              <Text style={[styles.typeFreq, { color: currentColors.secondary }]}>{type.freq}</Text>
              <Text style={[styles.typeDesc, { color: currentColors.tertiary }]}>{type.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SESLER */}
        {sounds.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: currentColors.primary }]}>
              {!isOnline ? 'Offline Mod' : 'Henüz ses yok'}
            </Text>
            <Text style={[styles.emptyText, { color: currentColors.secondary }]}>
              {!isOnline 
                ? 'İçeriklere erişmek için internet bağlantınızı kontrol edin' 
                : 'Bu kategoride ses bulunmuyor'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            {sounds.map((item) => (
              <View key={item.id} style={[styles.soundCard, { backgroundColor: currentColors.card }]}>
                <View style={styles.soundHeader}>
                  <Text style={styles.soundIcon}>🎵</Text>
                  <Text style={[styles.soundDuration, { color: currentColors.tertiary }]}>
                    {formatDuration(item.duration)}
                  </Text>
                </View>

                <Text style={[styles.soundName, { color: currentColors.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.soundDescription, { color: currentColors.secondary }]}>
                  {item.description}
                </Text>

                <View style={styles.freqGrid}>
                  <View style={[styles.freqItem, { backgroundColor: currentColors.input }]}>
                    <Text style={[styles.freqLabel, { color: currentColors.tertiary }]}>Baz Frekans</Text>
                    <Text style={[styles.freqValue, { color: currentColors.primary }]}>
                      {item.base_frequency} Hz
                    </Text>
                  </View>
                  <View style={[styles.freqItem, { backgroundColor: currentColors.input }]}>
                    <Text style={[styles.freqLabel, { color: currentColors.tertiary }]}>Binaural</Text>
                    <Text style={[styles.freqValue, { color: currentColors.primary }]}>
                      {item.binaural_frequency} Hz
                    </Text>
                  </View>
                </View>

                {currentPlaying === item.id && (
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: currentColors.border }]}>
                      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: currentColors.brand }]} />
                    </View>
                    <Text style={[styles.progressText, { color: currentColors.tertiary }]}>
                      %{Math.round(progress)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.playButton,
                    { 
                      backgroundColor: currentPlaying === item.id ? currentColors.error : currentColors.brand,
                      opacity: !isOnline && currentPlaying !== item.id ? 0.5 : 1
                    },
                  ]}
                  onPress={() => handlePlay(item)}
                  disabled={!isOnline && currentPlaying !== item.id}
                  accessibilityLabel={currentPlaying === item.id ? 'Sesi durdur' : 'Sesi dinle'}
                  accessibilityHint={`${item.name} binaural sesini ${currentPlaying === item.id ? 'durdur' : 'çal'}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.playButtonText}>
                    {currentPlaying === item.id ? '⏸️ Durdur' : '▶️ Dinle'}
                  </Text>
                </TouchableOpacity>

                {item.play_count !== undefined && item.play_count > 0 && (
                  <Text style={[styles.playCount, { color: currentColors.tertiary }]}>
                    {item.play_count} kez dinlendi
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ✅ SES UYARI KARTI */}
        {currentPlaying && (
          <View style={[styles.warningCard, { 
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
            borderLeftColor: currentColors.warning
          }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: isDark ? '#fcd34d' : '#92400e' }]}>
                Ses Çalıyor
              </Text>
              <Text style={[styles.warningText, { color: isDark ? '#fde68a' : '#b45309' }]}>
                Sayfadan ayrılırsanız ses otomatik olarak duracaktır. Kulaklığınızı çıkarmayın!
              </Text>
            </View>
          </View>
        )}

        {/* İPUCU */}
        <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5', borderLeftColor: currentColors.success }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: isDark ? '#6ee7b7' : '#065f46' }]}>İpucu</Text>
            <Text style={[styles.tipText, { color: isDark ? '#a7f3d0' : '#047857' }]}>
              Binaural sesler MUTLAKA kulaklıkla dinlenmelidir. Her kulağa farklı frekans gönderilir!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* HEART RATE MODAL */}
      <Modal 
        visible={showHeartRateModal} 
        animationType="fade" 
        transparent 
        onRequestClose={() => {
          resetSession();
          if (isWaitingForAfter) {
            cleanupSound();
            setCurrentPlaying(null);
            setProgress(0);
          }
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalOverlay}
            onPress={() => {
              // Boş alan tıklandığında klavyeyi kapat ama modalı kapatma
            }}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalCard, { backgroundColor: currentColors.card }]}>
                <Text style={[styles.modalTitle, { color: currentColors.primary }]}>
                  {isWaitingForAfter ? '🫀 Ses Sonrası Kalp Atışı' : '🫀 Ses Öncesi Kalp Atışı'}
                </Text>
                <Text style={[styles.modalText, { color: currentColors.secondary }]}>
                  {isWaitingForAfter 
                    ? 'Ses bitti. Şimdi kalp atışınızı ölçün ve girin.' 
                    : 'Sesi başlatmadan önce kalp atışınızı ölçün ve girin.'
                  }
                </Text>
                
                <TextInput
                  style={[styles.modalInput, { 
                    backgroundColor: currentColors.input, 
                    borderColor: currentColors.inputBorder, 
                    color: currentColors.primary 
                  }]}
                  value={isWaitingForAfter ? heartRateAfter : heartRateBefore}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    if (isWaitingForAfter) {
                      setHeartRateAfter(numericValue);
                    } else {
                      setHeartRateBefore(numericValue);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Örn: 72"
                  placeholderTextColor={currentColors.placeholder}
                  maxLength={3}
                  autoFocus={true}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  accessibilityLabel="Kalp atışı girişi"
                  accessibilityHint="40 ile 200 arasında bir değer girin"
                />
                
                <Text style={[styles.modalHint, { color: currentColors.tertiary }]}>
                  Lütfen 40-200 arası bir değer girin
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: currentColors.brand }]} 
                    onPress={handleHeartRateSubmit}
                    accessibilityLabel={isWaitingForAfter ? 'Kaydet' : 'Sesi başlat'}
                    accessibilityRole="button"
                  >
                    <Text style={styles.modalButtonText}>
                      {isWaitingForAfter ? '📊 Kaydet' : '🎵 Başlat'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: currentColors.border }]}
                    onPress={() => {
                      resetSession();
                      if (isWaitingForAfter) {
                        cleanupSound();
                        setCurrentPlaying(null);
                        setProgress(0);
                      }
                    }}
                    accessibilityLabel="İptal"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.modalButtonText, { color: currentColors.primary }]}>
                      {isWaitingForAfter ? '❌ İptal' : '🚪 Vazgeç'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  offlineBanner: { padding: 8, alignItems: 'center' },
  offlineBannerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  header: { 
    padding: 16, 
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  playingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  playingIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: { flex: 1 },
  infoCard: { 
    flexDirection: 'row', 
    margin: 16, 
    padding: 16, 
    borderRadius: 12, 
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoIcon: { fontSize: 28, marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 18 },
  typesContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  typeCard: { 
    flex: 1, 
    borderRadius: 12, 
    padding: 12, 
    alignItems: 'center',
    justifyContent: 'center', 
    borderWidth: 2,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIcon: { fontSize: 32, marginBottom: 8 },
  typeName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  typeFreq: { fontSize: 11, marginBottom: 4, textAlign: 'center' },
  typeDesc: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
  section: { padding: 16, gap: 16 },
  soundCard: { 
    borderRadius: 12, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  soundHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  soundIcon: { fontSize: 32 },
  soundDuration: { fontSize: 12, fontWeight: '600' },
  soundName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, lineHeight: 24 },
  soundDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  freqGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  freqItem: { flex: 1, padding: 10, borderRadius: 8 },
  freqLabel: { fontSize: 11, marginBottom: 4 },
  freqValue: { fontSize: 14, fontWeight: 'bold' },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, textAlign: 'center' },
  playButton: { 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  playCount: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  warningCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  warningIcon: { fontSize: 24, marginRight: 12 },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  warningText: { fontSize: 13, lineHeight: 18 },
  tipCard: { 
    flexDirection: 'row', 
    margin: 16, 
    padding: 20, 
    borderRadius: 12, 
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipIcon: { fontSize: 32, marginRight: 16 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  tipText: { fontSize: 14, lineHeight: 20 },
  emptyCard: { 
    borderRadius: 12, 
    padding: 40, 
    alignItems: 'center', 
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: { 
    borderRadius: 16, 
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 15, marginBottom: 20, textAlign: 'center', lineHeight: 22 },
  modalInput: { 
    padding: 16, 
    borderRadius: 10, 
    borderWidth: 2, 
    fontSize: 18, 
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
