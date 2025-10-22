import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ✅ PRODUCTION BACKEND URL
const API_URL = 'https://fidbal-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 saniye
});

// ✅ REQUEST INTERCEPTOR - Token ekleme
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR - Error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    // ✅ 401 Unauthorized - Otomatik logout
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      await logout();
    }

    return Promise.reject(error);
  }
);

export default api;