import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 saniye timeout
});

// Request interceptor - Token ekleme ve debugging
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            hasToken: !!token,
            data: config.data
        });
        
        return config;
    },
    (error) => {
        console.error('📤 Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Error handling ve debugging
api.interceptors.response.use(
    (response) => {
        console.log('📥 API Response Success:', {
            url: response.config.url,
            status: response.status,
            dataType: typeof response.data,
            dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
        });
        return response;
    },
    (error) => {
        console.error('📥 API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.warn('🚪 Unauthorized - Redirecting to login');
            localStorage.clear();
            window.location.href = '/';
        }
        
        return Promise.reject(error);
    }
);

// -------------------- Auth --------------------
export const login = async (phone, password) => {
    try {
        console.log('🔐 Login attempt for:', phone);
        const { data } = await api.post('/auth/login', { phone, password });
        
        console.log('✅ Login successful:', { user: data.user, hasToken: !!data.token });
        
        // Token'ı localStorage'a kaydet
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
    } catch (error) {
        console.error('❌ Login error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Giriş başarısız');
    }
};

export const register = async (phone, password, name) => {
    try {
        const { data } = await api.post('/auth/register', { phone, password, name });
        console.log('✅ Register successful');
        return data;
    } catch (error) {
        console.error('❌ Register error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Kayıt başarısız');
    }
};

export const getUserProfile = async () => {
    try {
        const { data } = await api.get('/auth/me');
        console.log('✅ Profile fetched:', data);
        return data;
    } catch (error) {
        console.error('❌ Get profile error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Profil getirilemedi');
    }
};

// -------------------- Admin Operations --------------------
export const addUser = async (userData) => {
    try {
        console.log('👤 Adding user:', userData);
        const { data } = await api.post('/admin/users', userData);
        console.log('✅ User added successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Add user error:', error.response?.data || error);
        
        // Daha detaylı hata mesajları
        let errorMessage = 'Kullanıcı eklenemedi';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 403) {
            errorMessage = 'Admin yetkisi gerekli';
        } else if (error.response?.status === 401) {
            errorMessage = 'Oturum süresi dolmuş, lütfen tekrar giriş yapın';
        }
        
        throw new Error(errorMessage);
    }
};

export const getUsers = async () => {
    try {
        console.log('👥 Fetching users...');
        const { data } = await api.get('/admin/users');
        console.log(`✅ ${data.length} users fetched`);
        return data;
    } catch (error) {
        console.error('❌ Get users error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Kullanıcılar getirilemedi');
    }
};

export const deleteUser = async (userId) => {
    try {
        console.log('🗑️ Deleting user:', userId);
        const { data } = await api.delete(`/admin/users/${userId}`);
        console.log('✅ User deleted successfully');
        return data;
    } catch (error) {
        console.error('❌ Delete user error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Kullanıcı silinemedi');
    }
};

export const getAllPhysioRecords = async () => {
    try {
        console.log('💤 Fetching all physio records...');
        const { data } = await api.get('/admin/physio');
        console.log(`✅ ${data.length} physio records fetched`);
        return data;
    } catch (error) {
        console.error('❌ Get all physio error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Tüm fiziksel kayıtlar getirilemedi');
    }
};

export const getAllSupportRequests = async () => {
    try {
        console.log('💬 Fetching all support requests...');
        const { data } = await api.get('/admin/support');
        console.log(`✅ ${data.length} support requests fetched`);
        return data;
    } catch (error) {
        console.error('❌ Get all support error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Tüm destek talepleri getirilemedi');
    }
};

// -------------------- Physio Records --------------------
export const createPhysioRecord = async (recordData) => {
    try {
        console.log('💤 Creating physio record:', recordData);
        const { data } = await api.post('/physio', recordData);
        console.log('✅ Physio record created successfully');
        return data;
    } catch (error) {
        console.error('❌ Create physio error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Fiziksel kayıt oluşturulamadı');
    }
};

export const getPhysioRecords = async () => {
    try {
        const { data } = await api.get('/physio');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Fiziksel kayıtlar getirilemedi');
    }
};

// -------------------- Support Requests --------------------
export const sendSupportMessage = async (requestData) => {
    try {
        console.log('💬 Sending support message:', requestData);
        const { data } = await api.post('/support', requestData);
        console.log('✅ Support message sent successfully');
        return data;
    } catch (error) {
        console.error('❌ Send support error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Destek mesajı gönderilemedi');
    }
};

export const getSupportRequests = async () => {
    try {
        const { data } = await api.get('/support');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Destek talepleri getirilemedi');
    }
};

// -------------------- Journals & Meditations --------------------
export const getJournals = async () => {
    try {
        const { data } = await api.get('/journals');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Günlükler getirilemedi');
    }
};

export const createJournal = async (journalData) => {
    try {
        const { data } = await api.post('/journals', journalData);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Günlük oluşturulamadı');
    }
};

export const getMeditations = async () => {
    try {
        const { data } = await api.get('/meditations');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Meditasyonlar getirilemedi');
    }
};

// -------------------- Genel API Service Objesi --------------------
export const apiService = {
    // Auth
    login,
    register,
    getUserProfile,
    
    // Admin
    addUser,
    getUsers,
    deleteUser,
    getAllPhysioRecords,
    getAllSupportRequests,
    
    // Physio
    createPhysioRecord,
    getPhysioRecords,
    
    // Support
    sendSupportMessage,
    getSupportRequests,
    
    // Journals & Meditations
    getJournals,
    createJournal,
    getMeditations
};