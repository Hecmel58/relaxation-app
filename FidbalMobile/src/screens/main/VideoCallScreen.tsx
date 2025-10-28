import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { collection, addDoc, query, where, onSnapshot, Timestamp, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';

export default function VideoCallScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');

  useEffect(() => {
    if (!user?.userId || callStatus !== 'waiting') return;

    // Video call durumunu dinle
    const q = query(
      collection(db, 'videoCalls'),
      where('userId', '==', user.userId),
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Call reddedildi veya bitti
        setCallStatus('idle');
        setShowVideoCall(false);
        setRoomId(null);
      }
    });

    return () => unsubscribe();
  }, [user?.userId, callStatus]);

  const handleStartVideoCall = async () => {
    if (!user?.userId) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    setLoading(true);
    try {
      const newRoomId = `FidBal-Support-${user.userId}-${Date.now()}`;

      // Firebase'e video call talebi kaydet
      await addDoc(collection(db, 'videoCalls'), {
        userId: user.userId,
        userName: user.name || 'Kullanıcı',
        roomId: newRoomId,
        status: 'waiting',
        createdAt: Timestamp.now()
      });

      setRoomId(newRoomId);
      setCallStatus('waiting');
      setShowVideoCall(true);
    } catch (error) {
      console.error('Video call start error:', error);
      Alert.alert('Hata', 'Görüntülü görüşme başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      if (user?.userId) {
        // Firebase'den call'u sil
        const q = query(
          collection(db, 'videoCalls'),
          where('userId', '==', user.userId),
          where('status', '==', 'waiting')
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(async (document) => {
          await deleteDoc(doc(db, 'videoCalls', document.id));
        });
      }

      setShowVideoCall(false);
      setCallStatus('idle');
      setRoomId(null);
    } catch (error) {
      console.error('End call error:', error);
    }
  };

  if (showVideoCall && roomId) {
    const jitsiUrl = `https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(user?.name || 'Kullanıcı')}`;

    return (
      <SafeAreaView style={styles.videoContainer} edges={['top', 'bottom']}>
        <View style={styles.videoHeader}>
          <Text style={styles.videoTitle}>Görüntülü Görüşme</Text>
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Text style={styles.endCallButtonText}>📞 Aramayı Bitir</Text>
          </TouchableOpacity>
        </View>

        {callStatus === 'waiting' && (
          <View style={styles.waitingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.waitingText}>Uzman bekleniyor...</Text>
            <Text style={styles.waitingSubtext}>
              Uzman katıldığında görüşme başlayacak
            </Text>
          </View>
        )}

        <WebView
          source={{ uri: jitsiUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Görüntülü Görüşme</Text>
        <Text style={styles.headerSubtitle}>Uzmanlarla yüz yüze görüşün</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.infoIcon}>🎥</Text>
          <Text style={styles.infoTitle}>Görüntülü Destek</Text>
          <Text style={styles.infoText}>
            Uyku uzmanlarımızla güvenli Jitsi Meet platformu üzerinden görüntülü görüşme yapabilirsiniz.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Uçtan uca şifreli bağlantı</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Kayıt yapılmaz</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Hafta içi 09:00-18:00</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={handleStartVideoCall}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.startButtonIcon}>📹</Text>
              <Text style={styles.startButtonText}>Görüşme Başlat</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <Text style={styles.noteIcon}>💡</Text>
          <Text style={styles.noteText}>
            Görüşme talebi gönderildiğinde, uygun uzman size katılacaktır. Lütfen bekleyiniz.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  content: { flex: 1, padding: 16 },
  infoSection: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  infoIcon: { fontSize: 64, marginBottom: 16 },
  infoTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  featuresSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  featureItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  featureIcon: { fontSize: 20, marginRight: 12 },
  featureText: { fontSize: 14, color: '#0f172a' },
  startButton: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  startButtonDisabled: { opacity: 0.6 },
  startButtonIcon: { fontSize: 24, marginRight: 8 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  noteCard: { flexDirection: 'row', backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a' },
  noteIcon: { fontSize: 20, marginRight: 8 },
  noteText: { flex: 1, fontSize: 13, color: '#92400e' },
  videoContainer: { flex: 1, backgroundColor: '#000' },
  videoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1e293b' },
  videoTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  endCallButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  endCallButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  webview: { flex: 1 },
  waitingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  waitingText: { color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 16 },
  waitingSubtext: { color: '#cbd5e1', fontSize: 14, marginTop: 8 },
});