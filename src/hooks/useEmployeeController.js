import { useState, useCallback } from 'react';
import { EmployeeModel } from '../services/EmployeeModel';

export const useEmployeeController = () => {
    const [employees, setEmployees] = useState([]);
    const [summary, setSummary] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [personalAttendanceStats, setPersonalAttendanceStats] = useState(null);
    const [personalHistory, setPersonalHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEmployees = useCallback(async (date) => {
        setLoading(true);
        try {
            const data = await EmployeeModel.getAll(date);
            setEmployees(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDashboardStats = useCallback(async () => {
        try {
            const data = await EmployeeModel.getAttendanceDashboard();
            setDashboardStats(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchSummary = useCallback(async (id) => {
        try {
            const data = await EmployeeModel.getSummary(id);
            setSummary(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchPersonalStats = useCallback(async (id) => {
        try {
            const data = await EmployeeModel.getAttendanceStats(id);
            setPersonalAttendanceStats(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchPersonalHistory = useCallback(async (id) => {
        try {
            const data = await EmployeeModel.getAttendanceHistory(id);
            setPersonalHistory(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const addEmployee = async (employeeData) => {
        setLoading(true);
        try {
            const data = await EmployeeModel.add(employeeData);
            setEmployees(prev => [...prev, { ...data, attendance: { status: 'Not Marked' } }]);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to add employee');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (attendanceData) => {
        setLoading(true);
        try {
            const data = await EmployeeModel.markAttendance(attendanceData);
            // Refresh local list for that employee
            setEmployees(prev => prev.map(emp =>
                emp._id === attendanceData.employeeId
                    ? { ...emp, attendance: data.attendance }
                    : emp
            ));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const autoMarkAllPresent = async (date) => {
        setLoading(true);
        try {
            await EmployeeModel.autoMarkAllPresent(date);
            await fetchEmployees(date); // Refresh
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const editAttendance = async (id, updateData) => {
        setLoading(true);
        try {
            const data = await EmployeeModel.updateManual(id, updateData);
            setEmployees(prev => prev.map(emp =>
                emp.attendance?._id === id
                    ? { ...emp, attendance: data.attendance }
                    : emp
            ));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        employees,
        summary,
        dashboardStats,
        personalAttendanceStats,
        personalHistory,
        loading,
        error,
        fetchEmployees,
        fetchDashboardStats,
        fetchSummary,
        fetchPersonalStats,
        fetchPersonalHistory,
        markAttendance,
        createEmployee: addEmployee,
        autoMarkAllPresent,
        editAttendance
    };
};
