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
  Dimensions,
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
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // ✅ Cleanup refs
  const unsubMessagesRef = useRef<(() => void) | null>(null);
  const unsubVideoCallsRef = useRef<(() => void) | null>(null);

  // Keyboard listener for better handling
  useEffect(() => {
    const showSubscription = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillShow', (e) => setKeyboardHeight(e.endCoordinates.height))
      : Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));

    const hideSubscription = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0))
      : Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // ✅ Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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
        Alert.alert('Hata', 'Mesajlar yüklenemedi. Lütfen tekrar deneyin.');
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
        Alert.alert('Bağlantı Hatası', 'Video görüşme durumu takip edilemiyor.');
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

    const messageText = newMessage.trim();
    setNewMessage(''); // Önce temizle, daha iyi UX
    setLoading(true);

    try {
      await addDoc(collection(db, 'messages'), {
        text: messageText,
        userId: user.userId,
        userName: user.name || 'Kullanıcı',
        sender: 'user',
        timestamp: Timestamp.now()
      });

      console.log('✅ Mesaj gönderildi');

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('❌ Send message error:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      setNewMessage(messageText); // Hata durumunda mesajı geri koy
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideoCall = async () => {
    if (!user?.userId) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (videoCallStatus === 'waiting' || showVideoCall) {
      Alert.alert('Uyarı', 'Zaten aktif bir görüşme talebiniz var.');
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
      Alert.alert('Hata', 'Görüntülü görüşme başlatılamadı. Lütfen tekrar deneyin.');
      setVideoCallStatus('idle');
      setCurrentCallId(null);
      setRoomId('');
      setShowVideoCall(false);
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Uzman Desteği</Text>
          <Text style={styles.headerSubtitle}>Uyku uzmanlarımızla iletişime geçin</Text>
        </View>

        {/* VİDEO CALL BUTONU */}
        {!showVideoCall && (
          <TouchableOpacity
            style={[
              styles.videoButton,
              videoCallStatus === 'waiting' && styles.videoButtonDisabled
            ]}
            onPress={handleStartVideoCall}
            activeOpacity={0.7}
            disabled={videoCallStatus === 'waiting'}
            accessibilityLabel="Görüntülü görüşme başlat"
            accessibilityRole="button"
          >
            <Text style={styles.videoButtonText}>🎥</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
              <Text style={styles.emptyText}>Henüz mesaj yok</Text>
              <Text style={styles.emptySubtext}>
                Uyku uzmanlarımıza sorularınızı sorabilirsiniz
              </Text>
              <Text style={styles.refreshHint}>
                ↻ Yukarı çekerek yenileyin
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
                  <Text style={[
                    styles.messageSender,
                    msg.sender === 'user' ? styles.userMessageSender : styles.expertMessageSender
                  ]}>
                    {msg.sender === 'user' ? 'Siz' : 'Uzman'}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    msg.sender === 'user' ? styles.userMessageTime : styles.expertMessageTime
                  ]}>
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

        <View style={[
          styles.inputContainer,
          Platform.OS === 'ios' && keyboardHeight > 0 && { paddingBottom: 10 }
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            editable={!loading}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, (loading || !newMessage.trim()) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            activeOpacity={0.7}
            accessibilityLabel="Mesaj gönder"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>📤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={[styles.infoCard, { marginBottom: Math.max(insets.bottom, 16) }]}>
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
        supportedOrientations={['portrait', 'landscape']}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.videoContainer} edges={['top', 'bottom', 'left', 'right']}>
          <StatusBar barStyle="light-content" backgroundColor="#1e293b" translucent={true} />

          <View style={[styles.videoHeader, { paddingTop: insets.top }]}>
            <Text style={styles.videoTitle}>Görüntülü Görüşme</Text>
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
              accessibilityLabel="Görüşmeyi bitir"
              accessibilityRole="button"
            >
              <Text style={styles.endCallButtonText}>📞 Bitir</Text>
            </TouchableOpacity>
          </View>

          {roomId ? (
            <>
              {/* BEKLEME OVERLAY - Admin henüz katılmadıysa göster */}
              {videoCallStatus === 'waiting' && (
                <View style={[styles.waitingOverlay, { top: insets.top + 60 }]}>
                  <ActivityIndicator size="large" color="#fff" style={styles.waitingSpinner} />
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

              <View style={styles.webviewContainer}>
                <WebView
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                        <style>
                          * { margin: 0; padding: 0; box-sizing: border-box; }
                          body, html {
                            height: 100%;
                            width: 100%;
                            overflow: hidden;
                            background: #000;
                          }
                          #jaas-container {
                            width: 100vw;
                            height: 100vh;
                            position: fixed;
                            top: 0;
                            left: 0;
                          }
                        </style>
                      </head>
                      <body>
                        <div id="jaas-container"></div>
                        <script src='https://meet.jit.si/external_api.js'></script>
                        <script>
                          window.onload = function() {
                            try {
                              const domain = 'meet.jit.si';
                              const options = {
                                roomName: '${roomId}',
                                width: '100%',
                                height: '100%',
                                parentNode: document.getElementById('jaas-container'),
                                userInfo: {
                                  displayName: '${user?.name || 'Kullanıcı'}',
                                  email: '${user?.email || ''}'
                                },
                                configOverwrite: {
                                  startWithAudioMuted: false,
                                  startWithVideoMuted: false,
                                  prejoinPageEnabled: false,
                                  disableDeepLinking: true,
                                  disableInviteFunctions: false,
                                  doNotStoreRoom: true,
                                  enableWelcomePage: false,
                                  enableClosePage: false,
                                  disable1On1Mode: false,
                                  p2p: {
                                    enabled: false
                                  },
                                  enableLobbyChat: false,
                                  requireDisplayName: false,
                                  disableModeratorIndicator: false,
                                  startScreenSharing: false,
                                  enableEmailInStats: false
                                },
                                interfaceConfigOverwrite: {
                                  MOBILE_APP_PROMO: false,
                                  ANDROID_APP_PACKAGE: null,
                                  APP_NAME: 'FidBal Meet',
                                  SHOW_JITSI_WATERMARK: false,
                                  SHOW_WATERMARK_FOR_GUESTS: false,
                                  SHOW_BRAND_WATERMARK: false,
                                  BRAND_WATERMARK_LINK: '',
                                  SHOW_POWERED_BY: false,
                                  SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                                  SHOW_CHROME_EXTENSION_BANNER: false,
                                  TOOLBAR_BUTTONS: [
                                    'microphone',
                                    'camera',
                                    'hangup',
                                    'chat',
                                    'fullscreen',
                                    'fodeviceselection',
                                    'toggle-camera'
                                  ],
                                  SETTINGS_SECTIONS: ['devices', 'language'],
                                  VIDEO_QUALITY_LABEL_DISABLED: false,
                                  CONNECTION_INDICATOR_DISABLED: false,
                                  VIDEO_LAYOUT_FIT: 'both',
                                  MOBILE_APP_REDIRECT: false,
                                  SHOW_DEEP_LINKING_IMAGE: false,
                                  GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
                                  DISPLAY_WELCOME_PAGE_CONTENT: false,
                                  INVITATION_POWERED_BY: false,
                                  AUTHENTICATION_ENABLE: false,
                                  TOOLBAR_ALWAYS_VISIBLE: false,
                                  TOOLBAR_TIMEOUT: 4000,
                                  DEFAULT_REMOTE_DISPLAY_NAME: 'Katılımcı',
                                  DEFAULT_LOCAL_DISPLAY_NAME: '${user?.name || 'Kullanıcı'}'
                                },
                                onload: function() {
                                  window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'loaded',
                                    message: 'Jitsi Meet yüklendi'
                                  }));
                                }
                              };

                              const api = new JitsiMeetExternalAPI(domain, options);

                              // Event listeners
                              api.addEventListener('videoConferenceJoined', function(event) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                  type: 'joined',
                                  data: event
                                }));
                              });

                              api.addEventListener('videoConferenceLeft', function(event) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                  type: 'left',
                                  data: event
                                }));
                              });

                              api.addEventListener('participantJoined', function(event) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                  type: 'participantJoined',
                                  data: event
                                }));
                              });

                              api.addEventListener('readyToClose', function() {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                  type: 'close'
                                }));
                              });

                              // Hata yakalama
                              api.addEventListener('errorOccurred', function(event) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                  type: 'error',
                                  data: event
                                }));
                              });

                            } catch (error) {
                              window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'error',
                                message: error.toString()
                              }));
                            }
                          }
                        </script>
                      </body>
                      </html>
                    `,
                    baseUrl: 'https://meet.jit.si'
                  }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  mediaPlaybackRequiresUserAction={false}
                  allowsInlineMediaPlayback={true}
                  startInLoadingState={true}
                  allowsFullscreenVideo={true}
                  mixedContentMode="always"
                  originWhitelist={['*']}
                  allowsProtectedMedia={true}
                  allowFileAccess={true}
                  allowUniversalAccessFromFileURLs={true}
                  renderLoading={() => (
                    <View style={styles.webviewLoading}>
                      <ActivityIndicator size="large" color="#3b82f6" />
                      <Text style={styles.webviewLoadingText}>Yükleniyor...</Text>
                    </View>
                  )}
                  onMessage={(event) => {
                    try {
                      const message = JSON.parse(event.nativeEvent.data);
                      console.log('📱 Jitsi Event:', message);

                      // ÖNEMSİZ HATALARI FİLTRELE
                      if (message.type === 'error') {
                        const errorName = message.data?.error?.name;

                        // Önemsiz/bilinen hataları görmezden gel
                        const ignorableErrors = [
                          'conference.connectionError.membersOnly',
                          'conference.connectionError',
                          'conference.setupError',
                          'conference.connectionError.other'
                        ];

                        if (ignorableErrors.includes(errorName)) {
                          console.log('⚠️ Jitsi bilinen hata (görmezden geliniyor):', errorName);
                          return; // Bu hatayı işleme, devam et
                        }

                        // Ciddi hataları göster
                        console.error('❌ Jitsi Error:', message);
                        if (message.data?.error?.isFatal) {
                          Alert.alert('Hata', 'Video görüşmede bir sorun oluştu');
                        }
                        return;
                      }

                      if (message.type === 'close' || message.type === 'left') {
                        handleEndCall();
                      } else if (message.type === 'joined') {
                        console.log('✅ Konferansa katıldı');
                      } else if (message.type === 'participantJoined') {
                        console.log('👤 Katılımcı katıldı:', message.data);
                        // Admin katıldıysa overlay'i kaldır
                        if (videoCallStatus === 'waiting') {
                          setVideoCallStatus('connected');
                        }
                      }
                    } catch (error) {
                      console.error('Message parse error:', error);
                    }
                  }}
                  onError={(error) => {
                    console.error('WebView error:', error);
                    Alert.alert('Hata', 'Video görüşme yüklenemedi');
                  }}
                  onLoadStart={() => console.log('🎥 Jitsi yükleniyor...')}
                  onLoadEnd={() => console.log('✅ Jitsi yüklendi')}
                />
              </View>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Bağlanıyor...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },

  // Header styles
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },

  // Video button styles
  videoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  videoButtonDisabled: {
    opacity: 0.5,
  },
  videoButtonText: {
    fontSize: 24
  },

  // Content area
  content: {
    flex: 1
  },

  // Messages area
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
    marginBottom: 16,
  },
  refreshHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  // Message styles
  messageCard: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 100,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  expertMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userMessageSender: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  expertMessageSender: {
    color: '#64748b',
  },
  messageTime: {
    fontSize: 10,
    marginLeft: 8,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  expertMessageTime: {
    color: '#94a3b8',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  userMessageText: {
    color: '#fff'
  },
  expertMessageText: {
    color: '#0f172a'
  },

  // Input area
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  sendButtonText: {
    fontSize: 20
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    gap: 12
  },
  infoIcon: {
    fontSize: 20
  },
  infoTextContainer: {
    flex: 1
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 2
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },

  // Video call modal
  videoContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  endCallButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  endCallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },

  // WebView
  webviewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webviewLoadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
  },

  // Waiting overlay
  waitingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20
  },
  waitingSpinner: {
    marginBottom: 20,
  },
  waitingIcon: {
    fontSize: 48,
    marginBottom: 20
  },
  waitingOverlayText: {
      fontSize: 16,
      color: '#cbd5e1',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 22,
    },
    waitingOverlaySubtext: {
      fontSize: 14,
      color: '#94a3b8',
      textAlign: 'center',
      fontStyle: 'italic'
    },
  });