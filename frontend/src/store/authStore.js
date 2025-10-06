import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token parse hatası:', error);
    return null;
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        // Backend'den gelen user data'yı doğrudan kullan
        const user = {
          userId: userData.id,
          phone: userData.phone,
          name: userData.name,
          email: userData.email || null,
          isAdmin: Boolean(userData.is_admin),
          abGroup: userData.ab_group || 'control'
        };
        
        console.log('Login - User data:', user);
        
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      setUser: (user) => {
        set({ user });
      },

      // Token'dan userId'yi al (App.jsx'te kullanılabilir)
      getUserIdFromToken: () => {
        const state = get();
        if (state.token) {
          const decoded = parseJwt(state.token);
          return decoded?.userId;
        }
        return null;
      }
    }),
    {
      name: 'fidbal-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);