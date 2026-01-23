import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s (Token Expiry)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    googleLogin: (token: string) => api.post('/auth/google', { token }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const scanAPI = {
    scanBarcode: (barcode: string) => api.post('/scan/barcode', { barcode }),
    analyzeText: (text: string) => api.post('/scan/analyze', { text }),
    scanImage: (image: string) => api.post('/scan/image', { image }),
    getHistory: () => api.get('/scan/history'),
};

export default api;
