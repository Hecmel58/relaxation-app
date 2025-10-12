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

export default function RelaxationScreen() {
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('breathing');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = [
    { id: 'breathing', name: 'Nefes', icon: '🌬️' },
    { id: 'meditation', name: 'Meditasyon', icon: '🧘' },
    { id: 'nature_sound', name: 'Doğa', icon: '🌊' },
  ];

  const testContent: any = {
    breathing: [
      { id: '1', title: '4-7-8 Nefes Tekniği', description: 'Stres azaltma', duration: 240, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: '2', title: 'Derin Karın Nefesi', description: 'Rahatlama', duration: 300, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    ],
    meditation: [
      { id: '3', title: 'Uyku Meditasyonu', description: '10 dakika', duration: 600, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: '4', title: 'Beden Taraması', description: 'Kas gevşetme', duration: 900, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    ],
    nature_sound: [
      { id: '5', title: 'Yağmur Sesi', description: 'Sakinleştirici', duration: 3600, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { id: '6', title: 'Dalga Sesi', description: 'Rahatlatıcı', duration: 3600, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    ],
  };

  useEffect(() => {
    loadContent();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [selectedCategory]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/relaxation/content?category=${selectedCategory}`);
      const apiContent = response.data.content || [];
      setContent(apiContent.length > 0 ? apiContent : testContent[selectedCategory]);
    } catch (error) {
      setContent(testContent[selectedCategory]);
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
      Alert.alert('Hata', 'Ses dosyası oynatılamadı');
    }
  };

  if (!user?.isAdmin && user?.abGroup !== 'experiment') {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedIcon}>🔒</Text>
        <Text style={styles.lockedTitle}>Beta Özellik</Text>
        <Text style={styles.lockedText}>
          Rahatlama merkezi seçili kullanıcılara test ediliyor
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.contentScroll}>
        {content.map((item) => (
          <View key={item.id} style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <View>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentDescription}>{item.description}</Text>
              </View>
              <Text style={styles.duration}>{Math.floor(item.duration / 60)} dk</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.playButton,
                playingId === item.id && styles.playButtonActive,
              ]}
              onPress={() => handlePlay(item)}
            >
              <Text style={styles.playButtonIcon}>
                {playingId === item.id ? '⏸' : '▶'}
              </Text>
              <Text style={styles.playButtonText}>
                {playingId === item.id ? 'Durdur' : 'Başlat'}
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
    backgroundColor: '#f8fafc',
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
  categoriesContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 12,
  },
  categoryTextActive: {
    color: '#fff',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  duration: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#64748b',
  },
  playButtonIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});