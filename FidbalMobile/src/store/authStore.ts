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
      set({ user, token, isAuthenticated: true });
      await AsyncStorage.setItem('fidbal_token', token);
      await AsyncStorage.setItem('fidbal_user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      console.log('✅ Login successful - Storage updated');

      // ✅ Giriş sonrası push token kaydet (1 saniye bekle)
      setTimeout(() => {
        registerForPushNotifications().catch(err => {
          console.log('⚠️ Push token kaydedilemedi:', err.message);
        });
      }, 1000);
    } catch (error) {
      console.error('❌ Login storage error:', error);
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
      const [token, userString] = await AsyncStorage.multiGet(['fidbal_token', 'fidbal_user']);

      if (token[1] && userString[1]) {
        const user = JSON.parse(userString[1]);
        api.defaults.headers.common['Authorization'] = `Bearer ${token[1]}`;
        set({ user, token: token[1], isAuthenticated: true });
        console.log('✅ Stored auth loaded');
      }
    } catch (error) {
      console.error('❌ Load stored auth error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));