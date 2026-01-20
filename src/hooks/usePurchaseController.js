import { useState, useCallback } from 'react';
import { PurchaseModel } from '../services/PurchaseModel';

export const usePurchaseController = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    const fetchPurchases = useCallback(async (params) => {
        setLoading(true);
        try {
            const data = await PurchaseModel.getAll(params);
            setItems(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch purchases');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReport = useCallback(async () => {
        try {
            const data = await PurchaseModel.getReport();
            setReport(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const addProduct = async (productData) => {
        setLoading(true);
        try {
            const data = await PurchaseModel.add(productData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const bulkAddProducts = async (bulkData) => {
        setLoading(true);
        try {
            const data = await PurchaseModel.bulkAdd(bulkData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id, productData) => {
        setLoading(true);
        try {
            const data = await PurchaseModel.update(id, productData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        setLoading(true);
        try {
            await PurchaseModel.delete(id);
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
        fetchPurchases,
        fetchReport,
        addProduct,
        bulkAddProducts,
        updateProduct,
        deleteProduct
    };
};
