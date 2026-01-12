import { useState, useCallback } from 'react';
import { AuthModel } from '../services/AuthModel';

export const useAuthController = () => {
    const [user, setUser] = useState(AuthModel.getCurrentUser());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await AuthModel.login(email, password);
            setUser(data.user);
            return data;
        } catch (err) {
            const msg = (typeof err === 'string') ? err : (err.message || 'Login failed');
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await AuthModel.logout();
        setUser(null);
    }, []);

    return {
        user,
        loading,
        error,
        login,
        logout
    };
};
