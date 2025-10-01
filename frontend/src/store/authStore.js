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
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        const decoded = parseJwt(token);
        const user = {
          userId: decoded?.userId || userData?.userId,
          phone: decoded?.phone || userData?.phone,
          name: userData?.name || decoded?.name || decoded?.phone,
          isAdmin: Boolean(decoded?.isAdmin || userData?.isAdmin),
          abGroup: decoded?.abGroup || userData?.abGroup || 'control'
        };
        
        console.log('Login - User data:', user); // Debug için
        
        localStorage.setItem('fidbal_token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('fidbal_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set((state) => ({ 
          user: { ...state.user, ...userData } 
        }));
      }
    }),
    {
      name: 'fidbal-auth',
      getStorage: () => localStorage
    }
  )
);