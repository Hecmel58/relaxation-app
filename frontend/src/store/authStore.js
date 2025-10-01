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
        
        // Kullanıcı adını öncelik sırasına göre belirle
        const userName = userData?.name || decoded?.name || decoded?.phone || userData?.phone;
        
        const user = {
          userId: decoded?.userId || userData?.userId,
          phone: decoded?.phone || userData?.phone,
          name: userName, // İsim her zaman set edilecek
          isAdmin: Boolean(decoded?.isAdmin || userData?.isAdmin),
          abGroup: decoded?.abGroup || userData?.abGroup || 'control'
        };
        
        console.log('Login - User data:', user);
        
        localStorage.setItem('fidbal_token', token);
        localStorage.setItem('fidbal_user_name', userName); // İsmi ayrı da sakla
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('fidbal_token');
        localStorage.removeItem('fidbal_user_name');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set((state) => {
          const updatedUser = { ...state.user, ...userData };
          // İsim güncellenirse localStorage'a da kaydet
          if (userData.name) {
            localStorage.setItem('fidbal_user_name', userData.name);
          }
          return { user: updatedUser };
        });
      },

      // Sayfa yenilendiğinde kullanıcı bilgilerini geri yükle
      restoreUser: () => {
        const token = localStorage.getItem('fidbal_token');
        const savedName = localStorage.getItem('fidbal_user_name');
        
        if (token && savedName) {
          const decoded = parseJwt(token);
          if (decoded) {
            const user = {
              userId: decoded.userId,
              phone: decoded.phone,
              name: savedName, // Kaydedilmiş ismi kullan
              isAdmin: Boolean(decoded.isAdmin),
              abGroup: decoded.abGroup || 'control'
            };
            set({ user, token, isAuthenticated: true });
          }
        }
      }
    }),
    {
      name: 'fidbal-auth',
      getStorage: () => localStorage
    }
  )
);