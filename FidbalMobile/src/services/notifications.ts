import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// ✅ Notification handler - Expo SDK 54+ uyumlu
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Genel Bildirimler',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });

    await Notifications.setNotificationChannelAsync('sleep', {
      name: 'Uyku Hatırlatmaları',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 100, 300],
      lightColor: '#6366f1',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('relaxation', {
      name: 'Rahatlama Hatırlatmaları',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200],
      lightColor: '#8b5cf6',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mesajlar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#10b981',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('video_calls', {
      name: 'Video Aramalar',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#ef4444',
      sound: 'default',
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
      console.log('❌ Push bildirim izni verilmedi!');
      return;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: '61f6b7c6-54a2-4315-81a7-6f8fc7095f0a'
      })).data;
      console.log('📱 Push Token:', token);

      try {
        await api.post('/user/push-token', { pushToken: token });
        console.log('✅ Push token backend\'e kaydedildi');
      } catch (error) {
        console.error('❌ Push token kayıt hatası:', error);
      }
    } catch (tokenError) {
      console.error('❌ Push token alınamadı:', tokenError);
    }
  } else {
    console.log('⚠️ Push bildirimler sadece fiziksel cihazlarda çalışır!');
  }

  return token;
}

// ✅ 1. AKŞAM 21:00 - UYKU KAYDI HATIRLATMASI (TÜM KULLANICILAR)
export async function scheduleSleepReminder() {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const sleepNotifications = allNotifications.filter(n => n.content.data?.type === 'sleep_reminder');

    for (const notif of sleepNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '😴 Uyku Kaydı Hatırlatması',
        body: 'Lütfen uyku kaydınızı giriniz',
        data: { type: 'sleep_reminder', screen: 'Sleep' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: 'sleep',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21,
        minute: 0,
      },
    });

    console.log('✅ Günlük uyku hatırlatması ayarlandı (21:00) - ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Uyku hatırlatma hatası:', error);
    return null;
  }
}

// ✅ 2. DENEY GRUBU - HAFTALIK RAHATLAMA BİLDİRİMLERİ (SAAT 19:00)
export async function scheduleWeeklyRelaxationReminders() {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const relaxNotifications = allNotifications.filter(n => n.content.data?.type === 'relaxation_reminder');

    for (const notif of relaxNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    const weeklyProgram = [
      { 
        day: 1, 
        name: 'Pazar', 
        title: 'Kutu Nefes Tekniği', 
        body: 'Kutu Nefes Tekniği egzersizini dinlemeyi unutmayın!',
        category: 'breathing', 
        icon: '🌬️' 
      },
      { 
        day: 2, 
        name: 'Pazartesi', 
        title: 'Delta Sesi', 
        body: 'Delta Sesi egzersizini dinlemeyi unutmayın!',
        category: 'binaural', 
        type: 'delta', 
        icon: '🌙' 
      },
      { 
        day: 3, 
        name: 'Salı', 
        title: 'Rehberli İmgeleme', 
        body: 'Rehberli İmgeleme egzersizini dinlemeyi unutmayın!',
        category: 'meditation', 
        icon: '🧘' 
      },
      { 
        day: 4, 
        name: 'Çarşamba', 
        title: 'Theta Sesi', 
        body: 'Theta Sesi egzersizini dinlemeyi unutmayın!',
        category: 'binaural', 
        type: 'theta', 
        icon: '🌅' 
      },
      { 
        day: 5, 
        name: 'Perşembe', 
        title: 'Progresif Kas Gevşeme', 
        body: 'Progresif Kas Gevşeme egzersizini dinlemeyi unutmayın!',
        category: 'meditation', 
        icon: '💆' 
      },
      { 
        day: 6, 
        name: 'Cuma', 
        title: 'Alpha Sesi', 
        body: 'Alpha Sesi egzersizini dinlemeyi unutmayın!',
        category: 'binaural', 
        type: 'alpha', 
        icon: '☀️' 
      },
    ];

    const scheduledIds: string[] = [];

    for (const program of weeklyProgram) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${program.icon} ${program.name}`,
          body: program.body,
          data: {
            type: 'relaxation_reminder',
            category: program.category,
            binauralType: program.type,
            screen: program.category === 'binaural' ? 'Binaural' : 'Relaxation',
            day: program.name
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          categoryIdentifier: 'relaxation',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: program.day,
          hour: 19,
          minute: 0,
        },
      });

      scheduledIds.push(notificationId);
    }

    console.log('✅ Haftalık rahatlama hatırlatmaları ayarlandı (19:00)');
    console.log('📋 Program: Pazar-Cuma arası, 6 bildirim zamanlandı');
    
    return scheduledIds;
  } catch (error) {
    console.error('❌ Rahatlama hatırlatma hatası:', error);
    return [];
  }
}

// ✅ 3. YENİ MESAJ BİLDİRİMİ
export async function sendNewMessageNotification(senderName: string, messagePreview: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💬 ${senderName}`,
        body: messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview,
        data: {
          type: 'new_message',
          screen: 'Support',
          sender: senderName
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: 'messages',
      },
      trigger: null,
    });

    console.log('✅ Mesaj bildirimi gönderildi');
  } catch (error) {
    console.error('❌ Mesaj bildirimi hatası:', error);
  }
}

