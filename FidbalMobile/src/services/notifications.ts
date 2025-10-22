import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// ✅ DÜZELTİLDİ: shouldShowBanner ve shouldShowList
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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

    // ✅ Özel kanallar
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

    await Notifications.setNotificationChannelAsync('relaxation', {
      name: 'Rahatlama Hatırlatmaları',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200],
      lightColor: '#8b5cf6',
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

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('📱 Push Token:', token);

    // ✅ Token'ı backend'e kaydet
    try {
      await api.post('/user/push-token', { pushToken: token });
      console.log('✅ Push token backend\'e kaydedildi');
    } catch (error) {
      console.error('❌ Push token kayıt hatası:', error);
    }
  } else {
    console.log('⚠️ Push bildirimler sadece fiziksel cihazlarda çalışır!');
  }

  return token;
}

// ✅ 1. AKŞAM 10'DA UYKU VERİSİ HATIRLATMASI (TÜM KULLANICILAR)
export async function scheduleSleepReminder() {
  try {
    // Mevcut uyku hatırlatmasını iptal et
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const sleepNotifications = allNotifications.filter(n => n.content.data?.type === 'sleep_reminder');

    for (const notif of sleepNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    // ✅ Her gün akşam 22:00'de bildirim
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '😴 Uyku Verisi Hatırlatması',
        body: 'Bugünkü uyku verinizi girmeyi unutmayın! Verileriniz araştırma için önemli.',
        data: { type: 'sleep_reminder', screen: 'Sleep' },
        sound: true,
      },
      trigger: {
        hour: 22,
        minute: 0,
        repeats: true,
      },
    });

    console.log('✅ Günlük uyku hatırlatması ayarlandı (22:00)');
  } catch (error) {
    console.error('❌ Uyku hatırlatma hatası:', error);
  }
}

// ✅ 2. DENEY GRUBU - HAFTALIK RAHATLAMA BİLDİRİMLERİ (SAAT 19:00)
export async function scheduleWeeklyRelaxationReminders() {
  try {
    // Mevcut rahatlama bildirimlerini iptal et
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const relaxNotifications = allNotifications.filter(n => n.content.data?.type === 'relaxation_reminder');

    for (const notif of relaxNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    // ✅ Haftalık program
    const weeklyProgram = [
      { day: 1, name: 'Pazar', title: 'Kutu Nefes Tekniği', category: 'breathing', icon: '🌬️' },
      { day: 2, name: 'Pazartesi', title: 'Delta Sesi', category: 'binaural', type: 'delta', icon: '🌙' },
      { day: 3, name: 'Salı', title: 'Rehberli İmgeleme', category: 'meditation', icon: '🧘' },
      { day: 4, name: 'Çarşamba', title: 'Theta Sesi', category: 'binaural', type: 'theta', icon: '🌅' },
      { day: 5, name: 'Perşembe', title: 'Progresif Kas Gevşeme', category: 'meditation', icon: '💆' },
      { day: 6, name: 'Cuma', title: 'Alpha Sesi', category: 'binaural', type: 'alpha', icon: '☀️' },
      { day: 7, name: 'Cumartesi', title: 'Serbest Gün', category: null, icon: '🎉' }, // Cumartesi serbest
    ];

    for (const program of weeklyProgram) {
      if (!program.category) continue; // Cumartesi atla

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${program.icon} ${program.name} - Rahatlama Zamanı`,
          body: `Bugün "${program.title}" tekniğini deneme zamanı! Saat 19:00'da başlayalım.`,
          data: {
            type: 'relaxation_reminder',
            category: program.category,
            binauralType: program.type,
            screen: program.category === 'binaural' ? 'Binaural' : 'Relaxation',
            day: program.name
          },
          sound: true,
        },
        trigger: {
          weekday: program.day,
          hour: 19,
          minute: 0,
          repeats: true,
        },
      });
    }

    console.log('✅ Haftalık rahatlama hatırlatmaları ayarlandı (19:00)');
    console.log('📋 Program: Pazar-Cuma arası, Cumartesi serbest');
  } catch (error) {
    console.error('❌ Rahatlama hatırlatma hatası:', error);
  }
}

// ✅ 3. YENİ MESAJ BİLDİRİMİ
export async function sendNewMessageNotification(senderName: string, messagePreview: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💬 ${senderName}`,
        body: messagePreview,
        data: {
          type: 'new_message',
          screen: 'Support',
          sender: senderName
        },
        sound: true,
        categoryIdentifier: 'messages',
      },
      trigger: null, // Hemen gönder
    });

    console.log('✅ Mesaj bildirimi gönderildi');
  } catch (error) {
    console.error('❌ Mesaj bildirimi hatası:', error);
  }
}

// ✅ 4. VIDEO ARAMA TALEBİ BİLDİRİMİ (TÜM KULLANICILAR)
export async function sendVideoCallRequestNotification(
  expertName: string,
  roomName: string,
  scheduledTime?: string
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔹 Görüntülü Arama Talebi',
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
        categoryIdentifier: 'video_calls',
      },
      trigger: null, // Hemen gönder
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
      },
      trigger: null,
    });

    console.log('✅ Form hatırlatma bildirimi gönderildi');
  } catch (error) {
    console.error('❌ Form bildirimi hatası:', error);
  }
}

// ✅ 6. BİLDİRİMLERİ İPTAL ET
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Bildirimi',
        body: 'Bu bir test bildirimidir. Bildirimler çalışıyor!',
        data: { type: 'test' },
        sound: true,
      },
      trigger: { seconds: 2 },
    });

    console.log('✅ Test bildirimi gönderildi');
  } catch (error) {
    console.error('❌ Test bildirimi hatası:', error);
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || { type: 'local' },
        sound: true,
      },
      trigger: delaySeconds ? { seconds: delaySeconds } : null,
    });

    console.log('✅ Özel bildirim gönderildi');
  } catch (error) {
    console.error('❌ Özel bildirim hatası:', error);
  }
}

// ✅ 9. TÜMU BİLDİRİMLERİ LİSTELE (DEBUG)
export async function listScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Zamanlanmış Bildirimler:', notifications.length);

    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.content.title}`);
      console.log(`   Type: ${notif.content.data?.type}`);
      console.log(`   Trigger:`, notif.trigger);
    });

    return notifications;
  } catch (error) {
    console.error('❌ Bildirim listeleme hatası:', error);
    return [];
  }
}