import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../store/authStore';

interface VideoCallProps {
  roomName: string;
  onCallEnd: () => void;
}

export default function VideoCall({ roomName, onCallEnd }: VideoCallProps) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);

  const jitsiUrl = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName="${encodeURIComponent(user?.name || 'Kullanıcı')}"`;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'videoConferenceLeft') {
        onCallEnd();
      }
    } catch (error) {
      console.log('WebView message error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Görüşme hazırlanıyor...</Text>
        </View>
      )}
      <WebView
        source={{ uri: jitsiUrl }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },
  loadingContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#0f172a',
    zIndex: 999,
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#fff',
    fontWeight: '600',
  },
});