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
  ActivityIndicator,
  StatusBar,
  Keyboard,
  RefreshControl,
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
import { useThemeStore } from '../../store/themeStore';
import { colors } from '../../utils/colors';
import { WebView } from 'react-native-webview';
import { requestCameraAndMicrophonePermissions, checkCameraAndMicrophonePermissions } from '../../utils/permissions';
import * as Haptics from 'expo-haptics';

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
  const isDark = useThemeStore((state) => state.isDark);
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [videoCallStatus, setVideoCallStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const webViewRef = useRef<WebView>(null);

  const unsubMessagesRef = useRef<(() => void) | null>(null);
  const unsubVideoCallsRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log('🧹 SupportScreen unmounting...');
      isMountedRef.current = false;
      cleanupFirebaseListeners();
    };
  }, []);

  const cleanupFirebaseListeners = useCallback(() => {
    console.log('🧹 Cleaning up Firebase listeners...');
    
    if (unsubMessagesRef.current) {
      try {
        unsubMessagesRef.current();
      } catch (error) {
        console.error('❌ Error unsubscribing messages:', error);
      }
      unsubMessagesRef.current = null;
    }
    
    if (unsubVideoCallsRef.current) {
      try {
        unsubVideoCallsRef.current();
      } catch (error) {
        console.error('❌ Error unsubscribing video calls:', error);
      }
      unsubVideoCallsRef.current = null;
    }
  }, []);

  useEffect(() => {
    const showSubscription = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillShow', (e) => {
          if (isMountedRef.current) {
            setKeyboardHeight(e.endCoordinates.height);
          }
        })
      : Keyboard.addListener('keyboardDidShow', (e) => {
          if (isMountedRef.current) {
            setKeyboardHeight(e.endCoordinates.height);
          }
        });

    const hideSubscription = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => {
          if (isMountedRef.current) {
            setKeyboardHeight(0);
          }
        })
      : Keyboard.addListener('keyboardDidHide', () => {
          if (isMountedRef.current) {
            setKeyboardHeight(0);
          }
        });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onRefresh = useCallback(() => {
    if (!isMountedRef.current) return;
    setRefreshing(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (!user?.userId || !db) return;

    if (unsubMessagesRef.current) {
      unsubMessagesRef.current();
      unsubMessagesRef.current = null;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('userId', '==', user.userId),
      orderBy('timestamp', 'asc')
    );

    const unsubMessages = onSnapshot(
      messagesQuery,
      (snapshot: QuerySnapshot) => {
        if (!isMountedRef.current) return;

        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        setMessages(msgs);

        setTimeout(() => {
          if (scrollViewRef.current && isMountedRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      },
      (error) => {
        console.error('❌ Messages firebase error:', error);
        if (isMountedRef.current && !refreshing) {
          Alert.alert('Hata', 'Mesajlar yüklenemedi. Lütfen tekrar deneyin.');
        }
      }
    );

    unsubMessagesRef.current = unsubMessages;

    return () => {
      if (unsubMessagesRef.current) {
        unsubMessagesRef.current();
        unsubMessagesRef.current = null;
      }
    };
  }, [user?.userId, refreshing]);

  useEffect(() => {
    if (!user?.userId || !db) return;

    if (unsubVideoCallsRef.current) {
      unsubVideoCallsRef.current();
      unsubVideoCallsRef.current = null;
    }

    const videoCallsQuery = query(
      collection(db, 'videoCalls'),
      where('userId', '==', user.userId)
    );

    const unsubVideoCalls = onSnapshot(
      videoCallsQuery,
      async (snapshot: QuerySnapshot) => {
        if (!isMountedRef.current) return;

        if (snapshot.docs.length === 0) {
          if (videoCallStatus !== 'idle' && isMountedRef.current) {
            setVideoCallStatus('idle');
          }
          return;
        }

        for (const docSnapshot of snapshot.docs) {
          const call = docSnapshot.data() as VideoCall;
          const callId = docSnapshot.id;

          if (call.status === 'accepted' && call.roomId) {
            console.log('✅ Admin accepted!');
            
            if (isMountedRef.current) {
              setVideoCallStatus('connected');
              setCurrentCallId(callId);
            }
            
            try {
              await deleteDoc(doc(db, 'videoCalls', callId));
            } catch (e) {
              console.error('Cleanup error:', e);
            }
            break;
          }

          if (call.status === 'rejected') {
            if (isMountedRef.current) {
              Alert.alert('Reddedildi', 'Uzman görüşmeyi reddetti');
              setShowVideoCall(false);
              setVideoCallStatus('idle');
              setCurrentCallId(null);
              setRoomId('');
            }

            try {
              await deleteDoc(doc(db, 'videoCalls', callId));
            } catch (e) {
              console.error('Delete error:', e);
            }
            break;
          }

          if (call.status === 'waiting') {
            if (isMountedRef.current) {
              setCurrentCallId(callId);
              setVideoCallStatus('waiting');
            }
          }
        }
      },
      (error) => {
        console.error('❌ Video calls error:', error);
        if (isMountedRef.current) {
          Alert.alert('Bağlantı Hatası', 'Video görüşme durumu takip edilemiyor.');
        }
      }
    );

    unsubVideoCallsRef.current = unsubVideoCalls;

    return () => {
      if (unsubVideoCallsRef.current) {
        unsubVideoCallsRef.current();
        unsubVideoCallsRef.current = null;
      }
    };
  }, [user?.userId, videoCallStatus]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.userId || !isMountedRef.current) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      await addDoc(collection(db, 'messages'), {
        text: messageText,
        userId: user.userId,
        userName: user.name || 'Kullanıcı',
        sender: 'user',
        timestamp: Timestamp.now()
      });

      setTimeout(() => {
        if (scrollViewRef.current && isMountedRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Send error:', error);
      if (isMountedRef.current) {
        Alert.alert('Hata', 'Mesaj gönderilemedi');
        setNewMessage(messageText);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleStartVideoCall = async () => {
    if (!user?.userId || !isMountedRef.current) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (videoCallStatus === 'waiting' || showVideoCall) {
      Alert.alert('Uyarı', 'Zaten aktif bir görüşme talebiniz var.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const hasExistingPermissions = await checkCameraAndMicrophonePermissions();
      
      if (!hasExistingPermissions) {
        const hasPermissions = await requestCameraAndMicrophonePermissions();
        
        if (!hasPermissions) {
          Alert.alert(
            'İzin Gerekli', 
            'Görüntülü görüşme için kamera ve mikrofon izinleri gereklidir.'
          );
          return;
        }
      }

      const newRoomId = `FidBal-Support-${user.userId}-${Date.now()}`;

      const docRef = await addDoc(collection(db, 'videoCalls'), {
        userId: user.userId,
        userName: user.name || 'Kullanıcı',
        roomId: newRoomId,
        status: 'waiting',
        createdAt: Timestamp.now()
      });

      if (isMountedRef.current) {
        setCurrentCallId(docRef.id);
        setRoomId(newRoomId);
        setVideoCallStatus('waiting');
        setShowVideoCall(true);
      }

    } catch (error) {
      console.error('❌ Video call error:', error);
      if (isMountedRef.current) {
        Alert.alert('Hata', 'Görüntülü görüşme başlatılamadı');
        setVideoCallStatus('idle');
        setCurrentCallId(null);
        setRoomId('');
        setShowVideoCall(false);
      }
    }
  };

  const handleEndCall = useCallback(async () => {
    console.log('📞 Ending call...');
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isMountedRef.current) {
      setShowVideoCall(false);
      setVideoCallStatus('idle');
    }

    if (currentCallId) {
      try {
        await deleteDoc(doc(db, 'videoCalls', currentCallId));
      } catch (error) {
        console.error('Cleanup error:', error);
        
        try {
          const q = query(
            collection(db, 'videoCalls'),
            where('userId', '==', user?.userId)
          );
          const snapshot = await getDocs(q);
          const deletePromises = snapshot.docs.map(document => 
            deleteDoc(doc(db, 'videoCalls', document.id))
          );
          await Promise.all(deletePromises);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      }
      
      if (isMountedRef.current) {
        setCurrentCallId(null);
      }
    }

    if (isMountedRef.current) {
      setRoomId('');
    }
  }, [currentCallId, user?.userId]);

  // ✅ JITSI URL - DOĞRUDAN LINK (HTML YOK!)
  const getJitsiURL = useCallback(() => {
    if (!roomId) return '';
    
    const config = {
      prejoinPageEnabled: false,
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      disableDeepLinking: true,
    };
    
    const configString = Object.entries(config)
      .map(([key, value]) => `config.${key}=${value}`)
      .join('&');
    
    return `https://meet.jit.si/${roomId}#${configString}&userInfo.displayName=${encodeURIComponent(user?.name || 'Kullanıcı')}`;
  }, [roomId, user]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: currentColors.background }]} 
      edges={['top', 'bottom']}
    >
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={currentColors.surface} 
      />

      <View style={[styles.header, { 
        backgroundColor: currentColors.surface, 
        borderBottomColor: currentColors.border 
      }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: currentColors.primary }]}>
            Uzman Desteği
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.secondary }]}>
            Uyku uzmanlarımızla iletişime geçin
          </Text>
        </View>

        {!showVideoCall && (
          <TouchableOpacity
            style={[
              styles.videoButton,
              videoCallStatus === 'waiting' && styles.videoButtonDisabled
            ]}
            onPress={handleStartVideoCall}
            disabled={videoCallStatus === 'waiting'}
          >
            {videoCallStatus === 'waiting' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.videoButtonText}>🎥</Text>
            )}
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
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={[styles.emptyText, { color: currentColors.primary }]}>
                Henüz mesaj yok
              </Text>
              <Text style={[styles.emptySubtext, { color: currentColors.secondary }]}>
                Uyku uzmanlarımıza sorularınızı sorabilirsiniz
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageCard,
                  msg.sender === 'user' 
                    ? styles.userMessage 
                    : [styles.expertMessage, { 
                        backgroundColor: currentColors.card,
                        borderColor: currentColors.border
                      }]
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={[
                    styles.messageSender,
                    msg.sender === 'user' 
                      ? styles.userMessageSender 
                      : [styles.expertMessageSender, { color: currentColors.secondary }]
                  ]}>
                    {msg.sender === 'user' ? 'Siz' : 'Uzman'}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    msg.sender === 'user' 
                      ? styles.userMessageTime 
                      : [styles.expertMessageTime, { color: currentColors.tertiary }]
                  ]}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' 
                    ? styles.userMessageText 
                    : [styles.expertMessageText, { color: currentColors.primary }]
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={[
          styles.inputContainer,
          { 
            backgroundColor: currentColors.surface,
            borderTopColor: currentColors.border,
            paddingBottom: Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight : 12
          }
        ]}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
              borderColor: currentColors.border,
              color: currentColors.primary
            }]}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={currentColors.tertiary}
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
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>📤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* VIDEO CALL MODAL */}
      <Modal
        visible={showVideoCall}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleEndCall}
      >
        <View style={[styles.videoContainer, { paddingTop: insets.top }]}>
          <View style={[styles.videoHeader, { paddingTop: 12 }]}>
            <Text style={styles.videoTitle}>Görüntülü Görüşme</Text>
            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <Text style={styles.endCallButtonText}>📞 Bitir</Text>
            </TouchableOpacity>
          </View>

          {roomId ? (
            <View style={styles.webviewWrapper}>
              {videoCallStatus === 'waiting' && (
                <View style={styles.waitingOverlay}>
                  <View style={styles.waitingCard}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.waitingIcon}>⏳</Text>
                    <Text style={styles.waitingTitle}>Uzman Bekleniyor</Text>
                    <Text style={styles.waitingText}>
                      Uzman katıldığında otomatik bağlanacaksınız
                    </Text>
                  </View>
                </View>
              )}

              {/* ✅ DOĞRUDAN URL - HTML YOK */}
              <WebView
                ref={webViewRef}
                source={{ uri: getJitsiURL() }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                {...(Platform.OS === 'ios' ? {
                  allowsLinkPreview: false,
                  dataDetectorTypes: 'none',
                  scrollEnabled: false,
                  bounces: false,
                  sharedCookiesEnabled: true,
                  limitsNavigationsToAppBoundDomains: false,
                  allowsBackForwardNavigationGestures: false,
                } : {
                  mediaCapturePermissionGrantType: 'grant',
                  setBuiltInZoomControls: false,
                  setDisplayZoomControls: false,
                })}
                cacheEnabled={false}
                incognito={false}
                originWhitelist={['*']}
                mixedContentMode="always"
                thirdPartyCookiesEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Jitsi yükleniyor...</Text>
                  </View>
                )}
                onLoadStart={() => console.log('📱 WebView loading Jitsi URL:', getJitsiURL())}
                onLoadEnd={() => console.log('✅ WebView loaded')}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('❌ WebView error:', nativeEvent);
                  Alert.alert('Hata', 'Jitsi yüklenemedi. Lütfen tekrar deneyin.');
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('❌ HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                }}
                onMessage={(event) => {
                  console.log('📨 WebView message:', event.nativeEvent.data);
                }}
              />
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Oda hazırlanıyor...</Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1, paddingRight: 12 },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  videoButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  videoButtonDisabled: { opacity: 0.5, backgroundColor: '#6b7280' },
  videoButtonText: { fontSize: 24 },
  content: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  messageCard: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12, minWidth: 100 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#3b82f6', borderBottomRightRadius: 4 },
  expertMessage: { alignSelf: 'flex-start', borderWidth: 1, borderBottomLeftRadius: 4 },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  messageSender: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  userMessageSender: { color: 'rgba(255, 255, 255, 0.9)' },
  expertMessageSender: {},
  messageTime: { fontSize: 10, marginLeft: 8 },
  userMessageTime: { color: 'rgba(255, 255, 255, 0.7)' },
  expertMessageTime: {},
  messageText: { fontSize: 15, lineHeight: 20 },
  userMessageText: { color: '#fff' },
  expertMessageText: {},
  inputContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 120, minHeight: 40, borderWidth: 1 },
  sendButton: { width: 40, height: 40, backgroundColor: '#3b82f6', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { fontSize: 20 },
  videoContainer: { flex: 1, backgroundColor: '#000' },
  videoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1e293b' },
  videoTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  endCallButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  endCallButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  webviewWrapper: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#000' },
  waitingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10, padding: 20 },
  waitingCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', maxWidth: 320, width: '100%' },
  waitingIcon: { fontSize: 48, marginTop: 16, marginBottom: 16 },
  waitingTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
  waitingText: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { fontSize: 18, color: '#fff', marginTop: 16 },
});
