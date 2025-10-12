import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import VideoCall from '../../components/VideoCall';

export default function VideoCallScreen({ route, navigation }: any) {
  const { roomName, expertName } = route.params || {};
  const [callActive, setCallActive] = useState(false);

  const startCall = () => {
    Alert.alert(
      'Görüntülü Görüşme',
      `${expertName} ile görüşmeyi başlatmak istiyor musunuz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Başlat',
          onPress: () => setCallActive(true),
        },
      ]
    );
  };

  const endCall = () => {
    setCallActive(false);
    Alert.alert(
      'Görüşme Sona Erdi',
      'Görüşme başarıyla tamamlandı.',
      [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (callActive) {
    return <VideoCall roomName={roomName} onCallEnd={endCall} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📹</Text>
        <Text style={styles.title}>Görüntülü Görüşme</Text>
        <Text style={styles.expertName}>{expertName}</Text>
        <Text style={styles.roomInfo}>Oda: {roomName}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Görüşme öncesi kontrol edin:</Text>
          <Text style={styles.infoItem}>✓ Kamera izni verildi</Text>
          <Text style={styles.infoItem}>✓ Mikrofon izni verildi</Text>
          <Text style={styles.infoItem}>✓ İnternet bağlantısı stabil</Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startCall}>
          <Text style={styles.startButtonText}>Görüşmeyi Başlat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  expertName: {
    fontSize: 20,
    color: '#3b82f6',
    marginBottom: 8,
  },
  roomInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});