import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Calendar,
    Download,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    DollarSign,
    Briefcase,
    ShoppingCart,
    Filter,
    X,
    User,
    Truck,
    Clock,
    CheckCircle
} from 'lucide-react';
import { TransactionModel } from '../services/TransactionModel';
import { EmployeeModel } from '../services/EmployeeModel';
import { VendorModel } from '../services/VendorModel';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Get local date in YYYY-MM-DD format
    const getLocalDate = (date) => {
        const d = new Date(date);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const today = getLocalDate(new Date());
    const yesterday = getLocalDate(new Date(Date.now() - 86400000));

    const [filter, setFilter] = useState({
        category: '',
        startDate: yesterday,
        endDate: today
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '' // 'expense', 'salary', 'purchase'
    });

    const [formData, setFormData] = useState({
        amount: '',
        subCategory: '',
        description: '',
        employeeId: '',
        vendorId: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash'
    });

    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await TransactionModel.getAll({
                ...filter,
                search: debouncedSearch
            });
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, debouncedSearch]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        const loadRefs = async () => {
            try {
                const [empData, venData] = await Promise.all([
                    EmployeeModel.getAll(),
                    VendorModel.getAll()
                ]);
                setEmployees(empData);
                setVendors(venData);
            } catch (error) {
                console.error('Failed to load references:', error);
            }
        };
        loadRefs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalState.type === 'expense') {
                await TransactionModel.addExpense(formData);
            } else if (modalState.type === 'salary') {
                await TransactionModel.addSalary(formData);
            } else if (modalState.type === 'purchase') {
                await TransactionModel.addPurchase(formData);
            }
            alert('Transaction recorded successfully!');
            setModalState({ isOpen: false, type: '' });
            setFormData({
                amount: '',
                subCategory: '',
                description: '',
                employeeId: '',
                vendorId: '',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'Cash'
            });
            fetchTransactions();
        } catch (error) {
            alert('Failed to record transaction: ' + error.message);
        }
    };

    const stats = {
        inflow: transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0),
        outflow: transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0),
        net: 0
    };
    stats.net = stats.inflow - stats.outflow;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-end">
                <button
                    onClick={() => setModalState({ isOpen: true, type: 'expense' })}
                    className="premium-btn flex items-center gap-2 bg-amber-500 border-amber-500/30 hover:bg-amber-500/30"
                >
                    <Plus size={18} />
                    <span>Add Expense</span>
                </button>
                <button
                    onClick={() => setModalState({ isOpen: true, type: 'salary' })}
                    className="premium-btn flex items-center gap-2 bg-indigo-500 border-indigo-500/30 hover:bg-indigo-500/30"
                >
                    <Briefcase size={18} />
                    <span>Pay Salary</span>
                </button>
                <button
                    onClick={() => setModalState({ isOpen: true, type: 'purchase' })}
                    className="premium-btn flex items-center gap-2 bg-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30"
                >
                    <ShoppingCart size={18} />
                    <span>Vendor Payment</span>
                </button>
                <button className="premium-btn flex items-center gap-2">
                    <Download size={18} />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-emerald-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <ArrowUpRight size={24} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider bg-emerald-500/10 px-2 py-1 rounded-md">Total Inflow</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">Rs. {stats.inflow.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400">Sales & Installments</p>
                </div>

                <div className="glass-card p-6 border-red-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                            <ArrowDownRight size={24} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider bg-red-500/10 px-2 py-1 rounded-md">Total Outflow</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">Rs. {stats.outflow.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400">Expenses, Salaries & Purchases</p>
                </div>

                <div className="glass-card p-6 border-indigo-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider bg-indigo-500/10 px-2 py-1 rounded-md">Net Balance</span>
                    </div>
                    <h3 className={`text-2xl font-bold mb-1 ${stats.net >= 0 ? 'text-white' : 'text-red-400'}`}>
                        Rs. {stats.net.toLocaleString()}
                    </h3>
                    <p className="text-xs text-slate-400">Profit/Loss Estimate</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-card p-4 flex flex-wrap items-center gap-4 border-white/5 shadow-inner">
                <div className="flex-[2] min-w-[300px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by description, type or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-indigo-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600 font-medium"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filter.category}
                        onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm font-semibold min-w-[180px]"
                    >
                        <option value="">All Categories</option>
                        <option value="Sale">Sale Revenue</option>
                        <option value="Installment">Installments</option>
                        <option value="Expense">Overhead Expenses</option>
                        <option value="Salary">Staff Salaries</option>
                        <option value="Purchase">Vendor Purchases</option>
                    </select>

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">From</span>
                            <input
                                type="date"
                                value={filter.startDate}
                                max={filter.endDate || today}
                                onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                className="bg-transparent text-xs text-white outline-none py-2 cursor-pointer w-[110px]"
                            />
                        </div>
                        <div className="w-px h-4 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">To</span>
                            <input
                                type="date"
                                value={filter.endDate}
                                min={filter.startDate}
                                max={today}
                                onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                className="bg-transparent text-xs text-white outline-none py-2 cursor-pointer w-[110px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Filter size={18} className="text-[var(--primary)]" />
                        Transaction History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-left">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Date</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Details</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Type</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Category</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading transactions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((t, i) => (
                                    <tr key={t._id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0 group">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{new Date(t.date).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-slate-500">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-200">{t.description || 'No description'}</span>
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    {t.category === 'Sale' || t.category === 'Installment' ? (
                                                        <><User size={10} /> {t.customer?.fullName || t.customerName || 'Walk-in'}</>
                                                    ) : t.category === 'Purchase' ? (
                                                        <><Truck size={10} /> {t.vendor?.name || 'Unknown Vendor'}</>
                                                    ) : t.category === 'Salary' ? (
                                                        <><Briefcase size={10} /> {t.employee?.name || 'Unknown Employee'}</>
                                                    ) : (
                                                        <span className="lowercase italic">{t.subCategory || 'General'}</span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${t.type === 'Credit'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-400 font-medium">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`text-base font-bold ${t.type === 'Credit' ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {t.type === 'Credit' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add Transaction */}
            <AnimatePresence>
                {modalState.isOpen && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card w-full max-w-lg overflow-hidden flex flex-col"
                            style={{ background: 'rgba(15, 23, 42, 0.95)' }}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold capitalize">
                                    Record {modalState.type}
                                </h2>
                                <button
                                    onClick={() => setModalState({ isOpen: false, type: '' })}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-400">Amount (Rs.)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-400">Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                                        />
                                    </div>
                                </div>

                                {modalState.type === 'expense' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-400">Category (Electricity, Gas, etc.)</label>
                                        <select
                                            required
                                            value={formData.subCategory}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Electricity">Electricity Bill</option>
                                            <option value="Gas">Gas Bill</option>
                                            <option value="Water">Water Bill</option>
                                            <option value="Internet">Internet/PTCL</option>
                                            <option value="Rent">Shop Rent</option>
                                            <option value="Refreshment">Refreshment</option>
                                            <option value="Cleaning">Cleaning</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                )}

                                {modalState.type === 'salary' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-400">Select Employee</label>
                                        <select
                                            required
                                            value={formData.employeeId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {modalState.type === 'purchase' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-slate-400">Select Vendor</label>
                                        <select
                                            required
                                            value={formData.vendorId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map(v => (
                                                <option key={v._id} value={v._id}>{v.name} ({v.shopName})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Description</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary)] outline-none resize-none"
                                        placeholder="Add additional notes here..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Cash', 'Bank Transfer'].map(method => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                                                className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.paymentMethod === method
                                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalState({ isOpen: false, type: '' })}
                                        className="flex-1 px-4 py-4 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-all outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-4 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 outline-none"
                                    >
                                        Record Payment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Transactions;
