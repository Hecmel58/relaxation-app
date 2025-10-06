import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fidbal-backend.vercel.app/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 15000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fidbal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fidbal_token');
      localStorage.removeItem('fidbal_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;