import { useState, useCallback } from 'react';
import { PlanModel } from '../services/PlanModel';

export const usePlanController = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlans = useCallback(async (params) => {
        setLoading(true);
        try {
            const data = await PlanModel.getAll(params);
            setPlans(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch plans');
        } finally {
            setLoading(false);
        }
    }, []);

    const createSalePlan = async (planData) => {
        setLoading(true);
        try {
            const data = await PlanModel.create(planData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const processReturn = async (id, returnData) => {
        setLoading(true);
        try {
            const data = await PlanModel.returnProduct(id, returnData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        plans,
        loading,
        error,
        fetchPlans,
        createSalePlan,
        processReturn
    };
};
