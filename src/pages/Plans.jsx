import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Package, ArrowRight, Calendar, X, CheckCircle, DollarSign, Clock } from 'lucide-react';

import { PlanModel } from '../services/PlanModel';
import { AuthModel } from '../services/AuthModel';


const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [filter, setFilter] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');


    // Schedule/Repayment Modal State
    const [selectedPlanForSchedule, setSelectedPlanForSchedule] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const currentUser = AuthModel.getCurrentUser();

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
    }, [fetchPlans]);

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
                    {['Active', 'Overdue', 'Completed', 'All'].map(f => (
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
                                                <Calendar size={10} /> Due Date:
                                                {` ${plan.schedule?.length
                                                    ? (() => {
                                                        const d = new Date(plan.schedule.at(-1).dueDate).getDate();
                                                        return d + (d > 3 && d < 21 ? 'th' : ['th', 'st', 'nd', 'rd'][d % 10] || 'th');
                                                    })()
                                                    : '5th'
                                                    }`}
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