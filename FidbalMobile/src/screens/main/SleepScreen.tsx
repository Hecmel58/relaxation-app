import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../store/themeStore';
import { useOfflineStore } from '../../store/offlineStore';
import { colors } from '../../utils/colors';
import SkeletonLoader from '../../components/SkeletonLoader';
import Toast from '../../components/Toast';
import api from '../../services/api';

interface SleepSession {
  id: number;
  sleep_date: string;
  sleep_time?: string;
  wake_time?: string;
  sleep_quality: number;
  sleep_duration?: number;
  rem_duration?: number;
  deep_sleep_duration?: number;
  light_sleep_duration?: number;
  awake_duration?: number;
  heart_rate?: number;
  stress_level?: number;
  mood_before?: number;
  mood_after?: number;
  screen_time_before?: number;
  room_temperature?: number;
  last_meal_time?: string;
  caffeine_intake?: boolean;
  alcohol_intake?: boolean;
  exercise?: boolean;
  medication?: boolean;
  meditation?: boolean;
  reading?: boolean;
  notes?: string;
  sleep_efficiency?: number;
  created_at: string;
}

export default function SleepScreen() {
  const isDark = useThemeStore((state) => state.isDark);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const addPendingRequest = useOfflineStore((state) => state.addPendingRequest);
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const [formData, setFormData] = useState({
    date: new Date(),
    sleep_time: '',
    wake_time: '',
    sleep_quality: '',
    mood_before: '',
    mood_after: '',
    rem_duration: '',
    deep_sleep_duration: '',
    light_sleep_duration: '',
    awake_duration: '',
    heart_rate: '',
    stress_level: '',
    screen_time_before: '',
    room_temperature: '',
    last_meal_time: '',
    caffeine_intake: false,
    alcohol_intake: false,
    exercise: false,
    medication: false,
    meditation: false,
    reading: false,
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Haptics.notificationAsync(
      type === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
  };

  const loadSessions = async () => {
    try {
      if (!isOnline) {
        showToast('Offline modasınız. Veriler güncel olmayabilir.', 'warning');
        setLoading(false);
        return;
      }

      const response = await api.get('/sleep/sessions');
      setSessions(response.data.sessions || []);
    } catch (error: any) {
      console.error('❌ Load sessions error:', error);
      showToast('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadSessions();
  }, []);

  const handleSubmit = async () => {
    const quality = parseInt(formData.sleep_quality);
    if (!formData.sleep_quality || quality < 1 || quality > 10) {
      showToast('Uyku kalitesi 1-10 arası olmalıdır', 'error');
      return;
    }

    if (formData.mood_before && (parseInt(formData.mood_before) < 1 || parseInt(formData.mood_before) > 5)) {
      showToast('Ruhsal durum 1-5 arası olmalıdır', 'error');
      return;
    }

    if (formData.mood_after && (parseInt(formData.mood_after) < 1 || parseInt(formData.mood_after) > 5)) {
      showToast('Ruhsal durum 1-5 arası olmalıdır', 'error');
      return;
    }

    if (formData.heart_rate && (parseInt(formData.heart_rate) < 30 || parseInt(formData.heart_rate) > 250)) {
      showToast('Kalp atışı 30-250 bpm arası olmalıdır', 'error');
      return;
    }

    if (formData.stress_level && (parseInt(formData.stress_level) < 1 || parseInt(formData.stress_level) > 10)) {
      showToast('Stres seviyesi 1-10 arası olmalıdır', 'error');
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = {
        date: formData.date.toISOString().split('T')[0],
        sleep_time: formData.sleep_time || undefined,
        wake_time: formData.wake_time || undefined,
        sleep_quality: parseInt(formData.sleep_quality),
        mood_before_sleep: formData.mood_before ? parseInt(formData.mood_before) : undefined,
        mood_after_sleep: formData.mood_after ? parseInt(formData.mood_after) : undefined,
        rem_duration: formData.rem_duration ? parseInt(formData.rem_duration) : 0,
        deep_sleep_duration: formData.deep_sleep_duration ? parseInt(formData.deep_sleep_duration) : 0,
        light_sleep_duration: formData.light_sleep_duration ? parseInt(formData.light_sleep_duration) : 0,
        awake_duration: formData.awake_duration ? parseInt(formData.awake_duration) : 0,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : 0,
        stress_level: formData.stress_level ? parseInt(formData.stress_level) : undefined,
        screen_time: formData.screen_time_before ? parseInt(formData.screen_time_before) : 0,
        room_temperature: formData.room_temperature ? parseInt(formData.room_temperature) : 20,
        meal_time: formData.last_meal_time || undefined,
        caffeine_intake: formData.caffeine_intake,
        alcohol_intake: formData.alcohol_intake,
        exercise_done: formData.exercise,
        medication_taken: formData.medication,
        meditation_done: formData.meditation,
        reading_done: formData.reading,
        notes: formData.notes || '',
      };

      console.log('📤 Gönderilen payload:', payload);

      if (isOnline) {
        await api.post('/sleep/sessions', payload);
        showToast('Uyku kaydı oluşturuldu!', 'success');
        setShowForm(false);
        loadSessions();
        resetForm();
      } else {
        await addPendingRequest({
          endpoint: '/sleep/sessions',
          method: 'POST',
          data: payload,
        });
        showToast('Offline modda kaydedildi. Online olunca gönderilecek.', 'warning');
        setShowForm(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      console.error('❌ Error response:', error.response?.data);
      showToast(error.response?.data?.error || error.response?.data?.details || 'Kayıt eklenemedi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      sleep_time: '',
      wake_time: '',
      sleep_quality: '',
      mood_before: '',
      mood_after: '',
      rem_duration: '',
      deep_sleep_duration: '',
      light_sleep_duration: '',
      awake_duration: '',
      heart_rate: '',
      stress_level: '',
      screen_time_before: '',
      room_temperature: '',
      last_meal_time: '',
      caffeine_intake: false,
      alcohol_intake: false,
      exercise: false,
      medication: false,
      meditation: false,
      reading: false,
      notes: '',
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0sa 0dk';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}sa ${mins}dk`;
  };

  const totalSessions = sessions.length;
  const avgQuality =
    totalSessions > 0 ? (sessions.reduce((sum, s) => sum + s.sleep_quality, 0) / totalSessions).toFixed(1) : '0';
  const avgDuration =
    totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.sleep_duration || 0), 0) / totalSessions) : 0;

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
          <Text style={styles.offlineBannerText}>📡 Offline Mod</Text>
        </View>
      )}

      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: currentColors.primary }]}>Uyku Kaydı</Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.secondary }]}>Detaylı uyku takibi</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: currentColors.brand }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowForm(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Yeni</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe' }]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: currentColors.info }]}>{totalSessions}</Text>
            <Text style={[styles.statLabel, { color: currentColors.secondary }]}>Kayıt</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5' }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={[styles.statValue, { color: currentColors.success }]}>{avgQuality}/10</Text>
            <Text style={[styles.statLabel, { color: currentColors.secondary }]}>Kalite</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7' }]}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={[styles.statValue, { color: currentColors.warning }]}>{formatDuration(avgDuration)}</Text>
            <Text style={[styles.statLabel, { color: currentColors.secondary }]}>Ort.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>
            Son Kayıtlar {totalSessions > 0 && `(${totalSessions})`}
          </Text>

          {totalSessions === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
              <Text style={styles.emptyIcon}>😴</Text>
              <Text style={[styles.emptyTitle, { color: currentColors.primary }]}>Henüz kayıt yok</Text>
              <Text style={[styles.emptyText, { color: currentColors.secondary }]}>İlk uyku kaydınızı ekleyin!</Text>
            </View>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={[styles.sessionCard, { backgroundColor: currentColors.card }]}>
                <View style={styles.sessionLeft}>
                  <Text style={[styles.sessionDate, { color: currentColors.primary }]}>{formatDate(session.sleep_date)}</Text>
                  <View style={styles.sessionDetails}>
                    <Text style={[styles.sessionDetail, { color: currentColors.secondary }]}>
                      💤 {formatDuration(session.sleep_duration || 0)}
                    </Text>
                    {session.heart_rate && session.heart_rate > 0 && (
                      <Text style={[styles.sessionDetail, { color: currentColors.secondary }]}>🫀 {session.heart_rate}</Text>
                    )}
                  </View>
                  {session.notes && (
                    <Text style={[styles.sessionNotes, { color: currentColors.tertiary }]} numberOfLines={1}>
                      "{session.notes}"
                    </Text>
                  )}
                </View>
                <View style={styles.sessionRight}>
                  <Text style={[styles.sessionQuality, { color: currentColors.brand }]}>{session.sleep_quality}/10</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={showForm} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowForm(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: currentColors.background }]} edges={['top', 'bottom']}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
              <Text style={[styles.modalTitle, { color: currentColors.primary }]}>Yeni Uyku Kaydı</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={[styles.closeButton, { color: currentColors.brand }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
              style={styles.formContent}
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={100}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: currentColors.primary }]}>📅 Tarih</Text>
                <TouchableOpacity
                  style={[styles.input, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.inputText, { color: currentColors.primary }]}>
                    {formData.date.toLocaleDateString('tr-TR')}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.date}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setFormData({ ...formData, date });
                    }}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: currentColors.primary }]}>
                  ⭐ Uyku Kalitesi (1-10) <Text style={{ color: currentColors.error }}>*</Text>
                </Text>
                <View style={styles.ratingButtons}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.ratingButton,
                        { borderColor: currentColors.border },
                        formData.sleep_quality === value.toString() && { backgroundColor: currentColors.brand },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFormData({ ...formData, sleep_quality: value.toString() });
                      }}
                    >
                      <Text
                        style={[
                          styles.ratingButtonText,
                          { color: currentColors.primary },
                          formData.sleep_quality === value.toString() && { color: '#fff', fontWeight: 'bold' },
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={[styles.sectionHeader, { color: currentColors.primary }]}>⏱️ Uyku Süreleri (dakika)</Text>
              <View style={styles.durationGrid}>
                <View style={styles.durationItem}>
                  <Text style={[styles.durationLabel, { color: currentColors.secondary }]}>REM</Text>
                  <TextInput
                    style={[styles.durationInput, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.rem_duration}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 1440) {
                        setFormData({ ...formData, rem_duration: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>
                <View style={styles.durationItem}>
                  <Text style={[styles.durationLabel, { color: currentColors.secondary }]}>Derin</Text>
                  <TextInput
                    style={[styles.durationInput, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.deep_sleep_duration}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 1440) {
                        setFormData({ ...formData, deep_sleep_duration: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="330"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>
                <View style={styles.durationItem}>
                  <Text style={[styles.durationLabel, { color: currentColors.secondary }]}>Hafif</Text>
                  <TextInput
                    style={[styles.durationInput, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.light_sleep_duration}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 1440) {
                        setFormData({ ...formData, light_sleep_duration: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>
                <View style={styles.durationItem}>
                  <Text style={[styles.durationLabel, { color: currentColors.secondary }]}>Uyanık</Text>
                  <TextInput
                    style={[styles.durationInput, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.awake_duration}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 1440) {
                        setFormData({ ...formData, awake_duration: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="20"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>
              </View>

              <Text style={[styles.sectionHeader, { color: currentColors.primary }]}>😊 Ruhsal Durum (1-5)</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.formLabel, { color: currentColors.secondary }]}>Uyumadan Önce</Text>
                  <View style={styles.moodButtons}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.moodButton,
                          { borderColor: currentColors.border },
                          formData.mood_before === value.toString() && { backgroundColor: currentColors.brand },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setFormData({ ...formData, mood_before: value.toString() });
                        }}
                      >
                        <Text
                          style={[
                            styles.moodButtonText,
                            { color: currentColors.primary },
                            formData.mood_before === value.toString() && { color: '#fff' },
                          ]}
                        >
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.halfWidth}>
                  <Text style={[styles.formLabel, { color: currentColors.secondary }]}>Uyandıktan Sonra</Text>
                  <View style={styles.moodButtons}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.moodButton,
                          { borderColor: currentColors.border },
                          formData.mood_after === value.toString() && { backgroundColor: currentColors.brand },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setFormData({ ...formData, mood_after: value.toString() });
                        }}
                      >
                        <Text
                          style={[
                            styles.moodButtonText,
                            { color: currentColors.primary },
                            formData.mood_after === value.toString() && { color: '#fff' },
                          ]}
                        >
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={[styles.sectionHeader, { color: currentColors.primary }]}>🫀 Sağlık Verileri</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.formLabel, { color: currentColors.secondary }]}>Kalp Atışı (bpm)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.heart_rate}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 250) {
                        setFormData({ ...formData, heart_rate: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="77"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={[styles.formLabel, { color: currentColors.secondary }]}>Stres (1-10)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.stress_level}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 10) {
                        setFormData({ ...formData, stress_level: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>
              </View>

              <Text style={[styles.sectionHeader, { color: currentColors.primary }]}>🌡️ Çevre Koşulları</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.formLabel, { color: currentColors.secondary }]}>Ekran Süresi (dk)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.screen_time_before}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 1440) {
                        setFormData({ ...formData, screen_time_before: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={[styles.formLabel, { color: currentColors.secondary }]}>Sıcaklık (°C)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                    value={formData.room_temperature}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= -10 && num <= 50) {
                        setFormData({ ...formData, room_temperature: text });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="20"
                    placeholderTextColor={currentColors.placeholder}
                  />
                </View>
              </View>

              <Text style={[styles.sectionHeader, { color: currentColors.primary }]}>📋 Aktiviteler</Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: currentColors.secondary }]}>☕ Kafein</Text>
                  <Switch
                    value={formData.caffeine_intake}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({ ...formData, caffeine_intake: value });
                    }}
                    trackColor={{ false: currentColors.border, true: currentColors.brand }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: currentColors.secondary }]}>🍷 Alkol</Text>
                  <Switch
                    value={formData.alcohol_intake}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({ ...formData, alcohol_intake: value });
                    }}
                    trackColor={{ false: currentColors.border, true: currentColors.brand }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: currentColors.secondary }]}>🏃 Egzersiz</Text>
                  <Switch
                    value={formData.exercise}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({ ...formData, exercise: value });
                    }}
                    trackColor={{ false: currentColors.border, true: currentColors.brand }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: currentColors.secondary }]}>💊 İlaç</Text>
                  <Switch
                    value={formData.medication}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({ ...formData, medication: value });
                    }}
                    trackColor={{ false: currentColors.border, true: currentColors.brand }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: currentColors.secondary }]}>🧘 Meditasyon</Text>
                  <Switch
                    value={formData.meditation}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({ ...formData, meditation: value });
                    }}
                    trackColor={{ false: currentColors.border, true: currentColors.brand }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: currentColors.secondary }]}>📖 Okuma</Text>
                  <Switch
                    value={formData.reading}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({ ...formData, reading: value });
                    }}
                    trackColor={{ false: currentColors.border, true: currentColors.brand }}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: currentColors.primary }]}>📝 Notlar (Opsiyonel)</Text>
                <TextInput
                  style={[styles.notesInput, { backgroundColor: currentColors.input, borderColor: currentColors.inputBorder, color: currentColors.primary }]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Uykunuzla ilgili notlar..."
                  placeholderTextColor={currentColors.placeholder}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>
            </KeyboardAwareScrollView>

            <View style={[styles.modalFooter, { backgroundColor: currentColors.surface, borderTopColor: currentColors.border }]}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: currentColors.brand }, !formData.sleep_quality && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={submitting || !formData.sleep_quality}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>💾 Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  offlineBanner: { padding: 8, alignItems: 'center' },
  offlineBannerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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
  sessionCard: { borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sessionLeft: { flex: 1 },
  sessionDate: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  sessionDetails: { flexDirection: 'row', gap: 10 },
  sessionDetail: { fontSize: 12 },
  sessionNotes: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  sessionRight: { justifyContent: 'center' },
  sessionQuality: { fontSize: 22, fontWeight: 'bold' },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { fontSize: 28, fontWeight: 'bold' },
  formContent: { flex: 1, padding: 16 },
  formGroup: { marginBottom: 18 },
  formLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', marginTop: 8, marginBottom: 12 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, fontSize: 15 },
  inputText: { fontSize: 15 },
  ratingButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingButton: { width: 42, height: 42, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  ratingButtonText: { fontSize: 14 },
  durationGrid: { flexDirection: 'row', gap: 8 },
  durationItem: { flex: 1 },
  durationLabel: { fontSize: 11, marginBottom: 4, textAlign: 'center' },
  durationInput: { padding: 10, borderRadius: 8, borderWidth: 1, fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  halfWidth: { flex: 1 },
  moodButtons: { flexDirection: 'row', gap: 6 },
  moodButton: { flex: 1, height: 38, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  moodButtonText: { fontSize: 13 },
  switchGroup: { gap: 10 },
  switchItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  switchLabel: { fontSize: 14 },
  notesInput: { padding: 12, borderRadius: 8, borderWidth: 1, fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  modalFooter: { padding: 16, borderTopWidth: 1 },
  submitButton: { padding: 16, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});