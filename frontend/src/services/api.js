import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Use Clerk's session token for API requests
// We set the token dynamically from components that need it
let getTokenFn = null;

export const setClerkTokenGetter = (fn) => {
    getTokenFn = fn;
};

api.interceptors.request.use(async (config) => {
    if (getTokenFn) {
        try {
            const token = await getTokenFn();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // Token fetch failed — proceed without auth header
        }
    }
    return config;
});

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
export const upgradeSubscription = () => api.post('/auth/upgrade');

export default api;
