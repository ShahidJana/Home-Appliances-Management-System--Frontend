import api from './api';

export const TransactionModel = {
    addPayment: async (paymentData) => {
        const response = await api.post('/transactions/payment', paymentData);
        return response.data;
    },

    getDailyReport: async (params) => {
        const response = await api.get('/transactions/daily-report', { params });
        return response.data;
    }
};
