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
  Linking,
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
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const webViewRef = useRef<WebView>(null);

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
        if (snapshot.docs.length === 0) {
          if (videoCallStatus !== 'idle') {
            setVideoCallStatus('idle');
          }
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

          // ✅ ADMIN KABUL ETTİ
          if (call.status === 'accepted' && call.roomId) {
            console.log('✅✅✅ ADMIN KABUL ETTİ!');
            
            setVideoCallStatus('connected');
            setCurrentCallId(callId);
            
            // Firebase'den hemen sil
            try {
              await deleteDoc(doc(db, 'videoCalls', callId));
              console.log('✅ Video call kaydı temizlendi');
            } catch (e) {
              console.error('Cleanup error:', e);
            }

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

          // ⏳ BEKLEME DURUMU
          if (call.status === 'waiting') {
            console.log('⏳ Admin bekleniyor...');
            setCurrentCallId(callId);
            setVideoCallStatus('waiting');
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
  }, [user?.userId, videoCallStatus]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.userId) return;

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

      console.log('✅ Mesaj gönderildi');

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('❌ Send message error:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      setNewMessage(messageText);
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

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    console.log('🎬 Video call başlatılıyor...');
    console.log('📋 Platform:', Platform.OS);

    // Önce mevcut izinleri kontrol et
    const hasExistingPermissions = await checkCameraAndMicrophonePermissions();
    console.log('🔍 Mevcut izinler:', hasExistingPermissions);

    if (!hasExistingPermissions) {
      console.log('🔐 Yeni izin isteniyor...');
      const hasPermissions = await requestCameraAndMicrophonePermissions();
      console.log('📋 İzin sonucu:', hasPermissions);
      
      if (!hasPermissions) {
        console.log('❌ İzinler reddedildi');
        return;
      }
    }

    console.log('✅ İzinler mevcut, devam ediliyor...');

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
      setShowVideoCall(true);
      setWebViewLoaded(false);

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
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setShowVideoCall(false);
    setVideoCallStatus('idle');
    setWebViewLoaded(false);

    if (currentCallId) {
      try {
        await deleteDoc(doc(db, 'videoCalls', currentCallId));
        console.log('✅ Video call Firebase\'den silindi');
      } catch (error) {
        console.error('End call cleanup error:', error);
        
        // Fallback: Query ile silme
        try {
          const q = query(
            collection(db, 'videoCalls'),
            where('userId', '==', user?.userId)
          );
          const snapshot = await getDocs(q);
          snapshot.docs.forEach(async (document) => {
            await deleteDoc(doc(db, 'videoCalls', document.id));
          });
          console.log('✅ Fallback cleanup başarılı');
        } catch (fallbackError) {
          console.error('Fallback cleanup error:', fallbackError);
        }
      }
      setCurrentCallId(null);
    }

    setRoomId('');
  }, [currentCallId, user?.userId]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // WebView için Jitsi HTML - ANDROID FIX
  const jitsiHTML = `
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
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div id="jaas-container"></div>
      
      <script src='https://meet.jit.si/external_api.js'></script>
      <script>
        console.log('🚀 Jitsi script yükleniyor...');
        
        // ANDROID MEDIA FIX - Kritik polyfill
        (function() {
          console.log('🔧 Android media polyfill başlatılıyor...');
          
          // MediaDevices polyfill for Android WebView
          if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
            console.log('✅ navigator.mediaDevices polyfill eklendi');
          }

          if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function(constraints) {
              console.log('📹 getUserMedia called with:', JSON.stringify(constraints));
              
              var legacyGetUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
              
              if (!legacyGetUserMedia) {
                console.error('❌ No getUserMedia implementation found');
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
              }
              
              return new Promise(function(resolve, reject) {
                legacyGetUserMedia.call(navigator, constraints, resolve, reject);
              });
            };
            console.log('✅ getUserMedia polyfill eklendi');
          }

          // enumerateDevices polyfill
          if (navigator.mediaDevices.enumerateDevices === undefined) {
            navigator.mediaDevices.enumerateDevices = function() {
              return new Promise(function(resolve) {
                var kinds = {audio: 'audioinput', video: 'videoinput'};
                return Promise.all(Object.keys(kinds).map(function(kind) {
                  return navigator.mediaDevices.getUserMedia({[kind]: true})
                    .then(function(stream) {
                      stream.getTracks().forEach(function(track) { track.stop(); });
                      return [{
                        kind: kinds[kind],
                        label: kind + ' device',
                        deviceId: 'default',
                        groupId: 'default'
                      }];
                    })
                    .catch(function(e) {
                      return [];
                    });
                })).then(function(devices) {
                  resolve(devices.flat());
                });
              });
            };
            console.log('✅ enumerateDevices polyfill eklendi');
          }
        })();

        // Jitsi başlatma
        function startJitsi() {
          try {
            console.log('🎬 Jitsi Meet başlatılıyor...');
            
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
                // ANDROID FIX: Prejoin page'i devre dışı bırak - doğrudan odaya gir
                prejoinPageEnabled: false,
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableDeepLinking: true,
                disableInviteFunctions: true,
                doNotStoreRoom: true,
                enableWelcomePage: false,
                enableClosePage: false,
                
                // ANDROID MEDIA CONSTRAINTS - Basit ayarlar
                constraints: {
                  video: {
                    height: { ideal: 360, max: 360, min: 180 },
                    width: { ideal: 640, max: 640, min: 320 },
                    frameRate: { ideal: 20, max: 20 }
                  },
                  audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                  }
                },
                
                // ANDROID PERFORMANS AYARLARI
                disableAudioLevels: false,
                enableNoAudioDetection: true,
                enableNoisyMicDetection: true,
                resolution: 360,
                maxFullResolutionParticipants: 2,
                enableLayerSuspension: true,
                
                // P2P devre dışı - sunucu üzerinden daha stabil
                p2p: { enabled: false },
                
                // Diğer ayarlar
                enableLobbyChat: false,
                requireDisplayName: false,
                disableModeratorIndicator: true,
                startScreenSharing: false,
                enableEmailInStats: false,
                debug: false,
                
                // ANDROID FIX: Disable some features that cause issues
                disableThirdPartyRequests: true,
                enableAnalytics: false,
                gatherStats: false
              },
              interfaceConfigOverwrite: {
                // ANDROID FIX: Basit arayüz
                MOBILE_APP_PROMO: false,
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_BRAND_WATERMARK: false,
                SHOW_POWERED_BY: false,
                SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                
                // Toolbar ayarları
                TOOLBAR_BUTTONS: [
                  'microphone', 'camera', 'hangup', 'tileview'
                ],
                SETTINGS_SECTIONS: ['devices'],
                VIDEO_LAYOUT_FIT: 'both',
                TOOLBAR_ALWAYS_VISIBLE: false,
                
                // Display ayarları
                DEFAULT_REMOTE_DISPLAY_NAME: 'Katılımcı',
                DEFAULT_LOCAL_DISPLAY_NAME: '${user?.name || 'Kullanıcı'}',
                APP_NAME: 'FidBal',
                
                // ANDROID FIX: Disable unnecessary features
                DISABLE_VIDEO_BACKGROUND: false,
                DISABLE_FOCUS_INDICATOR: false,
                DISABLE_DOMINANT_SPEAKER_INDICATOR: false
              }
            };

            console.log('⚙️ Jitsi options:', JSON.stringify(options, null, 2));
            
            const api = new JitsiMeetExternalAPI(domain, options);
            console.log('✅ Jitsi API oluşturuldu');

            // Event listeners
            api.addEventListener('videoConferenceJoined', (e) => {
              console.log('✅ Konferansa katıldı:', e);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'joined'
              }));
            });

            api.addEventListener('videoConferenceLeft', (e) => {
              console.log('❌ Konferanstan ayrıldı:', e);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'close'
              }));
            });

            api.addEventListener('participantJoined', (e) => {
              console.log('👤 Katılımcı katıldı:', e);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'participantJoined'
              }));
            });

            api.addEventListener('participantLeft', (e) => {
              console.log('👤 Katılımcı ayrıldı:', e);
            });

            api.addEventListener('readyToClose', () => {
              console.log('🔒 Jitsi kapanıyor');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'close'
              }));
            });

            // MEDIA EVENT'LERİ - Android debug için
            api.addEventListener('audioAvailabilityChanged', (e) => {
              console.log('🎤 Ses durumu değişti:', e);
            });

            api.addEventListener('videoAvailabilityChanged', (e) => {
              console.log('📹 Video durumu değişti:', e);
            });

            api.addEventListener('deviceListChanged', (e) => {
              console.log('🔧 Cihaz listesi değişti:', e);
            });

            api.addEventListener('mediaSessionStatus', (e) => {
              console.log('📞 Media session durumu:', e);
            });

            // Hata yakalama
            api.addEventListener('errorOccurred', (error) => {
              console.error('❌ Jitsi hatası:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                data: error
              }));
            });

            // Conference events
            api.addEventListener('conferenceJoined', () => {
              console.log('🎉 Conference joined');
            });

            api.addEventListener('conferenceLeft', () => {
              console.log('🚪 Conference left');
            });

          } catch (error) {
            console.error('❌ Jitsi başlatma hatası:', error);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.toString()
            }));
          }
        }

        // Sayfa yüklendiğinde Jitsi'yi başlat
        console.log('📄 DOM yüklendi, Jitsi başlatılıyor...');
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', startJitsi);
        } else {
          startJitsi();
        }

        // Fallback: 3 saniye sonra başlat
        setTimeout(() => {
          if (!window.jitsiAPI) {
            console.log('🕒 Fallback: Jitsi timeout ile başlatılıyor...');
            startJitsi();
          }
        }, 3000);

      </script>
    </body>
    </html>
  `;

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
        enabled={Platform.OS === 'ios'}
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
              <Text style={[styles.refreshHint, { color: currentColors.tertiary }]}>
                ↻ Yukarı çekerek yenileyin
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
            paddingBottom: Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight : 
                          Platform.OS === 'ios' && keyboardHeight > 0 ? 10 : 12
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

      <View style={[
        styles.infoCard, 
        { 
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
          borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
          marginBottom: Math.max(insets.bottom, 16) 
        }
      ]}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoTextContainer}>
          <Text style={[styles.infoTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>
            İpucu
          </Text>
          <Text style={[styles.infoText, { color: isDark ? '#60a5fa' : '#1e40af' }]}>
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
        statusBarTranslucent={false}
      >
        <SafeAreaView style={styles.videoContainer} edges={['top', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="#1e293b" translucent={false} />
          
          <View style={styles.videoSafeArea}>
            <View style={styles.videoHeader}>
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
          </View>

          {roomId ? (
            <View style={styles.webviewWrapper}>
              {/* BEKLEME OVERLAY - Admin henüz katılmadıysa göster */}
              {videoCallStatus === 'waiting' && (
                <View style={styles.waitingOverlayContainer}>
                  <View style={styles.waitingCard}>
                    <ActivityIndicator size="large" color="#3b82f6" style={styles.waitingSpinner} />
                    <Text style={styles.waitingIcon}>⏳</Text>
                    <Text style={styles.waitingOverlayTitle}>Uzman Bekleniyor</Text>
                    <Text style={styles.waitingOverlayText}>
                      Uzman görüşmeye katıldığında otomatik olarak bağlanacaksınız
                    </Text>
                    <Text style={styles.waitingOverlaySubtext}>
                      Lütfen bu ekranda bekleyiniz...
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.webviewContainer}>
                <WebView
                  ref={webViewRef}
                  source={{
                    html: jitsiHTML,
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
                  allowFileAccessFromFileURLs={true}
                  
                  // ANDROID KRİTİK AYARLAR
                  androidLayerType="hardware"
                  androidHardwareAccelerationDisabled={false}
                  cacheEnabled={true}
                  thirdPartyCookiesEnabled={true}
                  sharedCookiesEnabled={true}
                  
                  // ANDROID MEDIA İZİNLERİ
                  mediaCapturePermissionGrantType="grant"
                  onPermissionRequest={(event) => {
                    console.log('🔐 WebView permission request:', event.nativeEvent.resources);
                    // Tüm izinleri HEMEN ver
                    if (event.nativeEvent.resources.includes('video-capture') || 
                        event.nativeEvent.resources.includes('audio-capture')) {
                      event.nativeEvent.grant(event.nativeEvent.resources);
                      console.log('✅ WebView media izinleri verildi:', event.nativeEvent.resources);
                    }
                  }}
                  
                  // ANDROID FIX: WebView message handling
                  onMessage={(event) => {
                    try {
                      const message = JSON.parse(event.nativeEvent.data);
                      console.log('📱 Jitsi Event:', message.type);

                      if (message.type === 'close' || message.type === 'left') {
                        console.log('🚪 Call ended by user');
                        handleEndCall();
                      } else if (message.type === 'joined') {
                        console.log('✅ Conference joined successfully');
                        setVideoCallStatus('connected');
                      } else if (message.type === 'participantJoined') {
                        console.log('👤 Participant joined - admin connected!');
                        setVideoCallStatus('connected');
                      } else if (message.type === 'error') {
                        console.error('❌ Jitsi Error:', message);
                        // Media hatası durumunda kullanıcıyı bilgilir
                        if (message.message && message.message.includes('media')) {
                          Alert.alert(
                            'Medya Hatası', 
                            'Kamera veya mikrofon başlatılamadı. Lütfen uygulama izinlerini kontrol edin.',
                            [{ text: 'Tamam', onPress: handleEndCall }]
                          );
                        }
                      }
                    } catch (error) {
                      console.error('Message parse error:', error);
                    }
                  }}
                  
                  onLoadStart={() => {
                    console.log('🌐 WebView yükleniyor...');
                    setWebViewLoaded(false);
                  }}
                  
                  onLoadEnd={() => {
                    console.log('✅ WebView yüklendi');
                    setWebViewLoaded(true);
                  }}
                  
                  onLoadProgress={({ nativeEvent }) => {
                    console.log(`📊 WebView progress: ${Math.round(nativeEvent.progress * 100)}%`);
                  }}
                  
                  onError={(error) => {
                    console.error('❌ WebView error:', error.nativeEvent);
                    Alert.alert('Yükleme Hatası', 'Video görüşme başlatılamadı. Lütfen tekrar deneyin.');
                  }}
                  
                  onHttpError={(error) => {
                    console.error('❌ WebView HTTP error:', error.nativeEvent);
                  }}
                  
                  onContentProcessDidTerminate={() => {
                    console.log('🔄 WebView process terminated, reloading...');
                    webViewRef.current?.reload();
                  }}
                  
                  renderLoading={() => (
                    <View style={styles.webviewLoading}>
                      <ActivityIndicator size="large" color="#3b82f6" />
                      <Text style={styles.webviewLoadingText}>Jitsi Meet başlatılıyor...</Text>
                      <Text style={styles.webviewLoadingSubtext}>
                        {Platform.OS === 'android' ? 'Android media ayarları yapılıyor...' : 'iOS optimizasyonu aktif'}
                      </Text>
                    </View>
                  )}
                />
              </View>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Oda hazırlanıyor...</Text>
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
  },

  // Header styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
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
    backgroundColor: '#6b7280',
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
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
    marginBottom: 16,
  },
  refreshHint: {
    fontSize: 12,
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
    borderWidth: 1,
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
  },
  messageTime: {
    fontSize: 10,
    marginLeft: 8,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  expertMessageTime: {
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  userMessageText: {
    color: '#fff'
  },
  expertMessageText: {
  },

  // Input area
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40,
    borderWidth: 1,
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
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
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
    marginBottom: 2
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Video call modal
  videoContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  videoSafeArea: {
    backgroundColor: '#1e293b',
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

  // WebView wrapper
  webviewWrapper: {
    flex: 1,
    position: 'relative',
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
  webviewLoadingSubtext: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 12,
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
  waitingOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
  },
  waitingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  waitingSpinner: {
    marginBottom: 16,
  },
  waitingIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  waitingOverlayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  waitingOverlayText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  waitingOverlaySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic'
  },
});