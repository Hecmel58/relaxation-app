import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId: number;
  name: string;
  phone: string;
  email?: string;
  abGroup: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, authToken: string) => Promise<void>; // ✅ Parametre değişti
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // ✅ SADECE STORAGE'A KAYDET - API ÇAĞRISI YOK!
  login: async (userData: User, authToken: string) => {
    try {
      // ✅ AsyncStorage'a kaydet
      await AsyncStorage.setItem('fidbal_token', authToken);
      await AsyncStorage.setItem('fidbal_user', JSON.stringify(userData));

      // ✅ State'i güncelle
      set({
        token: authToken,
        user: userData,
        isAuthenticated: true,
      });

      console.log('✅ Login successful - Storage updated');
    } catch (error) {
      console.error('❌ Login storage error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('fidbal_token');
      await AsyncStorage.removeItem('fidbal_user');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  },

  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('fidbal_token');
      const userStr = await AsyncStorage.getItem('fidbal_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
        });
        console.log('✅ Auth loaded from storage');
      }
    } catch (error) {
      console.error('❌ Load auth error:', error);
    }
  },
}));