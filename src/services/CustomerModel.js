import api from './api';

export const CustomerModel = {
    create: async (customerData) => {
        const response = await api.post('/customers', customerData);
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/customers', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },

    update: async (id, customerData) => {
        const response = await api.put(`/customers/${id}`, customerData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    },

    checkCnicHealth: async (cnic) => {
        const response = await api.get(`/customers/cnic-health/${cnic}`);
        return response.data;
    }
};
