import api from './api';

export const TransactionModel = {
    addPayment: async (paymentData) => {
        const response = await api.post('/transactions/payment', paymentData);
        return response.data;
    },

    getDailyReport: async (params) => {
        const response = await api.get('/transactions/daily-report', { params });
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    addExpense: async (data) => {
        const response = await api.post('/transactions/expense', data);
        return response.data;
    },

    addSalary: async (data) => {
        const response = await api.post('/transactions/salary', data);
        return response.data;
    },

    addPurchase: async (data) => {
        const response = await api.post('/transactions/purchase', data);
        return response.data;
    }
};
