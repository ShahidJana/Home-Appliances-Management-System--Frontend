import api from './api';

export const EmployeeModel = {
    add: async (employeeData) => {
        const response = await api.post('/employees', employeeData);
        return response.data;
    },

    getAll: async (date) => {
        const response = await api.get('/employees', { params: { date } });
        return response.data;
    },

    markAttendance: async (attendanceData) => {
        const response = await api.post('/employees/attendance', attendanceData);
        return response.data;
    },

    autoMarkAllPresent: async (date) => {
        const response = await api.post('/employees/attendance/auto-mark', { date });
        return response.data;
    },

    updateManual: async (id, updateData) => {
        const response = await api.put(`/employees/attendance/${id}`, updateData);
        return response.data;
    },

    getSummary: async (id) => {
        const response = await api.get(`/employees/${id}/summary`);
        return response.data;
    },

    getAttendanceDashboard: async () => {
        const response = await api.get('/employees/attendance/dashboard');
        return response.data;
    },

    getAttendanceStats: async (id) => {
        const response = await api.get(`/employees/${id}/attendance/stats`);
        return response.data;
    },

    getAttendanceHistory: async (id) => {
        const response = await api.get(`/employees/${id}/attendance/history`);
        return response.data;
    }
};
