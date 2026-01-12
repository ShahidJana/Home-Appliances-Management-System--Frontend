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
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw { message: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateVendor = async (id, vendorData) => {
        setLoading(true);
        try {
            const data = await VendorModel.update(id, vendorData);
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw { message: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteVendor = async (id) => {
        setLoading(true);
        try {
            await VendorModel.delete(id);
            fetchVendors();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleBlockVendor = async (id) => {
        try {
            await VendorModel.toggleBlock(id);
            fetchVendors();
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        vendors,
        loading,
        error,
        fetchVendors,
        createVendor,
        updateVendor,
        deleteVendor,
        toggleBlockVendor
    };
};
