import { Platform, Alert, Linking } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

/**
 * ✅ MODERN EXPO PERMISSIONS API
 * expo-permissions is DEPRECATED - using expo-camera and expo-av instead
 */

// ✅ Kamera ve mikrofon izinlerini kontrol et
export const checkCameraAndMicrophonePermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    console.log('🔍 Checking camera and microphone permissions...');

    // Kamera izinlerini kontrol et
    const cameraPermission = await Camera.getCameraPermissionsAsync();
    console.log('📷 Camera permission status:', cameraPermission.status);

    // Mikrofon izinlerini kontrol et
    const audioPermission = await Audio.getPermissionsAsync();
    console.log('🎤 Audio permission status:', audioPermission.status);

    const granted = (
      cameraPermission.status === 'granted' && 
      audioPermission.status === 'granted'
    );

    console.log('✅ All permissions granted:', granted);
    return granted;
  } catch (error) {
    console.error('❌ Permission check error:', error);
    return false;
  }
};

// ✅ Kamera ve mikrofon izinlerini iste
export const requestCameraAndMicrophonePermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    console.log('📝 Requesting camera and microphone permissions...');

    // Önce mevcut izinleri kontrol et
    const existingCameraPermission = await Camera.getCameraPermissionsAsync();
    const existingAudioPermission = await Audio.getPermissionsAsync();

    let cameraPermission = existingCameraPermission;
    let audioPermission = existingAudioPermission;

    // Kamera izni yoksa iste
    if (existingCameraPermission.status !== 'granted') {
      console.log('📷 Requesting camera permission...');
      cameraPermission = await Camera.requestCameraPermissionsAsync();
    }

    // Mikrofon izni yoksa iste
    if (existingAudioPermission.status !== 'granted') {
      console.log('🎤 Requesting microphone permission...');
      audioPermission = await Audio.requestPermissionsAsync();
    }

    console.log('📷 Final camera permission:', cameraPermission.status);
    console.log('🎤 Final audio permission:', audioPermission.status);

    const granted = (
      cameraPermission.status === 'granted' && 
      audioPermission.status === 'granted'
    );

    if (!granted) {
      console.log('❌ Permissions denied');
      
      // ✅ Kullanıcıyı ayarlara yönlendir
      if (cameraPermission.canAskAgain === false || audioPermission.canAskAgain === false) {
        Alert.alert(
          'İzin Gerekli',
          'Görüntülü görüşme için kamera ve mikrofon izinleri gereklidir. Lütfen uygulama ayarlarından izinleri etkinleştirin.',
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'Ayarları Aç', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
      }
    } else {
      console.log('✅ All permissions granted successfully');
    }

    return granted;
  } catch (error) {
    console.error('❌ Permission request error:', error);
    Alert.alert(
      'Hata',
      'İzinler alınırken bir hata oluştu. Lütfen tekrar deneyin.'
    );
    return false;
  }
};

// ✅ Sadece kamera izni kontrol et
export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    const permission = await Camera.getCameraPermissionsAsync();
    return permission.status === 'granted';
  } catch (error) {
    console.error('❌ Camera permission check error:', error);
    return false;
  }
};

// ✅ Sadece kamera izni iste
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    const existingPermission = await Camera.getCameraPermissionsAsync();
    
    if (existingPermission.status === 'granted') {
      return true;
    }

    const permission = await Camera.requestCameraPermissionsAsync();
    
    if (permission.status !== 'granted' && permission.canAskAgain === false) {
      Alert.alert(
        'Kamera İzni Gerekli',
        'Lütfen uygulama ayarlarından kamera iznini etkinleştirin.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Ayarları Aç', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
    }

    return permission.status === 'granted';
  } catch (error) {
    console.error('❌ Camera permission request error:', error);
    return false;
  }
};

// ✅ Sadece mikrofon izni kontrol et
export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    const permission = await Audio.getPermissionsAsync();
    return permission.status === 'granted';
  } catch (error) {
    console.error('❌ Microphone permission check error:', error);
    return false;
  }
};

// ✅ Sadece mikrofon izni iste
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    const existingPermission = await Audio.getPermissionsAsync();
    
    if (existingPermission.status === 'granted') {
      return true;
    }

    const permission = await Audio.requestPermissionsAsync();
    
    if (permission.status !== 'granted' && permission.canAskAgain === false) {
      Alert.alert(
        'Mikrofon İzni Gerekli',
        'Lütfen uygulama ayarlarından mikrofon iznini etkinleştirin.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Ayarları Aç', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
    }

    return permission.status === 'granted';
  } catch (error) {
    console.error('❌ Microphone permission request error:', error);
    return false;
  }
};

// ✅ Medya kütüphanesi izinlerini kontrol et
export const getMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('❌ Media library permission check error:', error);
    return false;
  }
};

// ✅ Medya kütüphanesi izinlerini iste
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return true;

    const existingPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (existingPermission.status === 'granted') {
      return true;
    }

    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted' && canAskAgain === false) {
      Alert.alert(
        'Medya Kütüphanesi İzni Gerekli',
        'Lütfen uygulama ayarlarından medya kütüphanesi iznini etkinleştirin.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Ayarları Aç', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
    }

    return status === 'granted';
  } catch (error) {
    console.error('❌ Media library permission request error:', error);
    return false;
  }
};

// ✅ Tüm izinlerin durumunu kontrol et
export const checkAllPermissions = async () => {
  try {
    const camera = await checkCameraPermission();
    const microphone = await checkMicrophonePermission();
    const mediaLibrary = await getMediaLibraryPermissions();

    console.log('📊 Permission Status:');
    console.log('  📷 Camera:', camera);
    console.log('  🎤 Microphone:', microphone);
    console.log('  🖼️ Media Library:', mediaLibrary);

    return {
      camera,
      microphone,
      mediaLibrary,
      allGranted: camera && microphone && mediaLibrary
    };
  } catch (error) {
    console.error('❌ Check all permissions error:', error);
    return {
      camera: false,
      microphone: false,
      mediaLibrary: false,
      allGranted: false
    };
  }
};
