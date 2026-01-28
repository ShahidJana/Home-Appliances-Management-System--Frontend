import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    // In development, use Vite proxy. In production, use the full URL if provided.
    baseURL: isDevelopment ? '/api' : (API_URL ? `${API_URL}/api` : '/api'),
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Crucial for sending/receiving HTTP-only cookies
});

// Add Interceptor to attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add Interceptor for error handling (e.g. 401 Unauthorized)
api.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet and it's not the login request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
        originalRequest._retry = true;

        try {
            console.log('Attempting silent token refresh...');
            // Call refresh endpoint (it uses the HTTP-only cookie)
            // Use same baseURL logic as the main instance
            const refreshUrl = isDevelopment ? '/api/auth/refresh' : (API_URL ? `${API_URL}/api/auth/refresh` : '/api/auth/refresh');
            const response = await axios.post(refreshUrl, {}, { withCredentials: true });
            const { accessToken } = response.data;

            if (accessToken) {
                localStorage.setItem('token', accessToken);
                // Update authorization header for the retry
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            }
        } catch (refreshError) {
            console.error('Refresh token failed or expired');
            // Clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    return Promise.reject(error.response?.data || error);
});

export default api;
