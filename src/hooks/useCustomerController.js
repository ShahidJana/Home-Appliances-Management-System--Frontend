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
            fetchCustomers();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateCustomer = async (id, formData) => {
        setLoading(true);
        try {
            const data = await CustomerModel.update(id, formData);
            fetchCustomers();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCustomer = async (id) => {
        setLoading(true);
        try {
            await CustomerModel.delete(id);
            fetchCustomers();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleCustomerStatus = async (customer) => {
        const newStatus = customer.status === 'Active' ? 'Block' : 'Active';
        try {
            await CustomerModel.update(customer._id, { status: newStatus });
            fetchCustomers();
        } catch (err) {
            setError(err.message);
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
        updateCustomer,
        deleteCustomer,
        toggleCustomerStatus,
        getCustomerHealth
    };
};
