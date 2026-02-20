import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/me');
export const upgradeSubscription = () => api.post('/auth/upgrade');

export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getCategoryInsights = (category) => api.get(`/dashboard/category/${category}`);
export const getLiveSignals = (source) => api.get('/dashboard/signals', { params: { source } });
export const getMapData = () => api.get('/dashboard/map-data');
export const getRiskTrend = (days = 7) => api.get('/dashboard/risk-trend', { params: { days } });

export const getMandiData = (params) => api.get('/data/mandi', { params });
export const getEnamData = (params) => api.get('/data/enam', { params });
export const getTradeData = (params) => api.get('/data/trade', { params });
export const getWeatherData = () => api.get('/data/weather');
export const getLogisticsData = (params) => api.get('/data/logistics', { params });

export default api;
