import { useState, useCallback } from 'react';
import { CustomerModel } from '../services/CustomerModel';

export const useCustomerController = () => {
    const [customers, setCustomers] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async (params) => {
        setLoading(true);
        try {
            const data = await CustomerModel.getAll(params);
            setCustomers(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    }, []);

    const createCustomer = async (formData) => {
        setLoading(true);
        try {
            const data = await CustomerModel.create(formData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getCustomerHealth = async (cnic) => {
        try {
            return await CustomerModel.checkCnicHealth(cnic);
        } catch (err) {
            console.error('Health check failed', err);
            return null;
        }
    };

    return {
        customers,
        customer,
        loading,
        error,
        fetchCustomers,
        createCustomer,
        getCustomerHealth
    };
};
