import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // ✅ /api eklendi
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fidbal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('Full URL:', config.baseURL + config.url);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Auth error, redirecting to login...');
      localStorage.removeItem('fidbal_token');
      localStorage.removeItem('fidbal_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;