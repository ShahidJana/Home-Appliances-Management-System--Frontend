import api from './api';

export const PurchaseModel = {
    add: async (productData) => {
        const response = await api.post('/purchases', productData);
        return response.data;
    },

    bulkAdd: async (bulkData) => {
        const response = await api.post('/purchases/bulk', bulkData);
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/purchases', { params });
        return response.data;
    },

    update: async (id, productData) => {
        const response = await api.put(`/purchases/${id}`, productData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/purchases/${id}`);
        return response.data;
    },

    getReport: async () => {
        const response = await api.get('/purchases/report');
        return response.data;
    },

    getOfficerStats: async () => {
        const response = await api.get('/purchases/officer-stats');
        return response.data;
    }
};
