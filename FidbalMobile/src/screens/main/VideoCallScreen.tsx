import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { collection, addDoc, query, where, onSnapshot, Timestamp, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { colors } from '../../utils/colors';
import { requestCameraAndMicrophonePermissions, checkCameraAndMicrophonePermissions } from '../../utils/permissions';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoCallScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);
  const currentColors = isDark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Video call durumunu dinle
  useEffect(() => {
    if (!user?.userId || !db) return;

    console.log('📞 Firebase video calls dinleniyor...');

    const videoCallsQuery = query(
      collection(db, 'videoCalls'),
      where('userId', '==', user.userId)
    );

    const unsubscribe = onSnapshot(
      videoCallsQuery,
      async (snapshot) => {
        console.log('📞 Video calls güncellendi, docs sayısı:', snapshot.docs.length);

        if (snapshot.docs.length === 0) {
          if (callStatus !== 'idle') {
            setCallStatus('idle');
          }
          return;
        }

        for (const docSnapshot of snapshot.docs) {
          const call = docSnapshot.data();
          const callId = docSnapshot.id;

          console.log('📞 Video call durumu:', {
            id: callId,
            status: call.status,
            roomId: call.roomId
          });

          // ✅ ADMIN KABUL ETTİ
          if (call.status === 'accepted' && call.roomId) {
            console.log('✅✅✅ ADMIN KABUL ETTİ!');
            
            setCallStatus('connected');
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

            setShowVideoCall(false);
            setCallStatus('idle');
            setCurrentCallId(null);
            setRoomId(null);

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
            setCallStatus('waiting');
          }
        }
      },
      (error) => {
        console.error('❌ Video calls firebase error:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.userId, callStatus]);

  const handleStartVideoCall = async () => {
    if (!user?.userId) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (callStatus === 'waiting' || showVideoCall) {
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
      setCallStatus('waiting');
      setShowVideoCall(true);
      setWebViewLoaded(false);

    } catch (error) {
      console.error('❌ Video call start error:', error);
      Alert.alert('Hata', 'Görüntülü görüşme başlatılamadı. Lütfen tekrar deneyin.');
      setCallStatus('idle');
      setCurrentCallId(null);
      setRoomId(null);
      setShowVideoCall(false);
    }
  };

  const handleEndCall = useCallback(async () => {
    console.log('📞 Video call sonlandırılıyor...');
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setShowVideoCall(false);
    setCallStatus('idle');
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

    setRoomId(null);
  }, [currentCallId, user?.userId]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top', 'bottom']}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={currentColors.surface} 
      />

      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <Text style={[styles.headerTitle, { color: currentColors.primary }]}>Görüntülü Görüşme</Text>
        <Text style={[styles.headerSubtitle, { color: currentColors.secondary }]}>Uzmanlarla yüz yüze görüşün</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.infoSection, { backgroundColor: currentColors.card }]}>
          <Text style={styles.infoIcon}>🎥</Text>
          <Text style={[styles.infoTitle, { color: currentColors.primary }]}>Görüntülü Destek</Text>
          <Text style={[styles.infoText, { color: currentColors.secondary }]}>
            Uyku uzmanlarımızla güvenli Jitsi Meet platformu üzerinden görüntülü görüşme yapabilirsiniz.
          </Text>
        </View>

        <View style={[styles.featuresSection, { backgroundColor: currentColors.card }]}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={[styles.featureText, { color: currentColors.primary }]}>Uçtan uca şifreli bağlantı</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={[styles.featureText, { color: currentColors.primary }]}>Kayıt yapılmaz</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={[styles.featureText, { color: currentColors.primary }]}>Hafta içi 09:00-18:00</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: '#10b981' }, loading && styles.startButtonDisabled]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleStartVideoCall();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.startButtonIcon}>🎥</Text>
              <Text style={styles.startButtonText}>Görüşme Başlat</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={[styles.noteCard, { 
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
          borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'
        }]}>
          <Text style={styles.noteIcon}>💡</Text>
          <Text style={[styles.noteText, { color: isDark ? '#60a5fa' : '#1e40af' }]}>
            Görüşme talebi gönderildiğinde, uygun uzman size katılacaktır. Lütfen bekleyiniz.
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
              {callStatus === 'waiting' && (
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
                        setCallStatus('connected');
                      } else if (message.type === 'participantJoined') {
                        console.log('👤 Participant joined - admin connected!');
                        setCallStatus('connected');
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
  container: { 
    flex: 1, 
  },
  header: { 
    padding: 16, 
    borderBottomWidth: 1, 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
  },
  headerSubtitle: { 
    fontSize: 14, 
    marginTop: 4 
  },
  content: { 
    flex: 1, 
    padding: 16 
  },
  infoSection: { 
    borderRadius: 12, 
    padding: 24, 
    alignItems: 'center', 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  infoIcon: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  infoTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  infoText: { 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 20 
  },
  featuresSection: { 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  featureIcon: { 
    fontSize: 20, 
    marginRight: 12 
  },
  featureText: { 
    fontSize: 14, 
  },
  startButton: { 
    padding: 18, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16,
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
  startButtonDisabled: { 
    opacity: 0.6 
  },
  startButtonIcon: { 
    fontSize: 24, 
    marginRight: 8 
  },
  startButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  noteCard: { 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
  },
  noteIcon: { 
    fontSize: 20, 
    marginRight: 8 
  },
  noteText: { 
    flex: 1, 
    fontSize: 13, 
  },
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
  webviewWrapper: {
    flex: 1,
    position: 'relative',
  },
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