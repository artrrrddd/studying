import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000') + '/api'

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    const originalRequest = error.config;
    
    // Не пытаться обновлять токен при 401 с логина/регистрации/refresh — иначе «неверный пароль» превращается в «не авторизован»
    const path = (originalRequest.url || '').replace(API_URL, '').replace(/^\//, '') || '';
    const isAuthEndpoint = ['login', 'registration', 'refresh'].some((p) => path === p || path.startsWith(p + '/'));
    if (error.response?.status === 401 && !originalRequest._isRetry && !isAuthEndpoint) {
        originalRequest._isRetry = true;
        try {
            const response = await axios.get(`${API_URL}/refresh`, { withCredentials: true });
            localStorage.setItem('token', response.data.accessToken);
            return $api.request(originalRequest);
        } catch {
            console.log('НЕ АВТОРИЗОВАН');
        }
    }
    
    return Promise.reject(error);
})

export default $api;