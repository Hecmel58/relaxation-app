import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  isDark: Appearance.getColorScheme() === 'dark',

  setTheme: async (theme: Theme) => {
    try {
      await AsyncStorage.setItem('fidbal_theme', theme);

      let isDark = false;
      if (theme === 'system') {
        isDark = Appearance.getColorScheme() === 'dark';
      } else {
        isDark = theme === 'dark';
      }

      set({ theme, isDark });
      console.log('✅ Theme changed:', theme, '| isDark:', isDark);
    } catch (error) {
      console.error('❌ Theme save error:', error);
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = (await AsyncStorage.getItem('fidbal_theme')) as Theme | null;
      const theme = savedTheme || 'system';

      let isDark = false;
      if (theme === 'system') {
        isDark = Appearance.getColorScheme() === 'dark';
      } else {
        isDark = theme === 'dark';
      }

      set({ theme, isDark });
      console.log('✅ Theme loaded:', theme, '| isDark:', isDark);
    } catch (error) {
      console.error('❌ Theme load error:', error);
    }
  },
}));

// Sistem tema değişikliğini dinle
Appearance.addChangeListener(({ colorScheme }) => {
  const state = useThemeStore.getState();
  if (state.theme === 'system') {
    useThemeStore.setState({ isDark: colorScheme === 'dark' });
    console.log('🔄 System theme changed:', colorScheme);
  }
});