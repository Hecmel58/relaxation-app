import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { Camera } from 'expo-camera';

export const requestCameraAndMicrophonePermissions = async (): Promise<boolean> => {
  try {
    console.log('📹 Kamera ve mikrofon izinleri isteniyor...');

    if (Platform.OS === 'android') {
      try {
        // Android için TEK TEK izin iste (requestMultiple sorunlu)
        console.log('📹 Android - Kamera izni isteniyor...');
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Kamera İzni',
            message: 'FidBal görüntülü görüşme için kameranıza erişmek istiyor.',
            buttonNeutral: 'Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'İzin Ver',
          }
        );

        console.log('📹 Android - Mikrofon izni isteniyor...');
        const audioGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Mikrofon İzni',
            message: 'FidBal görüntülü görüşme için mikrofonunuza erişmek istiyor.',
            buttonNeutral: 'Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'İzin Ver',
          }
        );

        console.log('📹 Android izinleri:', {
          camera: cameraGranted,
          audio: audioGranted
        });

        const cameraOk = cameraGranted === PermissionsAndroid.RESULTS.GRANTED;
        const audioOk = audioGranted === PermissionsAndroid.RESULTS.GRANTED;

        if (!cameraOk || !audioOk) {
          Alert.alert(
            'İzin Gerekli',
            'Görüntülü görüşme için kamera ve mikrofon izinleri gereklidir.',
            [{ text: 'Tamam' }]
          );
          return false;
        }

        console.log('✅ Android izinleri verildi!');
        return true;

      } catch (err) {
        console.error('❌ Android izin hatası:', err);
        Alert.alert('Hata', 'İzinler alınırken bir hata oluştu.');
        return false;
      }

    } else if (Platform.OS === 'ios') {
      // iOS için Expo Camera kullan
      console.log('📹 iOS - Kamera izni isteniyor...');
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      
      console.log('📹 iOS - Mikrofon izni isteniyor...');
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();

      console.log('📹 iOS izinleri:', {
        camera: cameraPermission.status,
        audio: microphonePermission.status
      });

      if (cameraPermission.status !== 'granted' || microphonePermission.status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Görüntülü görüşme için kamera ve mikrofon izinleri gereklidir. Lütfen ayarlardan izin verin.',
          [{ text: 'Tamam' }]
        );
        return false;
      }

      console.log('✅ iOS izinleri verildi!');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ İzin hatası:', error);
    Alert.alert('Hata', 'İzinler alınırken bir hata oluştu.');
    return false;
  }
};

export const checkCameraAndMicrophonePermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const cameraGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const audioGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      
      console.log('📹 Android izin kontrolü:', { camera: cameraGranted, audio: audioGranted });
      return cameraGranted && audioGranted;

    } else if (Platform.OS === 'ios') {
      const cameraPermission = await Camera.getCameraPermissionsAsync();
      const microphonePermission = await Camera.getMicrophonePermissionsAsync();
      
      console.log('📹 iOS izin kontrolü:', { 
        camera: cameraPermission.status, 
        audio: microphonePermission.status 
      });
      
      return cameraPermission.status === 'granted' && microphonePermission.status === 'granted';
    }
    
    return false;
  } catch (error) {
    console.error('❌ İzin kontrol hatası:', error);
    return false;
  }
};
