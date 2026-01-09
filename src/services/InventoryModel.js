import api from './api';

export const InventoryModel = {
    add: async (productData) => {
        const response = await api.post('/inventory', productData);
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/inventory', { params });
        return response.data;
    },

    getReport: async () => {
        const response = await api.get('/inventory/report');
        return response.data;
    },

    getOfficerStats: async () => {
        const response = await api.get('/inventory/officer-stats');
        return response.data;
    }
};
