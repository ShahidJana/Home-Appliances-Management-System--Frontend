import api from './api';

export const AuthModel = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.accessToken) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.accessToken);
        }
        return response.data;
    },

    logout: async () => {
        try {
            await api.get('/auth/logout');
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }
        return response.data;
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    }
};
