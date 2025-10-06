import { create } from 'zustand';

export const useAuthStore = create((set, get) => {
  // İlk yüklemede localStorage'dan oku - HATA YÖNETİMİ İLE
  let initialUser = null;
  let initialToken = null;

  try {
    const storedUser = localStorage.getItem('fidbal_user');
    const storedToken = localStorage.getItem('fidbal_token');
    
    if (storedUser) {
      initialUser = JSON.parse(storedUser);
      console.log('Stored user loaded:', initialUser);
    }
    if (storedToken) {
      initialToken = storedToken;
      console.log('Stored token loaded');
    }
  } catch (error) {
    console.error('localStorage read error:', error);
    // Hata durumunda temizle
    localStorage.removeItem('fidbal_user');
    localStorage.removeItem('fidbal_token');
  }

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialUser && initialToken),

    login: (userData, token) => {
      const user = {
        userId: userData.id,
        phone: userData.phone,
        name: userData.name,
        email: userData.email || null,
        isAdmin: Boolean(userData.is_admin),
        abGroup: userData.ab_group || 'control'
      };
      
      console.log('Login - User data:', user);
      
      // Manuel localStorage kaydet
      localStorage.setItem('fidbal_user', JSON.stringify(user));
      localStorage.setItem('fidbal_token', token);
      
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('fidbal_user');
      localStorage.removeItem('fidbal_token');
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (userData) => {
      set((state) => {
        const updatedUser = { ...state.user, ...userData };
        localStorage.setItem('fidbal_user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      });
    },

    setUser: (user) => {
      if (user) {
        localStorage.setItem('fidbal_user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      }
    }
  };
});