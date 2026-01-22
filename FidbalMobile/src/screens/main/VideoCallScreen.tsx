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
  const webViewRef = useRef<WebView>(null);

  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log('🧹 VideoCallScreen unmounting...');
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (error) {
          console.error('❌ Unsubscribe error:', error);
        }
        unsubscribeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!user?.userId || !db) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const videoCallsQuery = query(
      collection(db, 'videoCalls'),
      where('userId', '==', user.userId)
    );

    const unsubscribe = onSnapshot(
      videoCallsQuery,
      async (snapshot) => {
        if (!isMountedRef.current) return;

        if (snapshot.docs.length === 0) {
          if (callStatus !== 'idle' && isMountedRef.current) {
            setCallStatus('idle');
          }
          return;
        }

        for (const docSnapshot of snapshot.docs) {
          const call = docSnapshot.data();
          const callId = docSnapshot.id;

          if (call.status === 'accepted' && call.roomId) {
            console.log('✅ Admin accepted!');
            
            if (isMountedRef.current) {
              setCallStatus('connected');
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
              setCallStatus('idle');
              setCurrentCallId(null);
              setRoomId(null);
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
              setCallStatus('waiting');
            }
          }
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.userId, callStatus]);

  const handleStartVideoCall = async () => {
    if (!user?.userId || !isMountedRef.current) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (callStatus === 'waiting' || showVideoCall) {
      Alert.alert('Uyarı', 'Zaten aktif bir görüşme var');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const hasPermissions = await checkCameraAndMicrophonePermissions();
      
      if (!hasPermissions) {
        const granted = await requestCameraAndMicrophonePermissions();
        if (!granted) {
          Alert.alert('İzin Gerekli', 'Kamera ve mikrofon izni gereklidir');
          setLoading(false);
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
        setCallStatus('waiting');
        setShowVideoCall(true);
      }

    } catch (error) {
      console.error('❌ Start error:', error);
      if (isMountedRef.current) {
        Alert.alert('Hata', 'Görüşme başlatılamadı');
        setCallStatus('idle');
        setCurrentCallId(null);
        setRoomId(null);
        setShowVideoCall(false);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleEndCall = useCallback(async () => {
    console.log('📞 Ending call...');
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isMountedRef.current) {
      setShowVideoCall(false);
      setCallStatus('idle');
    }

    if (currentCallId) {
      try {
        await deleteDoc(doc(db, 'videoCalls', currentCallId));
      } catch (error) {
        console.error('Delete error:', error);
        
        try {
          const q = query(
            collection(db, 'videoCalls'),
            where('userId', '==', user?.userId)
          );
          const snapshot = await getDocs(q);
          await Promise.all(
            snapshot.docs.map(doc => deleteDoc(doc.ref))
          );
        } catch (e) {
          console.error('Fallback error:', e);
        }
      }
      
      if (isMountedRef.current) {
        setCurrentCallId(null);
      }
    }

    if (isMountedRef.current) {
      setRoomId(null);
    }
  }, [currentCallId, user?.userId]);

  // ✅ JITSI URL - DOĞRUDAN LINK (WebView source olarak URI kullan)
  const getJitsiURL = useCallback(() => {
    if (!roomId) return '';
    
    // Jitsi config parametreleri URL'de
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
            Uyku uzmanlarımızla güvenli görüşme yapabilirsiniz
          </Text>
        </View>

        <View style={[styles.featuresSection, { backgroundColor: currentColors.card }]}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={[styles.featureText, { color: currentColors.primary }]}>Şifreli bağlantı</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={[styles.featureText, { color: currentColors.primary }]}>Kayıt yapılmaz</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={[styles.featureText, { color: currentColors.primary }]}>09:00-18:00</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: '#10b981' }, loading && styles.startButtonDisabled]}
          onPress={handleStartVideoCall}
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
      </View>

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
              {callStatus === 'waiting' && (
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

              {/* ✅ DOĞRUDAN URL KULLANIMI - HTML YOK */}
              <WebView
                ref={webViewRef}
                source={{ uri: getJitsiURL() }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                {...(Platform.OS === 'ios' ? {
                  // ✅ iOS için kritik ayarlar
                  allowsLinkPreview: false,
                  dataDetectorTypes: 'none',
                  scrollEnabled: false,
                  bounces: false,
                  sharedCookiesEnabled: true,
                  limitsNavigationsToAppBoundDomains: false,
                  allowsBackForwardNavigationGestures: false,
                } : {
                  // Android için
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
  header: { padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  content: { flex: 1, padding: 16 },
  infoSection: { borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16 },
  infoIcon: { fontSize: 64, marginBottom: 16 },
  infoTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  infoText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  featuresSection: { borderRadius: 12, padding: 16, marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  featureIcon: { fontSize: 20, marginRight: 12 },
  featureText: { fontSize: 14 },
  startButton: { padding: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  startButtonDisabled: { opacity: 0.6 },
  startButtonIcon: { fontSize: 24, marginRight: 8 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
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
