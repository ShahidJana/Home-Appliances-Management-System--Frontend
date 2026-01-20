import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, User, Package, ArrowRight, Calendar, X, CheckCircle, DollarSign, Clock } from 'lucide-react';

import { VendorModel } from '../services/VendorModel';
import { CustomerModel } from '../services/CustomerModel';
import { PlanModel } from '../services/PlanModel';
import { PurchaseModel } from '../services/PurchaseModel';
import { AuthModel } from '../services/AuthModel';


const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Schedule/Repayment Modal State
    const [selectedPlanForSchedule, setSelectedPlanForSchedule] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const [vendors, setVendors] = useState([]);
    const [companies] = useState(['Haier', 'Dawlance', 'PEL', 'Samsung', 'Waves', 'LG', 'Orient', 'Gree']);
    const currentUser = AuthModel.getCurrentUser();

    // Customer Search State
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerResults, setCustomerResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Product/Inventory Search State
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [formData, setFormData] = useState({
        productId: '',
        productName: '',
        category: 'Product',
        company: '',
        price: '',
        paymentType: 'Installment',
        installmentPlan: '6 Months',
        downPayment: '',
        monthlyInstallment: '',
        processingFee: '',
        dealtBy: currentUser?.fullName || '',
        preferredDueDate: '5'
    });

    const fetchPlans = useCallback(async () => {
        try {
            const data = await PlanModel.getAll();
            let filtered = data;
            if (filter !== 'All') {
                filtered = data.filter(p => p.status === filter);
            }
            setPlans(filtered.reverse());
        } catch (err) {
            console.error('Failed to load plans from database', err);
            // Fallback to local storage if backend fails (optional)
            const localData = JSON.parse(localStorage.getItem('local_plans_backup') || '[]');
            setPlans(localData.reverse());
        }
    }, [filter]);

    useEffect(() => {
        fetchPlans();
        loadVendors();
    }, [fetchPlans, filter]);

    const loadVendors = async () => {
        try {
            const data = await VendorModel.getAll();
            setVendors(data);
        } catch (error) {
            console.error('Failed to load vendors', error);
        }
    };

    // Handle Customer Search
    useEffect(() => {
        const searchCustomers = async () => {
            if (customerSearchTerm.length < 2) {
                setCustomerResults([]);
                return;
            }
            setLoadingCustomers(true);
            try {
                const data = await CustomerModel.getAll({ search: customerSearchTerm });
                setCustomerResults(data);
            } catch (error) {
                console.error('Customer search failed', error);
            } finally {
                setLoadingCustomers(false);
            }
        };

        const debounce = setTimeout(searchCustomers, 300);
        return () => clearTimeout(debounce);
    }, [customerSearchTerm]);

    // Handle Product Search
    useEffect(() => {
        const searchProducts = async () => {
            if (productSearchTerm.length < 2) {
                setProductResults([]);
                return;
            }
            setLoadingProducts(true);
            try {
                console.log('Searching for products:', productSearchTerm);
                // Fetch available products from inventory
                const data = await InventoryModel.getAll({ status: 'Available', search: productSearchTerm });
                console.log('Product search results:', data);
                setProductResults(data);
            } catch (error) {
                console.error('Product search failed:', error);
                console.error('Error details:', error.response?.data || error.message);
                setProductResults([]);
            } finally {
                setLoadingProducts(false);
            }
        };

        const debounce = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounce);
    }, [productSearchTerm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCustomer) {
            alert('Please select a customer first');
            return;
        }

        if (!selectedProduct) {
            alert('Please select a product from inventory');
            return;
        }

        try {
            const price = parseFloat(formData.price) || 0;
            const advance = parseFloat(formData.downPayment) || 0;
            const months = parseInt(formData.installmentPlan) || 1;
            const remainingMonths = months > 1 ? months - 1 : 1;
            const installmentAmt = (formData.paymentType === 'Installment') ? Math.ceil((price - advance) / remainingMonths) : 0;

            const apiData = {
                customer: selectedCustomer._id,
                product: selectedProduct._id,
                productName: selectedProduct.productName,
                brand: selectedProduct.brand,
                model: selectedProduct.model,
                price: price, // Required by schema
                totalAmount: price, // Legacy support for controller calculation
                advancePayment: advance,
                durationMonths: formData.paymentType === 'Installment' ? months : 0,
                installmentAmount: installmentAmt,
                processingFee: parseFloat(formData.processingFee) || 0,
                preferredDueDate: formData.preferredDueDate,
                paymentType: formData.paymentType,
                installmentPlan: formData.installmentPlan,
                category: selectedProduct.category || formData.category,
                company: selectedProduct.brand || formData.company,
                saleOfficer: currentUser?.employeeId || currentUser?._id || currentUser?.id,
                dealtBy: formData.dealtBy,
                status: 'Active'
            };

            await PlanModel.create(apiData);

            alert('Plan saved successfully to database!');
            setIsModalOpen(false);
            fetchPlans(); // Refresh the list
            setSelectedCustomer(null);
            setCustomerSearchTerm('');
            setSelectedProduct(null);
            setProductSearchTerm('');

            setFormData({
                productId: '',
                productName: '',
                category: 'Product',
                company: '',
                price: '',
                paymentType: 'Installment',
                installmentPlan: '6 Months',
                downPayment: '',
                monthlyInstallment: '',
                dealtBy: currentUser?.fullName || '',
                preferredDueDate: '5'
            });
        } catch (error) {
            console.error('Save failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to save plan to database';
            alert(`Error: ${msg}`);
        }
    };

    const handlePayInstallment = async (planId, amount) => {
        if (!confirm('Are you sure you want to mark this installment as PAID?')) return;

        try {
            const user = AuthModel.getCurrentUser();
            await PlanModel.payInstallment(planId, {
                amount,
                officerId: user?._id || user?.id,
                paymentMethod: 'Cash' // For now, can be expanded to a selection
            });
            await fetchPlans();

            // Refresh modal data
            const freshPlan = await PlanModel.getById(planId);
            setSelectedPlanForSchedule(freshPlan);

            alert('Payment recorded successfully!');
        } catch (error) {
            console.error('Payment failed', error);
            alert('Failed to record payment');
        }
    };

    const filteredPlansList = plans.filter(plan => {
        const searchSafe = searchTerm.toLowerCase();
        const matchesSearch =
            plan.productName?.toLowerCase().includes(searchSafe) ||
            plan._id?.toLowerCase().includes(searchSafe) ||
            plan.customerName?.toLowerCase().includes(searchSafe) ||
            plan.customer?.fullName?.toLowerCase().includes(searchSafe) ||
            plan.customer?.cnic?.includes(searchSafe);

        const isInstallmentPlan = plan.paymentType === 'Installment' || (plan.durationMonths && plan.durationMonths > 0);

        return matchesSearch && isInstallmentPlan;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            <div className="flex justify-end items-center mb-8">
                <button
                    className="premium-btn with-icon"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} />
                    <span>New Sale Plan</span>
                </button>
            </div>

            <div className="glass-card flex flex-wrap items-center justify-between px-6 py-4 gap-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex-1 max-w-md transition-colors focus-within:bg-white/10 focus-within:border-[var(--primary)]">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Plan ID, Customer or Product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full placeholder-slate-400 focus:ring-0 p-0"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {['All', 'Active', 'Overdue', 'Completed'].map(f => (
                        <button
                            key={f}
                            className={`filter-chip ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4 p-4">
                {filteredPlansList.length > 0 ? filteredPlansList.map((plan, i) => {
                    const totalAmount = plan.price || plan.totalAmount || 0;
                    const duration = plan.durationMonths || parseInt(plan.installmentPlan) || 0;

                    const schedule = plan.schedule || [];
                    const paidInstallments = schedule.filter(s => s.status === 'Paid');
                    const totalPaidAmount = paidInstallments.reduce((sum, s) => sum + (s.paidAmount || s.amount), 0);

                    const remaining = Math.max(0, totalAmount - totalPaidAmount);
                    const paidCount = paidInstallments.length;

                    const progress = totalAmount > 0 ? (totalPaidAmount / totalAmount) * 100 : 0;

                    return (
                        <motion.div
                            key={plan._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="glass-card p-4 transition-all hover:bg-white/5 group border border-white/5 hover:border-[var(--primary)]/30 relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
                                {/* Left Section: ID & Customer */}
                                <div className="flex-1 min-w-[200px] flex gap-3 items-center w-full">
                                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0 font-bold border border-[var(--primary)]/20">
                                        {plan.customer?.fullName?.[0] || <User size={18} />}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-1.5 py-0.5 rounded tracking-wider">
                                                #{plan._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {plan.preferredDueDate ? `${plan.preferredDueDate}th` : '5th'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-white text-sm truncate leading-tight mt-1">
                                            {plan.customer?.fullName || plan.customerName || 'Walk-in Customer'}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 truncate mt-0.5">
                                            <Package size={12} className="shrink-0" />
                                            <span className="truncate">{plan.productName || plan.saleItemName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dividers for desktop */}
                                <div className="hidden md:block w-px h-10 bg-white/10 mx-2"></div>

                                {/* Middle Section: Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 w-full md:w-auto flex-[1.5]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total</span>
                                        <span className="text-sm font-bold text-slate-200">
                                            {totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Paid</span>
                                        <span className="text-sm font-bold text-emerald-400">
                                            {totalPaidAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Remaining</span>
                                        <span className="text-sm font-bold text-[var(--secondary)]">
                                            {remaining.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Installs</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-bold text-white">{paidCount}/{duration}</span>
                                            {duration > 0 && paidCount < duration && (
                                                <span className="text-[9px] text-orange-400 bg-orange-400/10 px-1.5 py-[1px] rounded ml-1">
                                                    {duration - paidCount} left
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Status & Actions */}
                                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:pl-4">
                                    <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                                        <div className={`status-badge ${plan.status.toLowerCase()} text-[10px] py-0.5 px-2.5 shadow-sm`}>
                                            {plan.status}
                                        </div>
                                        {/* Mini Progress Bar */}
                                        <div className="w-full max-w-[100px] h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all border border-white/5 hover:scale-105 active:scale-95 group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)]"
                                        onClick={() => {
                                            setSelectedPlanForSchedule(plan);
                                            setIsScheduleModalOpen(true);
                                        }}
                                    >
                                        <ArrowRight size={16} className="group-hover:text-white" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                }) : (
                    <div className="text-center py-20 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No sales plans found matching your filters.</p>
                    </div>
                )}
            </div>
            {/* New Sale Plan Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                            style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold">New Sale Plan</h2>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedCustomer(null);
                                        setCustomerSearchTerm('');
                                        setSelectedProduct(null);
                                        setProductSearchTerm('');
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden ">
                                <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
                                    {/* Customer Selection Section */}
                                    <div className="space-y-4 pb-4 border-b border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-6 bg-[var(--secondary)] rounded-full"></div>
                                            <h3 className="text-lg font-bold">Select Customer</h3>
                                        </div>

                                        {!selectedCustomer ? (
                                            <div className="relative">
                                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 transition-colors focus-within:bg-white/10 focus-within:border-[var(--primary)]">
                                                    <Search size={18} className="text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by Name or CNIC..."
                                                        value={customerSearchTerm}
                                                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                                        className="bg-transparent border-none outline-none text-white w-full placeholder-slate-400 focus:ring-0 p-0"
                                                    />
                                                    {loadingCustomers && <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>}
                                                </div>

                                                {customerResults.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                                        {customerResults.map(c => (
                                                            <button
                                                                key={c._id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedCustomer(c);
                                                                    setCustomerResults([]);
                                                                    setCustomerSearchTerm('');
                                                                }}
                                                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
                                                                    {c.fullName[0]}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-white text-sm">{c.fullName}</span>
                                                                    <span className="text-xs text-slate-400">{c.cnic} • {c.primaryPhone}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-2xl p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg">
                                                        {selectedCustomer.fullName[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white">{selectedCustomer.fullName}</span>
                                                        <span className="text-sm text-slate-400">{selectedCustomer.cnic} • {selectedCustomer.primaryPhone}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCustomer(null)}
                                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="w-1.5 h-6 bg-[var(--primary)] rounded-full"></div>
                                        <h3 className="text-lg font-bold">Product Selection</h3>
                                    </div>

                                    {!selectedProduct ? (
                                        <div className="relative">
                                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 transition-colors focus-within:bg-white/10 focus-within:border-[var(--primary)]">
                                                <Package size={18} className="text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search Product in Inventory (Name, Model, IMEI)..."
                                                    value={productSearchTerm}
                                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                                    className="bg-transparent border-none outline-none text-white w-full placeholder-slate-400 focus:ring-0 p-0"
                                                />
                                                {loadingProducts && <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>}
                                            </div>

                                            {productResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                                    {productResults.map(p => (
                                                        <button
                                                            key={p._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedProduct(p);
                                                                setProductResults([]);
                                                                setProductSearchTerm('');
                                                                // Auto fill price if helpful
                                                                setFormData(prev => ({ ...prev, price: p.sellingPrice || p.purchasePrice || '' }));
                                                            }}
                                                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                                                                <Package size={18} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-white text-sm">{p.productName}</span>
                                                                <span className="text-xs text-slate-400">{p.brand} {p.model} • Rs. {p.sellingPrice?.toLocaleString() || 'N/A'}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                                                    <Package size={24} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white uppercase">{selectedProduct.productName}</span>
                                                    <span className="text-sm text-slate-400">{selectedProduct.brand} {selectedProduct.model} • SKU: {selectedProduct.sku || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProduct(null)}
                                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="w-1.5 h-6 bg-[var(--primary)] rounded-full"></div>
                                        <h3 className="text-lg font-bold">Pricing & Plan</h3>
                                    </div>


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Total Price (Rs.)</label>
                                            <input
                                                required
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Payment Type</label>
                                            <select
                                                name="paymentType"
                                                value={formData.paymentType}
                                                onChange={handleInputChange}
                                                className="input-field w-full"
                                            >
                                                <option value="Full Cash">Full Cash</option>
                                                <option value="Installment">Installment</option>
                                            </select>
                                        </div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {formData.paymentType === 'Installment' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden space-y-5 pt-4 border-t border-white/10"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-6 bg-[var(--primary)] rounded-full"></div>
                                                    <h3 className="text-lg font-bold">Installment Details</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300">Select Monthly Plan</label>
                                                        <select
                                                            name="installmentPlan"
                                                            value={formData.installmentPlan}
                                                            onChange={handleInputChange}
                                                            className="input-field w-full"
                                                        >
                                                            {[6, 8, 9, 12, 18, 24].map(months => {
                                                                const price = parseFloat(formData.price) || 0;
                                                                const down = parseFloat(formData.downPayment) || 0;
                                                                const remaining = price - down;
                                                                const remainingMonths = months > 1 ? months - 1 : 1;
                                                                const perMonth = remaining > 0 ? Math.ceil(remaining / remainingMonths) : 0;
                                                                return (
                                                                    <option key={months} value={`${months} Months`}>
                                                                        {months} Months Plan {perMonth > 0 ? `- (Rs. ${perMonth.toLocaleString()}/mo)` : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                            <option value="Custom">Custom Duration</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300">Down Payment (Advance)</label>
                                                        <input
                                                            type="number"
                                                            name="downPayment"
                                                            value={formData.downPayment}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter advance amount"
                                                            className="input-field"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300">
                                                            {formData.installmentPlan === 'Custom' ? 'Custom Months' : 'Confirmed Monthly Amount'}
                                                        </label>
                                                        {formData.installmentPlan === 'Custom' ? (
                                                            <input
                                                                type="number"
                                                                placeholder="Enter number of months"
                                                                className="input-field"
                                                                onChange={(e) => {
                                                                    // Handle custom months if needed
                                                                }}
                                                            />
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                readOnly
                                                                value={`Rs. ${(() => {
                                                                    const months = parseInt(formData.installmentPlan) || 6;
                                                                    const price = parseFloat(formData.price) || 0;
                                                                    const down = parseFloat(formData.downPayment) || 0;
                                                                    const remainingMonths = months > 1 ? months - 1 : 1;
                                                                    const perMonth = (price - down) > 0 ? Math.ceil((price - down) / remainingMonths) : 0;
                                                                    return perMonth.toLocaleString();
                                                                })()}`}
                                                                className="input-field bg-white/5 border-white/5 text-[var(--secondary)] font-bold"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300">Processing Fee</label>
                                                        <input
                                                            type="number"
                                                            name="processingFee"
                                                            value={formData.processingFee}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter fee (if any)"
                                                            className="input-field"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300">Monthly Due Date</label>
                                                        <select
                                                            name="preferredDueDate"
                                                            value={formData.preferredDueDate}
                                                            onChange={handleInputChange}
                                                            className="input-field w-full"
                                                        >
                                                            {[1, 5, 10, 15, 20, 25, 28].map(date => (
                                                                <option key={date} value={date.toString()}>
                                                                    Every {date}th of Month
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="p-6 border-t border-white/10 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedCustomer(null);
                                            setCustomerSearchTerm('');
                                            setSelectedProduct(null);
                                            setProductSearchTerm('');
                                        }}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 premium-btn"
                                    >
                                        Create Plan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Schedule / Repayment Modal */}
            <AnimatePresence>
                {isScheduleModalOpen && selectedPlanForSchedule && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                            style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        <Calendar className="text-[var(--primary)]" />
                                        Repayment Schedule
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Plan #{selectedPlanForSchedule._id.slice(-6).toUpperCase()} • {selectedPlanForSchedule.customer?.fullName || selectedPlanForSchedule.customerName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsScheduleModalOpen(false);
                                        setSelectedPlanForSchedule(null);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Amount</span>
                                        <span className="text-lg font-bold text-white">Rs. {selectedPlanForSchedule.totalAmount?.toLocaleString() || selectedPlanForSchedule.price?.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Paid Amount</span>
                                        <span className="text-lg font-bold text-emerald-400">
                                            Rs. {((selectedPlanForSchedule.schedule?.filter(s => s.status === 'Paid').reduce((acc, curr) => acc + (curr.paidAmount || curr.amount), 0) || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Remaining</span>
                                        {(() => {
                                            const paid = (selectedPlanForSchedule.schedule?.filter(s => s.status === 'Paid').reduce((acc, curr) => acc + (curr.paidAmount || curr.amount), 0) || 0);
                                            const total = (selectedPlanForSchedule.price || selectedPlanForSchedule.totalAmount || 0);
                                            return (
                                                <span className="text-lg font-bold text-[var(--secondary)]">
                                                    Rs. {Math.max(0, total - paid).toLocaleString()}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Schedule Table */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Installments</h3>
                                    <div className="space-y-3">
                                        {selectedPlanForSchedule.schedule?.map((item, index) => {
                                            const isPaid = item.status === 'Paid';
                                            const isOverdue = item.status === 'Overdue';
                                            const dueDate = new Date(item.dueDate).toLocaleDateString();
                                            const paidDate = item.paidDate ? new Date(item.paidDate).toLocaleDateString() : '-';

                                            return (
                                                <div
                                                    key={index}
                                                    className={`relative p-4 rounded-xl border transition-all ${isPaid
                                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                                        : isOverdue
                                                            ? 'bg-red-500/5 border-red-500/20'
                                                            : 'bg-white/5 border-white/5'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                                                                }`}>
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-white">Rs. {item.amount.toLocaleString()}</span>
                                                                    {isPaid && <span className="text-xs text-emerald-400 font-mono">(Paid: {item.paidAmount?.toLocaleString()})</span>}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock size={12} /> Due: {dueDate}
                                                                    </span>
                                                                    {isPaid && (
                                                                        <span className="flex items-center gap-1 text-emerald-400/70">
                                                                            <CheckCircle size={12} /> Paid: {paidDate}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            {item.status === 'Pending' || item.status === 'Overdue' ? (
                                                                <button
                                                                    onClick={() => handlePayInstallment(selectedPlanForSchedule._id, item.amount)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-[var(--primary)]/20"
                                                                >
                                                                    <DollarSign size={16} />
                                                                    Pay Now
                                                                </button>
                                                            ) : (
                                                                <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                                                                    <CheckCircle size={14} />
                                                                    Paid
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!selectedPlanForSchedule.schedule || selectedPlanForSchedule.schedule.length === 0) && (
                                            <div className="text-center py-8 text-slate-500">
                                                No schedule generated for this plan.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Plans;