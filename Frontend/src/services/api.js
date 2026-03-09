import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
// For local dev on physical device: use your Mac's local IP (e.g. 192.168.1.9)
// For Android emulator: use 10.0.2.2
// For production: use your deployed API URL
const BASE_URL = 'http://192.168.1.9:5001/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach token
api.interceptors.request.use(
    async (config) => {
        console.log('🔗 API Request:', config.method.toUpperCase(), config.url);
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and log errors
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
            data: error.response?.data,
        });
        
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
    }
);

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update-profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// ── HEALTH RECORDS ────────────────────────────────────
export const healthAPI = {
    addRecord: (data) => api.post('/health-records', data),
    getAll: (params) => api.get('/health-records', { params }),
    getById: (id) => api.get(`/health-records/${id}`),
    update: (id, data) => api.put(`/health-records/${id}`, data),
    delete: (id) => api.delete(`/health-records/${id}`),
};

// ── ACTIVITIES ────────────────────────────────────────
export const activityAPI = {
    add: (data) => api.post('/activities', data),
    getAll: (params) => api.get('/activities', { params }),
    getById: (id) => api.get(`/activities/${id}`),
    update: (id, data) => api.put(`/activities/${id}`, data),
    delete: (id) => api.delete(`/activities/${id}`),
};

// ── MEALS ─────────────────────────────────────────────
export const mealAPI = {
    add: (data) => api.post('/meals', data),
    getAll: (params) => api.get('/meals', { params }),
    getById: (id) => api.get(`/meals/${id}`),
    update: (id, data) => api.put(`/meals/${id}`, data),
    delete: (id) => api.delete(`/meals/${id}`),
};

// ── SLEEP ─────────────────────────────────────────────
export const sleepAPI = {
    add: (data) => api.post('/sleep', data),
    getAll: (params) => api.get('/sleep', { params }),
    getById: (id) => api.get(`/sleep/${id}`),
    update: (id, data) => api.put(`/sleep/${id}`, data),
    delete: (id) => api.delete(`/sleep/${id}`),
};

// ── MEDICATIONS ───────────────────────────────────────
export const medicationAPI = {
    add: (data) => api.post('/medications', data),
    getAll: () => api.get('/medications'),
    getById: (id) => api.get(`/medications/${id}`),
    update: (id, data) => api.put(`/medications/${id}`, data),
    delete: (id) => api.delete(`/medications/${id}`),
    markTaken: (id) => api.put(`/medications/${id}/taken`),
};

// ── REPORTS ───────────────────────────────────────────
export const reportsAPI = {
    daily: () => api.get('/reports/daily'),
    weekly: () => api.get('/reports/weekly'),
    monthly: () => api.get('/reports/monthly'),
};

// ── NOTIFICATIONS ─────────────────────────────────────
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
