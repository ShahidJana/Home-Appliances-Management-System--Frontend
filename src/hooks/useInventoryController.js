import { useState, useCallback } from 'react';
import { InventoryModel } from '../services/InventoryModel';

export const useInventoryController = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    const fetchInventory = useCallback(async (params) => {
        setLoading(true);
        try {
            const data = await InventoryModel.getAll(params);
            setItems(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReport = useCallback(async () => {
        try {
            const data = await InventoryModel.getReport();
            setReport(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const addProduct = async (productData) => {
        setLoading(true);
        try {
            const data = await InventoryModel.add(productData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        items,
        loading,
        report,
        error,
        fetchInventory,
        fetchReport,
        addProduct
    };
};
