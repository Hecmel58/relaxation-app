import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useOfflineStore } from '../store/offlineStore';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../utils/colors';
import * as Haptics from 'expo-haptics';

interface OfflineBannerProps {
  showPendingCount?: boolean;
  onSyncPress?: () => void;
}

/**
 * Offline Banner Component
 * Network durumunu ve bekleyen istekleri gösterir
 * 
 * @param showPendingCount - Bekleyen istek sayısını göster
 * @param onSyncPress - Sync butonuna basıldığında çağrılır
 */
export default function OfflineBanner({ 
  showPendingCount = true, 
  onSyncPress 
}: OfflineBannerProps) {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const isSyncing = useOfflineStore((state) => state.isSyncing);
  const pendingCount = useOfflineStore((state) => state.getPendingCount());
  const syncPendingRequests = useOfflineStore((state) => state.syncPendingRequests);
  const isDark = useThemeStore((state) => state.isDark);
  const currentColors = isDark ? colors.dark : colors.light;

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOnline) {
      // Offline olunca banner'ı göster
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Online olunca banner'ı gizle
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOnline]);

  const handleSyncPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (onSyncPress) {
      onSyncPress();
    } else {
      await syncPendingRequests();
    }
  };

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: currentColors.warning,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📡</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Offline Mod</Text>
          {showPendingCount && pendingCount > 0 && (
            <Text style={styles.subtitle}>
              {pendingCount} bekleyen işlem
            </Text>
          )}
        </View>

        {isOnline && pendingCount > 0 && (
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleSyncPress}
            disabled={isSyncing}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? '⏳' : '🔄'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  syncButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 18,
  },
});
