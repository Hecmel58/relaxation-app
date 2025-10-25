import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
  QuerySnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { WebView } from 'react-native-webview';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'expert';
  timestamp: any;
  userName?: string;
}

interface VideoCall {
  id: string;
  status: 'waiting' | 'accepted' | 'rejected';
  roomId: string;
  createdAt: any;
}

export default function SupportScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [videoCallStatus, setVideoCallStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // ✅ Cleanup refs
  const unsubMessagesRef = useRef<(() => void) | null>(null);
  const unsubVideoCallsRef = useRef<(() => void) | null>(null);

  // ✅ MESAJLARI DİNLE
  useEffect(() => {
    if (!user?.userId || !db) return;

    console.log('📱 Firebase mesajları dinleniyor...');

    const messagesQuery = query(
      collection(db, 'messages'),
      where('userId', '==', user.userId),
      orderBy('timestamp', 'asc')
    );

    const unsubMessages = onSnapshot(
      messagesQuery,
      (snapshot: QuerySnapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        console.log('📨 Mesajlar güncellendi:', msgs.length);
        setMessages(msgs);

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.error('❌ Messages firebase error:', error);
      }
    );

    unsubMessagesRef.current = unsubMessages;

    return () => {
      if (unsubMessagesRef.current) {
        unsubMessagesRef.current();
      }
    };
  }, [user?.userId]);

  // ✅ VİDEO CALL DURUMUNU DİNLE
  useEffect(() => {
    if (!user?.userId || !db) return;

    console.log('📞 Firebase video calls dinleniyor...');

    const videoCallsQuery = query(
      collection(db, 'videoCalls'),
      where('userId', '==', user.userId)
    );

    const unsubVideoCalls = onSnapshot(
      videoCallsQuery,
      async (snapshot: QuerySnapshot) => {
        console.log('📞 Video calls güncellendi, docs sayısı:', snapshot.docs.length);

        // Hiç doküman yoksa state'leri temizle
        if (snapshot.docs.length === 0 && videoCallStatus === 'idle') {
          setShowVideoCall(false);
          setRoomId('');
          setCurrentCallId(null);
          return;
        }

        for (const docSnapshot of snapshot.docs) {
          const call = docSnapshot.data() as VideoCall;
          const callId = docSnapshot.id;

          console.log('📞 Video call durumu:', {
            id: callId,
            status: call.status,
            roomId: call.roomId
          });

          // ✅ ADMIN KABUL ETTİ - Admin aynı odaya katılacak
          if (call.status === 'accepted' && call.roomId) {
            console.log('✅ ADMIN KABUL ETTİ! Admin odaya katılıyor...');
            setVideoCallStatus('connected');

            // Overlay'i kaldır, admin katıldı
            // Jitsi zaten açık, sadece status güncellendi

            // Birkaç saniye sonra Firebase'den temizle (görüşme başladıktan sonra)
            setTimeout(async () => {
              try {
                await deleteDoc(doc(db, 'videoCalls', callId));
                console.log('✅ Görüşme başladı, Firebase kaydı temizlendi');
              } catch (e) {
                console.error('Cleanup error:', e);
              }
            }, 5000); // 5 saniye sonra temizle

            break;
          }

          // ❌ ADMIN REDDETTİ
          if (call.status === 'rejected') {
            console.log('❌ Admin reddetti');
            Alert.alert('Reddedildi', 'Uzman görüşmeyi reddetti');

            // Jitsi'yi kapat
            setShowVideoCall(false);
            setVideoCallStatus('idle');
            setCurrentCallId(null);
            setRoomId('');

            // Firebase'den sil
            try {
              await deleteDoc(doc(db, 'videoCalls', callId));
            } catch (e) {
              console.error('Delete error:', e);
            }
            break;
          }

          // ⏳ BEKLEME DURUMU - Jitsi açık, admin bekleniyor
          if (call.status === 'waiting' && showVideoCall) {
            console.log('⏳ Admin bekleniyor, Jitsi açık...');
            setCurrentCallId(callId);
            setVideoCallStatus('waiting');
            // Jitsi zaten açık, kullanıcı bekliyor
          }
        }
      },
      (error) => {
        console.error('❌ Video calls firebase error:', error);
      }
    );

    unsubVideoCallsRef.current = unsubVideoCalls;

    return () => {
      if (unsubVideoCallsRef.current) {
        unsubVideoCallsRef.current();
      }
    };
  }, [user?.userId, showVideoCall, videoCallStatus]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.userId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        userId: user.userId,
        userName: user.name || 'Kullanıcı',
        sender: 'user',
        timestamp: Timestamp.now()
      });

      console.log('✅ Mesaj gönderildi');
      setNewMessage('');

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('❌ Send message error:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideoCall = async () => {
    if (!user?.userId) return;

    if (videoCallStatus === 'waiting') {
      Alert.alert('Bekliyor', 'Video call talebiniz zaten gönderildi. Uzman kabul etmesini bekleyin.');
      return;
    }

    const newRoomId = `FidBal-Support-${user.userId}-${Date.now()}`;

    try {
      console.log('📞 Video call talebi gönderiliyor...', {
        userId: user.userId,
        userName: user.name,
        roomId: newRoomId
      });

      // Firebase'e video call talebi kaydet
      const docRef = await addDoc(collection(db, 'videoCalls'), {
        userId: user.userId,
        userName: user.name || 'Kullanıcı',
        roomId: newRoomId,
        status: 'waiting',
        createdAt: Timestamp.now()
      });

      console.log('✅ Video call talebi kaydedildi, ID:', docRef.id);

      setCurrentCallId(docRef.id);
      setRoomId(newRoomId);
      setVideoCallStatus('waiting');

      // HEMEN Jitsi Meet'i aç! Kullanıcı orada bekleyecek
      setShowVideoCall(true);

      // Alert gösterme, çünkü Jitsi açılıyor zaten
    } catch (error) {
      console.error('❌ Video call start error:', error);
      Alert.alert('Hata', 'Görüntülü görüşme başlatılamadı: ' + error);
      setVideoCallStatus('idle');
      setCurrentCallId(null);
      setRoomId('');
      setShowVideoCall(false);
    }
  };

  const handleCancelVideoCall = async () => {
    if (!currentCallId) return;

    try {
      console.log('❌ Video call iptal ediliyor:', currentCallId);

      // Önce Firebase'den sil
      await deleteDoc(doc(db, 'videoCalls', currentCallId));

      // Sonra state'leri sıfırla
      setVideoCallStatus('idle');
      setCurrentCallId(null);
      setRoomId('');
      Alert.alert('İptal Edildi', 'Video call talebiniz iptal edildi');
    } catch (error) {
      console.error('Cancel video call error:', error);
    }
  };

  const handleEndCall = useCallback(async () => {
    console.log('📞 Video call sonlandırılıyor...');
    setShowVideoCall(false);
    setVideoCallStatus('idle');

    if (currentCallId) {
      try {
        await deleteDoc(doc(db, 'videoCalls', currentCallId));
        console.log('✅ Video call Firebase\'den silindi');
      } catch (error) {
        console.error('End call cleanup error:', error);
      }
      setCurrentCallId(null);
    }

    setRoomId('');
  }, [currentCallId]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Uzman Desteği</Text>
          <Text style={styles.headerSubtitle}>Uyku uzmanlarımızla iletişime geçin</Text>
        </View>

        {/* VİDEO CALL BUTONU */}
        {!showVideoCall && (
          <TouchableOpacity
            style={styles.videoButton}
            onPress={handleStartVideoCall}
            activeOpacity={0.7}
            disabled={videoCallStatus === 'waiting'}
          >
            <Text style={styles.videoButtonText}>🎥</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: insets.bottom }
          ]}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>Henüz mesaj yok</Text>
              <Text style={styles.emptySubtext}>
                Uyku uzmanlarımıza sorularınızı sorabilirsiniz
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageCard,
                  msg.sender === 'user' ? styles.userMessage : styles.expertMessage
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>
                    {msg.sender === 'user' ? 'Siz' : 'Uzman'}
                  </Text>
                  <Text style={styles.messageTime}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userMessageText : styles.expertMessageText
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (loading || !newMessage.trim()) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>
              {loading ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={[styles.infoCard, { marginBottom: insets.bottom }]}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>İpucu</Text>
          <Text style={styles.infoText}>
            Uzmanlarımız hafta içi 09:00-18:00 saatleri arasında çevrimiçidir
          </Text>
        </View>
      </View>

      {/* JİTSİ VIDEO CALL MODAL */}
      <Modal
        visible={showVideoCall}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleEndCall}
      >
        <SafeAreaView style={styles.videoContainer} edges={['top', 'bottom']}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoTitle}>Görüntülü Görüşme</Text>
            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <Text style={styles.endCallButtonText}>📞 Bitir</Text>
            </TouchableOpacity>
          </View>

          {roomId ? (
            <>
              {/* BEKLEME OVERLAY - Admin henüz katılmadıysa göster */}
              {videoCallStatus === 'waiting' && (
                <View style={styles.waitingOverlay}>
                  <Text style={styles.waitingIcon}>⏳</Text>
                  <Text style={styles.waitingOverlayTitle}>Uzman Bekleniyor</Text>
                  <Text style={styles.waitingOverlayText}>
                    Uzman görüşmeye katıldığında otomatik olarak bağlanacaksınız
                  </Text>
                  <Text style={styles.waitingOverlaySubtext}>
                    Lütfen bu ekranda bekleyiniz...
                  </Text>
                </View>
              )}

              <WebView
                source={{
                  uri: `https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(user?.name || 'Kullanıcı')}`
                }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                onError={(error) => {
                  console.error('WebView error:', error);
                  Alert.alert('Hata', 'Video görüşme yüklenemedi');
                }}
                onLoadStart={() => console.log('🎥 Jitsi yükleniyor...')}
                onLoadEnd={() => console.log('✅ Jitsi yüklendi')}
              />
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Bağlanıyor...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  videoButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  videoButtonText: { fontSize: 28 },
  videoButtonWaiting: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 28, backgroundColor: '#f59e0b', justifyContent: 'center', alignItems: 'center' },
  videoButtonWaitingText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  waitingBanner: { flexDirection: 'row', backgroundColor: '#fef3c7', padding: 16, margin: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#f59e0b', gap: 12 },
  waitingIcon: { fontSize: 28 },
  waitingTextContainer: { flex: 1 },
  waitingTitle: { fontSize: 15, fontWeight: 'bold', color: '#92400e', marginBottom: 4 },
  waitingText: { fontSize: 13, color: '#78350f' },
  content: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 32 },
  messageCard: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#3b82f6' },
  expertMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  messageSender: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  messageTime: { fontSize: 11, color: '#cbd5e1' },
  messageText: { fontSize: 15, lineHeight: 20 },
  userMessageText: { color: '#fff' },
  expertMessageText: { color: '#0f172a' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 8 },
  input: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, fontSize: 16, maxHeight: 100, borderWidth: 1, borderColor: '#e2e8f0' },
  sendButton: { width: 48, height: 48, backgroundColor: '#3b82f6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { fontSize: 24 },
  infoCard: { flexDirection: 'row', backgroundColor: '#dbeafe', margin: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe', alignItems: 'center', gap: 8 },
  infoIcon: { fontSize: 24 },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#1e40af', marginBottom: 2 },
  infoText: { fontSize: 13, color: '#1e40af' },
  videoContainer: { flex: 1, backgroundColor: '#000' },
  videoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1e293b' },
  videoTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  endCallButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  endCallButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  webview: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#fff' },
  waitingOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20
  },
  waitingIcon: { fontSize: 64, marginBottom: 20 },
  waitingOverlayTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  waitingOverlayText: { fontSize: 16, color: '#cbd5e1', textAlign: 'center', marginBottom: 8 },
  waitingOverlaySubtext: { fontSize: 14, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' },
});
