import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, LogBox, Platform, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import {
  registerForPushNotifications,
  scheduleSleepReminder,
} from './src/services/notifications';
import { Audio } from 'expo-av';
import { useAuthStore } from './src/store/authStore';
import { useThemeStore } from './src/store/themeStore';
import { useOfflineStore } from './src/store/offlineStore';

// ✅ Tüm log'ları kapat
LogBox.ignoreAllLogs(true);

// ✅ Notification handler - DÜZELTİLDİ
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // ✅ DEĞİŞTİ: shouldShowAlert yerine
    shouldShowList: true,     // ✅ DEĞİŞTİ: Yeni eklendi
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const appState = useRef(AppState.currentState);
  const inactiveTimer = useRef<NodeJS.Timeout | null>(null);

  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // ✅ YENİ: Login kontrolü için
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const loadPendingRequests = useOfflineStore((state) => state.loadPendingRequests);

  useEffect(() => {
    initializeApp();

    // ✅ AUTO-LOCK: 5 dakika hareketsizlik sonrası logout
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
        // Arka plana geçince timer başlat
        inactiveTimer.current = setTimeout(() => {
          console.log('⏰ Auto-lock: Logging out due to inactivity');
          logout();
        }, 5 * 60 * 1000); // 5 dakika
      }

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Ön plana gelince timer'ı iptal et
        if (inactiveTimer.current) {
          clearTimeout(inactiveTimer.current);
          inactiveTimer.current = null;
        }
      }

      appState.current = nextAppState;
    });

    // Cleanup
    return () => {
      subscription.remove();
      if (inactiveTimer.current) {
        clearTimeout(inactiveTimer.current);
      }
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // ✅ YENİ: Login sonrası push token kaydet
  useEffect(() => {
    if (isAuthenticated) {
      // Kullanıcı giriş yaptıktan sonra push token kaydet
      setTimeout(() => {
        registerForPushNotifications().catch(err => {
          console.log('⚠️ Push token kaydedilemedi:', err.message);
        });
      }, 1000);
    }
  }, [isAuthenticated]);

  const initializeApp = async () => {
    try {
      // ✅ 1. Auth yükle
      await loadStoredAuth();

      // ✅ 2. Tema yükle
      await loadTheme();

      // ✅ 3. Offline queue yükle
      await loadPendingRequests();

      // ✅ 4. Audio ayarları
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // ✅ 5. Push notification setup (SADECE UYKU HATIRLATMASI)
      await setupNotifications();

      // ✅ 6. Splash animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      // ✅ 7. Splash ekranını kapat
      setTimeout(() => {
        setIsReady(true);
      }, 2000);
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setIsReady(true);
    }
  };

  const setupNotifications = async () => {
    try {
      // ✅ DEĞİŞTİ: Push token kaydını buradan KALDIRDIK (login sonrasına taşındı)
      // await registerForPushNotifications(); // ❌ KALDIRILDI

      // ✅ Uyku hatırlatması (giriş olmadan da çalışır)
      await scheduleSleepReminder();
      console.log('✅ Günlük uyku hatırlatması aktif (22:00)');

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('📩 Notification received:', notification.request.content.title);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification clicked:', response.notification.request.content.data);
      });
    } catch (error) {
      console.error('❌ Notification setup error:', error);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View
          style={[
            styles.splashContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.splashIcon}>🌙</Text>
          <Text style={styles.splashTitle}>FidBal</Text>
          <Text style={styles.splashSubtitle}>Uyku ve Stres Yönetimi</Text>
          <Text style={styles.splashVersion}>v1.0.0</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashIcon: {
    fontSize: 100,
    marginBottom: 24,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 18,
    color: '#94a3b8',
  },
  splashVersion: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 16,
  },
});