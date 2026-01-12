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

    update: async (id, vendorData) => {
        const response = await api.put(`/vendors/${id}`, vendorData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/vendors/${id}`);
        return response.data;
    },

    toggleBlock: async (id) => {
        const response = await api.patch(`/vendors/${id}/block`);
        return response.data;
    },

    getDashboard: async (id) => {
        const response = await api.get(`/vendors/${id}/dashboard`);
        return response.data;
    }
};
