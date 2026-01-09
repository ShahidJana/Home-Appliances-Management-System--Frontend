import { useState, useCallback } from 'react';
import { VendorModel } from '../services/VendorModel';

export const useVendorController = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const data = await VendorModel.getAll();
            setVendors(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    }, []);

    const createVendor = async (vendorData) => {
        setLoading(true);
        try {
            const data = await VendorModel.create(vendorData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        vendors,
        loading,
        error,
        fetchVendors,
        createVendor
    };
};
