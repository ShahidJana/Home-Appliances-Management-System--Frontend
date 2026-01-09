import api from './api';

export const VendorModel = {
    create: async (vendorData) => {
        const response = await api.post('/vendors', vendorData);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/vendors');
        return response.data;
    },

    getDashboard: async (id) => {
        const response = await api.get(`/vendors/${id}/dashboard`);
        return response.data;
    }
};