// ✅ 4. VIDEO ARAMA TALEBİ BİLDİRİMİ
export async function sendVideoCallRequestNotification(
  expertName: string,
  roomName: string,
  scheduledTime?: string
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📹 Görüntülü Arama Talebi',
        body: scheduledTime
          ? `${expertName} ile ${scheduledTime} tarihinde görüşme talebiniz var.`
          : `${expertName} ile görüşme talebi geldi. Hemen katılabilirsiniz!`,
        data: {
          type: 'video_call_request',
          screen: 'VideoCall',
          roomName,
          expertName,
          scheduledTime
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'video_calls',
      },
      trigger: null,
    });

    console.log('✅ Video arama bildirimi gönderildi');
  } catch (error) {
    console.error('❌ Video arama bildirimi hatası:', error);
  }
}

// ✅ 5. FORM DOLDURMA HATIRLATMASI
export async function sendFormReminderNotification(formTitle: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Form Hatırlatması',
        body: `"${formTitle}" formunu doldurmayı unutmayın!`,
        data: {
          type: 'form_reminder',
          screen: 'Forms',
          formTitle
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: null,
    });

    console.log('✅ Form hatırlatma bildirimi gönderildi');
  } catch (error) {
    console.error('❌ Form bildirimi hatası:', error);
  }
}

// ✅ 6. TÜM BİLDİRİMLERİ İPTAL ET
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Tüm zamanlanmış bildirimler iptal edildi');
  } catch (error) {
    console.error('❌ Bildirim iptal hatası:', error);
  }
}

export async function cancelSleepReminders() {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const sleepNotifications = allNotifications.filter(n => n.content.data?.type === 'sleep_reminder');

    for (const notif of sleepNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    console.log('✅ Uyku hatırlatmaları iptal edildi');
  } catch (error) {
    console.error('❌ Uyku hatırlatma iptal hatası:', error);
  }
}

export async function cancelRelaxationReminders() {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const relaxNotifications = allNotifications.filter(n => n.content.data?.type === 'relaxation_reminder');

    for (const notif of relaxNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    console.log('✅ Rahatlama hatırlatmaları iptal edildi');
  } catch (error) {
    console.error('❌ Rahatlama hatırlatma iptal hatası:', error);
  }
}

// ✅ 7. TEST BİLDİRİMİ
export async function sendTestNotification() {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Bildirimi',
        body: 'Bu bir test bildirimidir. Bildirimler çalışıyor!',
        data: { type: 'test' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });

    console.log('✅ Test bildirimi gönderildi - ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Test bildirimi hatası:', error);
    return null;
  }
}

// ✅ 8. GENEL BİLDİRİM GÖNDER
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any,
  delaySeconds?: number
) {
  try {
    const trigger = delaySeconds 
      ? {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        }
      : null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || { type: 'local' },
        sound: true,
      },
      trigger,
    });

    console.log('✅ Özel bildirim gönderildi - ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Özel bildirim hatası:', error);
    return null;
  }
}

// ✅ 9. TÜM BİLDİRİMLERİ LİSTELE (DEBUG)
export async function listScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Zamanlanmış Bildirimler:', notifications.length);

    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.content.title}`);
      console.log(`   ID: ${notif.identifier}`);
      console.log(`   Type: ${notif.content.data?.type}`);
      console.log(`   Trigger:`, JSON.stringify(notif.trigger, null, 2));
    });

    return notifications;
  } catch (error) {
    console.error('❌ Bildirim listeleme hatası:', error);
    return [];
  }
}

// ✅ 10. BİLDİRİM İZİNLERİNİ KONTROL ET
export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    console.log('📋 Bildirim izin durumu:', status);
    return status === 'granted';
  } catch (error) {
    console.error('❌ İzin kontrolü hatası:', error);
    return false;
  }
}

// ✅ 11. BİLDİRİM İZNİ İSTE
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('❌ İzin isteme hatası:', error);
    return false;
  }
}