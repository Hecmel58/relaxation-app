import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import api from '../../services/api';

export default function SleepScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSession, setNewSession] = useState({
    sleepTime: '23:00',
    wakeTime: '07:00',
    sleepQuality: 5,
    moodBefore: 3,
    moodAfter: 3,
    remSleep: '0',
    deepSleep: '0',
    lightSleep: '0',
    awakeTime: '0',
    heartRate: '0',
    stressLevel: 3,
    screenTime: '0',
    roomTemp: '20',
    lastMealTime: '',
    caffeine: false,
    alcohol: false,
    exercise: false,
    medication: false,
    meditation: false,
    reading: false,
    notes: '',
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await api.get('/sleep/sessions?limit=10');
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Sessions load error:', error);
    }
  };

  const handleAddSession = async () => {
    const totalSleep = (parseInt(newSession.remSleep) || 0) + 
                      (parseInt(newSession.deepSleep) || 0) + 
                      (parseInt(newSession.lightSleep) || 0);

    if (totalSleep === 0) {
      Alert.alert('Hata', 'Lütfen uyku sürelerini girin');
      return;
    }

    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        sleep_time: newSession.sleepTime,
        wake_time: newSession.wakeTime,
        sleep_quality: parseInt(newSession.sleepQuality.toString()),
        mood_before: parseInt(newSession.moodBefore.toString()),
        mood_after: parseInt(newSession.moodAfter.toString()),
        rem_duration: parseInt(newSession.remSleep) || 0,
        deep_sleep_duration: parseInt(newSession.deepSleep) || 0,
        light_sleep_duration: parseInt(newSession.lightSleep) || 0,
        awake_duration: parseInt(newSession.awakeTime) || 0,
        heart_rate: parseInt(newSession.heartRate) || 0,
        stress_level: parseInt(newSession.stressLevel.toString()),
        screen_time_before: parseInt(newSession.screenTime) || 0,
        room_temperature: parseFloat(newSession.roomTemp) || 20,
        last_meal_time: newSession.lastMealTime || null,
        caffeine_intake: newSession.caffeine,
        alcohol_intake: newSession.alcohol,
        exercise: newSession.exercise,
        medication: newSession.medication,
        meditation: newSession.meditation,
        reading: newSession.reading,
        notes: newSession.notes || null,
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      await api.post('/sleep/record', payload);
      
      setModalVisible(false);
      resetForm();
      loadSessions();
      Alert.alert('Başarılı', 'Uyku kaydı eklendi');
    } catch (error: any) {
      console.error('Add session error:', error.response?.data || error);
      Alert.alert('Hata', error.response?.data?.message || 'Kayıt eklenemedi');
    }
  };

  const resetForm = () => {
    setNewSession({
      sleepTime: '23:00',
      wakeTime: '07:00',
      sleepQuality: 5,
      moodBefore: 3,
      moodAfter: 3,
      remSleep: '0',
      deepSleep: '0',
      lightSleep: '0',
      awakeTime: '0',
      heartRate: '0',
      stressLevel: 3,
      screenTime: '0',
      roomTemp: '20',
      lastMealTime: '',
      caffeine: false,
      alcohol: false,
      exercise: false,
      medication: false,
      meditation: false,
      reading: false,
      notes: '',
    });
  };

  const totalSleepDuration = (parseInt(newSession.remSleep) || 0) + 
                            (parseInt(newSession.deepSleep) || 0) + 
                            (parseInt(newSession.lightSleep) || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Toplam Kayıt</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {sessions.length > 0 
                ? (sessions.reduce((acc, s) => acc + (s.sleep_quality || 0), 0) / sessions.length).toFixed(1)
                : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Ort. Kalite</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {sessions.length > 0 
                ? Math.floor(sessions.reduce((acc, s) => acc + (s.sleep_duration || 0), 0) / sessions.length / 60)
                : '0'}sa
            </Text>
            <Text style={styles.statLabel}>Ort. Uyku</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Yeni Kayıt</Text>
      </TouchableOpacity>

      <ScrollView style={styles.sessionsList}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>😴</Text>
            <Text style={styles.emptyText}>Henüz uyku kaydınız yok</Text>
          </View>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <Text style={styles.sessionDate}>
                {new Date(session.sleep_date).toLocaleDateString('tr-TR')}
              </Text>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDetail}>
                  ⏱ {Math.floor(session.sleep_duration / 60)}sa {session.sleep_duration % 60}dk
                </Text>
                <Text style={styles.sessionDetail}>
                  ⭐ {session.sleep_quality}/10
                </Text>
                {session.heart_rate > 0 && (
                  <Text style={styles.sessionDetail}>
                    ❤️ {session.heart_rate} bpm
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Yeni Uyku Kaydı</Text>
            <TouchableOpacity onPress={handleAddSession}>
              <Text style={styles.saveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
              
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={styles.inputLabel}>Yatma Saati</Text>
                  <TextInput
                    style={styles.input}
                    value={newSession.sleepTime}
                    onChangeText={(text) => setNewSession({...newSession, sleepTime: text})}
                    placeholder="22:00"
                  />
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.inputLabel}>Uyanma Saati</Text>
                  <TextInput
                    style={styles.input}
                    value={newSession.wakeTime}
                    onChangeText={(text) => setNewSession({...newSession, wakeTime: text})}
                    placeholder="07:00"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Genel Uyku Kalitesi: {newSession.sleepQuality}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={newSession.sleepQuality}
                onValueChange={(value) => setNewSession({...newSession, sleepQuality: value})}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#e2e8f0"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uyku Aşamaları (Dakika)</Text>
              
              <Text style={styles.inputLabel}>REM Uykusu</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSession.remSleep}
                onChangeText={(text) => setNewSession({...newSession, remSleep: text})}
                placeholder="0"
              />

              <Text style={styles.inputLabel}>Derin Uyku</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSession.deepSleep}
                onChangeText={(text) => setNewSession({...newSession, deepSleep: text})}
                placeholder="0"
              />

              <Text style={styles.inputLabel}>Hafif Uyku</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSession.lightSleep}
                onChangeText={(text) => setNewSession({...newSession, lightSleep: text})}
                placeholder="0"
              />

              <Text style={styles.inputLabel}>Uyanık Kalma Süresi</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSession.awakeTime}
                onChangeText={(text) => setNewSession({...newSession, awakeTime: text})}
                placeholder="0"
              />

              <View style={styles.totalSleep}>
                <Text style={styles.totalSleepLabel}>Toplam Uyku Süresi</Text>
                <Text style={styles.totalSleepValue}>
                  {Math.floor(totalSleepDuration / 60)}sa {totalSleepDuration % 60}dk
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sağlık Verileri</Text>
              
              <Text style={styles.inputLabel}>Kalp Atım Hızı (bpm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSession.heartRate}
                onChangeText={(text) => setNewSession({...newSession, heartRate: text})}
                placeholder="0"
              />

              <Text style={styles.inputLabel}>Uyku Öncesi Ruh Hali: {newSession.moodBefore}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={newSession.moodBefore}
                onValueChange={(value) => setNewSession({...newSession, moodBefore: value})}
                minimumTrackTintColor="#3b82f6"
              />

              <Text style={styles.inputLabel}>Uyanış Sonrası Ruh Hali: {newSession.moodAfter}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={newSession.moodAfter}
                onValueChange={(value) => setNewSession({...newSession, moodAfter: value})}
                minimumTrackTintColor="#10b981"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Etkileyen Faktörler</Text>
              
              <Text style={styles.inputLabel}>Stres Seviyesi: {newSession.stressLevel}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={newSession.stressLevel}
                onValueChange={(value) => setNewSession({...newSession, stressLevel: value})}
                minimumTrackTintColor="#ef4444"
              />

              <Text style={styles.inputLabel}>Ekran Süresi (dk - Uyku öncesi 2 saat)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSession.screenTime}
                onChangeText={(text) => setNewSession({...newSession, screenTime: text})}
                placeholder="0"
              />

              <Text style={styles.inputLabel}>Oda Sıcaklığı (°C)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSession.roomTemp}
                onChangeText={(text) => setNewSession({...newSession, roomTemp: text})}
                placeholder="20"
              />

              <Text style={styles.inputLabel}>Son Yemek Saati</Text>
              <TextInput
                style={styles.input}
                value={newSession.lastMealTime}
                onChangeText={(text) => setNewSession({...newSession, lastMealTime: text})}
                placeholder="20:00"
              />

              <View style={styles.checkboxGroup}>
                {[
                  { key: 'caffeine', label: 'Kafein tükettim (öğleden sonra)' },
                  { key: 'alcohol', label: 'Alkol tükettim' },
                  { key: 'exercise', label: 'Egzersiz yaptım' },
                  { key: 'medication', label: 'İlaç kullandım' },
                  { key: 'meditation', label: 'Meditasyon/nefes egzersizi yaptım' },
                  { key: 'reading', label: 'Kitap okudum' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.checkbox}
                    onPress={() => setNewSession({
                      ...newSession,
                      [item.key]: !newSession[item.key as keyof typeof newSession]
                    })}
                  >
                    <View style={[styles.checkboxBox, newSession[item.key as keyof typeof newSession] && styles.checkboxBoxChecked]}>
                      {newSession[item.key as keyof typeof newSession] && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Uykuyla ilgili dikkat çekici bir şey var mı?"
                multiline
                numberOfLines={4}
                value={newSession.notes}
                onChangeText={(text) => setNewSession({...newSession, notes: text})}
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  addButton: { backgroundColor: '#3b82f6', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sessionsList: { flex: 1, padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#64748b' },
  sessionCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  sessionDate: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  sessionDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  sessionDetail: { fontSize: 14, color: '#64748b' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  cancelText: { fontSize: 16, color: '#64748b' },
  saveText: { fontSize: 16, color: '#3b82f6', fontWeight: '600' },
  modalContent: { flex: 1 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 8 },
  textArea: { height: 100, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeInput: { flex: 1 },
  slider: { width: '100%', height: 40 },
  totalSleep: { backgroundColor: '#dbeafe', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  totalSleepLabel: { fontSize: 16, fontWeight: '600', color: '#1e40af' },
  totalSleepValue: { fontSize: 24, fontWeight: 'bold', color: '#1e40af' },
  checkboxGroup: { marginTop: 8 },
  checkbox: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkboxBox: { width: 24, height: 24, borderWidth: 2, borderColor: '#cbd5e1', borderRadius: 6, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxBoxChecked: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 14, color: '#0f172a' },
});