import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId: string;
  phone: string;
  name: string;
  isAdmin: boolean;
  abGroup: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (userData: User, token: string) => {
    await AsyncStorage.setItem('fidbal_token', token);
    await AsyncStorage.setItem('fidbal_user', JSON.stringify(userData));
    set({ user: userData, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('fidbal_token');
    await AsyncStorage.removeItem('fidbal_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem('fidbal_token');
      const userStr = await AsyncStorage.getItem('fidbal_user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Session restore error:', error);
    }
  },
}));