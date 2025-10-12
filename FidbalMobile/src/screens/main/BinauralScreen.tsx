import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function BinauralScreen() {
  const user = useAuthStore((state) => state.user);
  const [sounds, setSounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('delta');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const brainwaveTypes = [
    { id: 'delta', name: 'Delta', freq: '0.5-4 Hz', icon: '🌙', desc: 'Derin uyku' },
    { id: 'theta', name: 'Theta', freq: '4-8 Hz', icon: '🌅', desc: 'Meditasyon' },
    { id: 'alpha', name: 'Alpha', freq: '8-13 Hz', icon: '☀️', desc: 'Rahatlama' },
  ];

  const testSounds: any = {
    delta: [
      { id: '1', name: 'Derin Uyku 1Hz', description: 'Delta dalgası', base_frequency: 100, binaural_frequency: 1, duration: 3600, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
      { id: '2', name: 'Tam Gevşeme 0.5Hz', description: 'Ultra düşük frekans', base_frequency: 100, binaural_frequency: 0.5, duration: 3600, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    ],
    theta: [
      { id: '3', name: 'REM Uyku 6Hz', description: 'Theta dalgası', base_frequency: 200, binaural_frequency: 6, duration: 2400, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
      { id: '4', name: 'Meditasyon 7Hz', description: 'Derin meditasyon', base_frequency: 200, binaural_frequency: 7, duration: 1800, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
    ],
    alpha: [
      { id: '5', name: 'Rahat Uyanıklık 10Hz', description: 'Alpha dalgası', base_frequency: 200, binaural_frequency: 10, duration: 1800, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
      { id: '6', name: 'Odaklanma 12Hz', description: 'Konsantrasyon', base_frequency: 200, binaural_frequency: 12, duration: 1800, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
    ],
  };

  useEffect(() => {
    loadSounds();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [selectedType]);

  const loadSounds = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/binaural/sounds?category=${selectedType}`);
      const apiSounds = response.data.sounds || [];
      setSounds(apiSounds.length > 0 ? apiSounds : testSounds[selectedType]);
    } catch (error) {
      setSounds(testSounds[selectedType]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (item: any) => {
    try {
      if (playingId === item.id) {
        await sound?.pauseAsync();
        setPlayingId(null);
      } else {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: item.url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setPlayingId(item.id);
        
        newSound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            setPlayingId(null);
          }
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Ses dosyası oynatılamadı. Kulaklık takın.');
    }
  };

  if (!user?.isAdmin && user?.abGroup !== 'experiment') {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedIcon}>🔒</Text>
        <Text style={styles.lockedTitle}>Beta Özellik</Text>
        <Text style={styles.lockedText}>
          Binaural sesler seçili kullanıcılara test ediliyor
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Binaural Sesler Nedir?</Text>
          <Text style={styles.infoText}>
            Her kulağa farklı frekansta ses göndererek beyninizin belirli frekansı oluşturmasını sağlar.
          </Text>
          <Text style={styles.infoWarning}>⚠️ Kulaklık kullanmanız gerekir!</Text>
        </View>
      </View>

      <View style={styles.typesContainer}>
        {brainwaveTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              selectedType === type.id && styles.typeCardActive,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={styles.typeName}>{type.name}</Text>
            <Text style={styles.typeFreq}>{type.freq}</Text>
            <Text style={styles.typeDesc}>{type.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.soundsScroll}>
        {sounds.map((item) => (
          <View key={item.id} style={styles.soundCard}>
            <Text style={styles.soundIcon}>🎵</Text>
            <View style={styles.soundInfo}>
              <Text style={styles.soundName}>{item.name}</Text>
              <Text style={styles.soundDescription}>{item.description}</Text>
              <View style={styles.frequencies}>
                <Text style={styles.freqText}>Baz: {item.base_frequency} Hz</Text>
                <Text style={styles.freqText}>Binaural: {item.binaural_frequency} Hz</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.playButton,
                playingId === item.id && styles.playButtonActive,
              ]}
              onPress={() => handlePlay(item)}
            >
              <Text style={styles.playButtonText}>
                {playingId === item.id ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1e3a8a',
    marginBottom: 8,
  },
  infoWarning: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991b1b',
  },
  typesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  typeCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  typeFreq: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  typeDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  soundsScroll: {
    flex: 1,
    padding: 16,
  },
  soundCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  soundIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  soundDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  frequencies: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  freqText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  playButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#64748b',
  },
  playButtonText: {
    fontSize: 20,
  },
});