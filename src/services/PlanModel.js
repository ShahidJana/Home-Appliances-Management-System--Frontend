import api from './api';

export const PlanModel = {
    create: async (planData) => {
        const response = await api.post('/plans', planData);
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/plans', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/plans/${id}`);
        return response.data;
    },

    returnProduct: async (id, returnData) => {
        const response = await api.post(`/plans/${id}/return`, returnData);
        return response.data;
    },

    claimWarranty: async (id, claimData) => {
        const response = await api.post(`/plans/${id}/warranty-claim`, claimData);
        return response.data;
    }
};
