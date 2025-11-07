import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotifications } from '../services/notifications';

interface User {
  userId: number;
  name: string;
  phone: string;
  email?: string;
  abGroup: 'control' | 'experiment';
  isAdmin: boolean;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (user, token) => {
    try {
      // ✅ FIX: Token'ı string'e çevir (obje olabilir)
      const tokenString = typeof token === 'string' ? token : JSON.stringify(token);
      
      set({ user, token: tokenString, isAuthenticated: true });
      
      // ✅ FIX: Token'ı düzgün kaydet
      await AsyncStorage.setItem('fidbal_token', tokenString);
      await AsyncStorage.setItem('fidbal_user', JSON.stringify(user));
      
      // ✅ API header'ına ekle
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;

      console.log('✅ Login successful - Token ve user kaydedildi');

      // Push token kaydet (1 saniye bekle)
      setTimeout(() => {
        registerForPushNotifications().catch(err => {
          console.log('⚠️ Push token kaydedilemedi:', err.message);
        });
      }, 1000);
    } catch (error) {
      console.error('❌ Login storage error:', error);
      throw error; // Hatayı yukarı fırlat
    }
  },

  logout: async () => {
    try {
      set({ user: null, token: null, isAuthenticated: false });
      await AsyncStorage.multiRemove(['fidbal_token', 'fidbal_user']);
      delete api.defaults.headers.common['Authorization'];
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  },

  updateUser: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  loadStoredAuth: async () => {
    try {
      console.log('📝 Loading stored auth...');
      
      const [tokenData, userData] = await AsyncStorage.multiGet(['fidbal_token', 'fidbal_user']);
      
      const token = tokenData[1];
      const userString = userData[1];

      if (token && userString) {
        try {
          const user = JSON.parse(userString);
          
          // ✅ Token'ı string olarak oku
          const tokenString = typeof token === 'string' ? token : JSON.stringify(token);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;
          set({ user, token: tokenString, isAuthenticated: true });
          
          console.log('✅ Stored auth loaded:', { userId: user.userId, phone: user.phone });
        } catch (parseError) {
          console.error('❌ Parse error:', parseError);
          // Parse hatası varsa storage'ı temizle
          await AsyncStorage.multiRemove(['fidbal_token', 'fidbal_user']);
        }
      } else {
        console.log('ℹ️ No stored auth found');
      }
    } catch (error) {
      console.error('❌ Load stored auth error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
