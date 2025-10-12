import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Push bildirim izni verilmedi!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Token'ı backend'e kaydet
    try {
      await api.post('/users/push-token', { pushToken: token });
    } catch (error) {
      console.error('Push token kayıt hatası:', error);
    }
  } else {
    alert('Push bildirimler sadece fiziksel cihazlarda çalışır!');
  }

  return token;
}

export async function scheduleSleepReminder(hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Uyku Vakti! 😴',
      body: 'Kaliteli bir uyku için yatma saatiniz geldi.',
      data: { type: 'sleep_reminder' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'local' },
    },
    trigger: null,
  });
}