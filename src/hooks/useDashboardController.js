import { useState, useEffect } from 'react';
import { DashboardModel } from '../services/DashboardModel';

export const useDashboardController = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await DashboardModel.getStats();
            setStats(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats
    };
};
