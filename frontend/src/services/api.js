import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Token ekleme
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// -------------------- Auth --------------------
export const login = async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    return data;
};

export const register = async (phone, password, name) => {
    const { data } = await api.post('/auth/register', { phone, password, name });
    return data;
};

// -------------------- Physio Records --------------------
export const createPhysioRecord = async (recordData) => {
    const { data } = await api.post('/physio', recordData);
    return data;
};

export const getPhysioRecords = async () => {
    const { data } = await api.get('/physio');
    return data;
};

export const getAllPhysioRecords = async () => {
    const { data } = await api.get('/admin/physio');
    return data;
};

// -------------------- Support Requests --------------------
export const createSupportRequest = async (requestData) => {
    const { data } = await api.post('/support', requestData);
    return data;
};

export const getSupportRequests = async () => {
    const { data } = await api.get('/support');
    return data;
};

export const getAllSupportRequests = async () => {
    const { data } = await api.get('/admin/support');
    return data;
};

// -------------------- Kullanıcı Yönetimi (Admin) --------------------
export const getUsers = async () => {
    const { data } = await api.get('/admin/users');
    return data;
};

export const deleteUser = async (userId) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
};

export const updateUserRole = async (userId, role) => {
    const { data } = await api.put(`/admin/users/${userId}`, { role });
    return data;
};

// 📌 Yeni kullanıcı ekleme
export const addUser = async (userData) => {
    const { data } = await api.post('/admin/users', userData);
    return data;
};

// -------------------- Genel --------------------
export const apiService = {
    login,
    register,
    createPhysioRecord,
    getPhysioRecords,
    getAllPhysioRecords,
    createSupportRequest,
    getSupportRequests,
    getAllSupportRequests,
    getUsers,
    deleteUser,
    updateUserRole,
    addUser
};
