import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    User,
    Package,
    X,
    Plus,
    Minus,
    Trash2,
    Printer,
    Save,
    RefreshCcw,
    Maximize,
    ShoppingCart,
    Clock,
    CheckCircle2,
    Calendar,
    ArrowRight,
    CircleDollarSign,
    Receipt,
    History
} from 'lucide-react';

import { CustomerModel } from '../services/CustomerModel';
import { PlanModel } from '../services/PlanModel';
import { InventoryModel } from '../services/InventoryModel';
import { AuthModel } from '../services/AuthModel';

const POS = () => {
    const currentUser = AuthModel.getCurrentUser();

    // Search States
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerResults, setCustomerResults] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Feature States
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Form/Summary States
    const [discountPercent, setDiscountPercent] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [paymentType, setPaymentType] = useState('Full Cash');
    const [installmentPlan, setInstallmentPlan] = useState('6 Months');
    const [downPayment, setDownPayment] = useState(0);
    const [repaymentDay, setRepaymentDay] = useState(1);

    // Fetch Selling History
    const fetchHistory = useCallback(async () => {
        try {
            const data = await PlanModel.getAll();
            setHistory(data.slice(0, 10)); // Top 10 recent
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Search Logic
    useEffect(() => {
        const searchProducts = async () => {
            if (productSearchTerm.length < 2) { setProductResults([]); return; }
            setLoadingProducts(true);
            try {
                const data = await InventoryModel.getAll({ status: 'Available', search: productSearchTerm });
                setProductResults(data);
            } catch (error) { console.error(error); } finally { setLoadingProducts(false); }
        };
        const debounce = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounce);
    }, [productSearchTerm]);

    useEffect(() => {
        const searchCustomers = async () => {
            if (customerSearchTerm.length < 2) { setCustomerResults([]); return; }
            setLoadingCustomers(true);
            try {
                const data = await CustomerModel.getAll({ search: customerSearchTerm });
                setCustomerResults(data);
            } catch (error) { console.error(error); } finally { setLoadingCustomers(false); }
        };
        const debounce = setTimeout(searchCustomers, 300);
        return () => clearTimeout(debounce);
    }, [customerSearchTerm]);

    // Cart Management
    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(item => item.product._id === product._id);
            if (exists) return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { product, quantity: 1, price: product.sellingPrice || 0, disc: 0, tax: 0 }];
        });
        setProductSearchTerm('');
        setProductResults([]);
    };

    const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.product._id !== productId));

    const updateQuantity = (productId, qty) => {
        if (qty < 1) return;
        setCart(prev => prev.map(item => item.product._id === productId ? { ...item, quantity: qty } : item));
    };

    const updatePrice = (productId, price) => {
        setCart(prev => prev.map(item => item.product._id === productId ? { ...item, price: parseFloat(price) || 0 } : item));
    };

    // Calculations
    const billAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const discountAmount = (billAmount * (discountPercent / 100));
    const taxAmount = ((billAmount - discountAmount) * (taxPercent / 100));
    const netAmount = billAmount - discountAmount + taxAmount;

    // Installment Calc Logic
    const calculateMonthly = () => {
        if (paymentType !== 'Installment') return 0;
        const months = parseInt(installmentPlan) || 1;

        // If advance payment is made, it counts as the first installment, so we divide the remaining amount by (months - 1)
        // If no advance payment, we divide by the full duration (months)
        let remaining = months;
        if (downPayment > 0 && months > 1) {
            remaining = months - 1;
        }

        return Math.ceil((netAmount - downPayment) / remaining);
    };

    const handleSave = async () => {
        if (cart.length === 0) return alert('Cart is empty');
        if (!selectedCustomer) return alert('Select a customer for the sale');

        setSubmitting(true);
        try {
            const primaryItem = cart[0];
            const products = cart.map(item => item.product._id);
            const combinedProductName = cart.map(item => item.product.productName).join(' + ');
            const combinedBrand = [...new Set(cart.map(item => item.product.brand))].join(', ');
            const combinedModel = cart.map(item => item.product.model).join(', ');

            const apiData = {
                customer: selectedCustomer._id,
                product: primaryItem.product._id,
                products: products,
                productName: combinedProductName,
                brand: combinedBrand,
                model: combinedModel,
                price: primaryItem.price,
                totalAmount: netAmount,
                advancePayment: paymentType === 'Installment' ? downPayment : netAmount,
                durationMonths: paymentType === 'Installment' ? parseInt(installmentPlan) : 0,
                installmentAmount: calculateMonthly(),
                repaymentDay: paymentType === 'Installment' ? repaymentDay : null,
                paymentType: paymentType,
                paymentMethod: 'Cash', // Default for now
                status: 'Active',
                saleOfficer: currentUser?._id,
                dealtBy: currentUser?.fullName
            };

            await PlanModel.create(apiData);
            alert('Sale saved successfully!');
            resetBoard();
            fetchHistory();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed to save sale'));
        } finally {
            setSubmitting(false);
        }
    };

    const resetBoard = () => {
        setCart([]);
        setSelectedCustomer(null);
        setDiscountPercent(0);
        setTaxPercent(0);
        setDownPayment(0);
        setRepaymentDay(1);
        setPaymentType('Full Cash');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 h-[calc(100vh-140px)] overflow-hidden bg-transparent"
        >
            {/* Top Search Bar - System Styled */}
            <div className="flex gap-4 shrink-0">
                {/* Product Search */}
                <div className="flex-1 relative group">
                    <div className="flex items-center bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl px-4 py-2.5 transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10">
                        <span className="text-[10px] font-black text-slate-500 uppercase mr-4 tracking-widest shrink-0 border-r border-white/10 pr-4">Product Search</span>
                        <Search size={18} className="text-slate-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Find items by name, model or IMEI..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600 font-medium"
                        />
                    </div>

                    <AnimatePresence>
                        {productResults.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#1e293b] backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl max-h-80 overflow-y-auto">
                                {Object.values(productResults.reduce((acc, item) => {
                                    const key = `${item.productName}-${item.model}`;
                                    if (!acc[key]) acc[key] = { ...item, count: 0, items: [] };
                                    acc[key].count++;
                                    acc[key].items.push(item);
                                    return acc;
                                }, {})).map(group => (
                                    <div key={group._id} className="w-full flex items-center justify-between p-3 hover:bg-white/5 border-b border-white/5 last:border-0 group transition-colors">
                                        <div className="flex items-center gap-4 flex-1" onClick={() => addToCart(group.items[0])}>
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 group-hover:scale-105 transition-transform"><Package size={22} /></div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-wide">{group.productName}</p>
                                                <p className="text-[10px] text-slate-500 font-mono tracking-wider">{group.model} <span className="text-slate-700">|</span> <span className="text-indigo-400 font-bold">Stock: {group.count}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-white tracking-tight">Rs. {group.sellingPrice?.toLocaleString()}</p>
                                                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em]">In Stock</p>
                                            </div>
                                            <button onClick={() => addToCart(group.items[0])} className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                                                <Plus size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Customer Search */}
                <div className="w-80 relative shrink-0">
                    <div className={`flex items-center h-full bg-[#1e293b]/50 backdrop-blur-xl border ${selectedCustomer ? 'border-pink-500/50 ring-2 ring-pink-500/10' : 'border-white/10'} rounded-xl shadow-2xl px-4 py-2.5 transition-all`}>
                        <User size={18} className={selectedCustomer ? 'text-pink-500' : 'text-slate-400'} />
                        <input
                            type="text"
                            placeholder={selectedCustomer ? selectedCustomer.fullName : "Select Customer..."}
                            value={customerSearchTerm}
                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600 ml-3 font-medium"
                        />
                        {selectedCustomer && <button onClick={() => setSelectedCustomer(null)} className="text-slate-500 hover:text-red-400 transition-colors"><X size={16} /></button>}
                    </div>
                    <AnimatePresence>
                        {customerResults.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#1e293b] backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl max-h-80 overflow-y-auto">
                                {customerResults.map(c => (
                                    <button key={c._id} onClick={() => { setSelectedCustomer(c); setCustomerResults([]); setCustomerSearchTerm(''); }} className="w-full p-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left flex items-center gap-4 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center font-black text-xs border border-pink-500/10">{c.fullName[0]}</div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase">{c.fullName}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-wider">{c.cnic}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 h-full overflow-hidden">
                    <div className="glass-card shadow-2xl overflow-hidden flex flex-col border-white/10 flex-1 min-h-0">
                        <div className="p-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                <h2 className="text-lg font-black text-white uppercase tracking-[0.2em]">Current Bill Selection</h2>
                            </div>
                            <div className="bg-[#0f172a]/80 border border-white/5 rounded-2xl px-6 py-3 flex items-center shadow-2xl">
                                <p className="text-[12px] font-black uppercase text-white tracking-[0.2em] flex items-center gap-2">
                                    Active Bill:
                                    <span className="text-lg font-black text-white leading-none">
                                        {history.length + 1}
                                    </span>
                                </p>
                            </div>

                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-[#1e293b] z-10 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">SR#</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Description</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Qty</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-40">Price (Unit)</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Subtotal</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {cart.map((item, idx) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={item.product._id}
                                                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono tracking-tighter">{(idx + 1).toString().padStart(2, '0')}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase group-hover:text-indigo-400 transition-colors">{item.product.productName}</p>
                                                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">{item.product.brand} | {item.product.model}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3 bg-black/30 rounded-xl p-1 w-28 mx-auto border border-white/5">
                                                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 flex items-center justify-center transition-all active:scale-90"><Minus size={14} /></button>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                                                            className="w-8 bg-transparent border-none outline-none text-center text-xs font-black text-white"
                                                        />
                                                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 flex items-center justify-center transition-all active:scale-90"><Plus size={14} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">Rs.</span>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updatePrice(item.product._id, e.target.value)}
                                                            className="w-full bg-black/20 border border-white/5 rounded-xl px-8 py-2 text-xs font-black text-indigo-300 focus:border-indigo-500/50 outline-none transition-all"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black text-white text-right font-mono">{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => removeFromCart(item.product._id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 text-white transition-all active:scale-90">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {cart.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-28 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                                                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white flex items-center justify-center">
                                                        <ShoppingCart size={40} className="text-white" />
                                                    </div>
                                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Station Ready For Input</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Footer Grid - Compact Version */}
                    <div className="glass-card shadow-2xl p-2 space-y-4 border-white/10 bg-white/[0.01]">
                        {/* Summary Stats Cards - Tighter on Top */}
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { label: 'Total Rows', value: cart.length, icon: Package, color: 'text-pink-400' },
                                { label: 'T. Quantity', value: totalItems, icon: Plus, color: 'text-blue-400' },
                                { label: 'Subtotal Val.', value: billAmount.toLocaleString(undefined, { minimumFractionDigits: 1 }), icon: CircleDollarSign, color: 'text-emerald-400' }
                            ].map((stat, i) => (
                                <div key={i} className=" bg-black/20 border border-white/5 rounded-xl p-2 transition-all hover:border-white/20 relative group ">
                                    <stat.icon size={14} className={`absolute top-3 right-3 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">{stat.label}</p>
                                    <p className="text-base font-black text-white truncate">{stat.value}</p>
                                </div>
                            ))}
                            <div className="space-y-1 bg-black/20 border border-white/5 rounded-xl p-2 focus-within:border-pink-500/50 transition-all">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Discount %</label>
                                <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none outline-none text-base font-black text-pink-500 p-0" />
                            </div>
                            <div className="space-y-1 bg-black/20 border border-white/5 rounded-xl p-2 focus-within:border-indigo-500/50 transition-all">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Tax %</label>
                                <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none outline-none text-base font-black text-indigo-400 p-0" />
                            </div>
                        </div>

                        {/* Financial Inputs & Mode Toggle - Bottom Row now */}
                        <div className="flex flex-wrap lg:flex-nowrap items-end gap-3 pt-2 border-t border-white/5">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Tax Amt.</label>
                                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3 py-[10.5px] text-xs font-black text-indigo-400 font-mono">Rs {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Net Payable</label>
                                    <div className="w-full bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/30 text-center flex flex-col justify-center min-h-[42px]">
                                        <span className="text-[8px] opacity-60 uppercase leading-none mb-0.5">Rs.</span>
                                        <span className="leading-none">{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 text-emerald-500">Method</label>
                                    <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="w-full h-[42px] bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 text-[10px] font-black text-emerald-400 outline-none appearance-none cursor-pointer">
                                        <option value="Full Cash" className="bg-[#1e293b]">FULL CASH</option>
                                        <option value="Installment" className="bg-[#1e293b]">INSTALLMENT</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2 h-[60px]">
                                <button onClick={handleSave} disabled={submitting} className="px-8 bg-green-600 hover:bg-green-700 text-white font-black text-md uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0">
                                    <Save size={18} /> {submitting ? 'PROCESSING...' : 'COMPLETE SALE'}
                                </button>
                                <button className="bg-white/5 hover:bg-white/10 text-white w-12 rounded-xl flex items-center justify-center border border-white/10 transition-all active:scale-90">
                                    <Printer size={18} />
                                </button>
                                <button onClick={resetBoard} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 w-12 rounded-xl flex items-center justify-center border border-red-500/20 transition-all active:scale-90">
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Installment Context (If active) */}
                        <AnimatePresence>
                            {paymentType === 'Installment' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-6 border-t border-white/5 overflow-hidden">
                                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-2 flex items-center gap-12">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest pl-1">Plan Duration</p>
                                            <select value={installmentPlan} onChange={(e) => setInstallmentPlan(e.target.value)} className="bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white outline-none">
                                                {['6 Months', '9 Months', '12 Months', '18 Months'].map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest pl-1">Adv. Payment</p>
                                            <input type="number" value={downPayment} onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)} className="w-32 bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white outline-none focus:border-indigo-500/50" />
                                        </div>
                                        <div className="h-10 w-px bg-white/5"></div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Installment</p>
                                            <p className="text-2xl font-black text-white italic tracking-tighter">Rs. {calculateMonthly().toLocaleString()}</p>
                                            <p className="text-[9px] font-mono text-slate-500 tracking-tight">
                                                {downPayment > 0 ? `(1 Paid + ${parseInt(installmentPlan) - 1} Pending)` : `(${parseInt(installmentPlan)} Pending)`}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest pl-1">Repayment Day</p>
                                            <select value={repaymentDay} onChange={(e) => setRepaymentDay(parseInt(e.target.value))} className="bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white outline-none">
                                                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                                                    <option key={d} value={d}>{d}{[1, 21, 31].includes(d) ? 'st' : [2, 22].includes(d) ? 'nd' : [3, 23].includes(d) ? 'rd' : 'th'}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2 text-emerald-500">
                                            <CheckCircle2 size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest font-mono">Installment Strategy Validated</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar: Selling History - System Dark Theme */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-2 h-full min-h-0">
                    <div className="glass-card shadow-2xl flex flex-col h-full overflow-hidden border-white/10">
                        <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <History size={16} className="text-pink-500" />
                                <h2 className="text-[12px] font-black text-white uppercase tracking-[0.1em]">Transaction Log</h2>
                            </div>
                            <button onClick={fetchHistory} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"><RefreshCcw size={14} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {history.length > 0 ? history.map((sale, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={sale._id}
                                    className={`p-2 rounded-lg border transition-all cursor-pointer group ${i === 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
                                >
                                    <div className="flex flex-col gap-2">
                                        {/* Top Section: Customer & Amount */}
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                                                    <span className="text-sm font-black text-white uppercase truncate">{sale.customer?.fullName || 'Retail'}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium truncate">{sale.productName || 'Sale Entry'}</p>
                                            </div>

                                            <div className="text-right flex flex-col items-end shrink-0">
                                                <p className="text-sm font-black text-white tracking-tighter mb-1">Rs {sale.totalAmount?.toLocaleString() || sale.price?.toLocaleString()}/-</p>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${sale.paymentType === 'Installment' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/10' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'}`}>
                                                    {sale.paymentType || 'Confirmed'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bottom Section: ID & Date/Time on the same line */}
                                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.1em] leading-none">Receipt ID:</span>
                                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter leading-none">#{sale.planId || (history.length - i).toString().padStart(5, '0')}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-right text-[8px] font-black text-slate-500 uppercase tracking-[0.1em] leading-none shrink-0">
                                                <span>{new Date(sale.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', })}</span>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-slate-600">{new Date(sale.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="py-20 text-center opacity-10">
                                    <History size={48} className="mx-auto" />
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest">No Logs Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default POS;
