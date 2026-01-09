import api from './api';

export const DashboardModel = {
    getStats: async () => {
        const response = await api.get('/dashboard');
        return response.data;
    },

    quickSearch: async (query) => {
        const response = await api.get('/dashboard/quick-search', { params: { q: query } });
        return response.data;
    }
};
