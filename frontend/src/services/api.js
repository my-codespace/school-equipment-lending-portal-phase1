import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API calls
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
};

// Equipment API calls
export const equipmentAPI = {
    getAll: (params) => api.get('/equipment', { params }),
    add: (data) => api.post('/equipment', data),
    update: (id, data) => api.put(`/equipment/${id}`, data),
    delete: (id) => api.delete(`/equipment/${id}`),
};

// Request API calls
export const requestAPI = {
    create: (data) => api.post('/request', data),
    getAll: (params) => api.get('/request', { params }),
    approve: (id) => api.patch(`/request/${id}/approve`),
    reject: (id) => api.patch(`/request/${id}/reject`),
    return: (id) => api.patch(`/request/${id}/return`),
};

export default api;
