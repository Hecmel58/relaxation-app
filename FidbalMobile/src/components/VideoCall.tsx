import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../store/authStore';

interface VideoCallProps {
  roomName: string;
  onCallEnd: () => void;
}

export default function VideoCall({ roomName, onCallEnd }: VideoCallProps) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);

  const jitsiConfig = {
    room: roomName,
    userInfo: {
      displayName: user?.name || 'Kullanıcı',
      email: user?.phone ? `${user.phone}@fidbal.com` : undefined,
    },
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      disableDeepLinking: true,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'hangup',
        'chat',
        'raisehand',
        'tileview',
      ],
      MOBILE_APP_PROMO: false,
      SHOW_JITSI_WATERMARK: false,
    },
  };

  const jitsiUrl = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName="${encodeURIComponent(user?.name || 'Kullanıcı')}"`;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'readyToClose') {
        onCallEnd();
      }
    } catch (error) {
      console.error('Jitsi message error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
      <WebView
        source={{ uri: jitsiUrl }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    zIndex: 10,
  },
});