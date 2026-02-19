import axios from 'axios';

// Backend API URL (Node.js server)
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle 401 responses (redirect to login)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (data) => api.post('/auth/signup', data);
export const getMe = () => api.get('/auth/me');

// Dashboard endpoints
export const getCities = () => api.get('/dashboard/cities');
export const getDashboardMetrics = (city) => api.get('/dashboard/metrics', { params: { city } });
export const getPriceTrends = (city) => api.get('/dashboard/price-trends', { params: { city } });
export const getRegionalDistribution = (city) => api.get('/dashboard/regional-distribution', { params: { city } });
export const getRecentTransactions = (city) => api.get('/dashboard/recent-transactions', { params: { city } });
export const getCityStats = () => api.get('/dashboard/city-stats');
export const getDashboardSummary = () => api.get('/dashboard/summary');

// Upload endpoints
export const uploadFile = (formData) => api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getUploadHistory = () => api.get('/upload/history');
export const getUploadTemplate = () => api.get('/upload/template');

// Properties endpoints
export const getProperties = (params) => api.get('/properties', { params });
export const getProperty = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const searchProperties = (term) => api.get(`/properties/search/${term}`);

// Logs endpoints
export const getLogs = (params) => api.get('/logs/', { params });
export const createLog = (data) => api.post('/logs/', data);
export const getLogStats = () => api.get('/logs/stats');

// Settings endpoints
export const getUserSettings = () => api.get('/settings/user');
export const updateUserSettings = (data) => api.put('/settings/user', data);
export const changePassword = (data) => api.put('/settings/password', data);
export const getSystemSettings = () => api.get('/settings/system');

// Helper function to logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export default api;
