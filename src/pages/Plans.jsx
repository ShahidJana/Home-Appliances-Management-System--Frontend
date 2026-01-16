import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Filter,
    ChevronDown,
    CircleDollarSign,
    User,
    Package,
    ArrowRight
} from 'lucide-react';
import { usePlanController } from '../hooks/usePlanController';

const Plans = () => {
    const { plans, loading, fetchPlans } = usePlanController();
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Sales & Installment Plans</h1>
                    <p className="text-slate-400">Monitor active contracts and recovery schedules</p>
                </div>
                <button className="premium-btn with-icon">
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
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_40px] p-8 items-center gap-6 transition-transform hover:translate-x-1"
                    >
                        <div className="w-full">
                            <div className="font-mono font-bold text-[var(--primary)] text-sm mb-2 block">
                                #{plan._id.slice(-6).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <User size={14} className="text-slate-500" />
                                    <span>{plan.customer?.fullName || 'Walk-in Customer'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Package size={14} className="text-slate-500" />
                                    <span>{plan.productName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 w-full">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Total Amount</span>
                                <span className="font-bold text-base">Rs. {plan.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Remaining</span>
                                <span className="font-bold text-base text-[var(--secondary)]">Rs. {plan.remainingAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="w-full">
                            <div className={`status-badge ${plan.status.toLowerCase()} mb-3`}>
                                {plan.status}
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        <button className="icon-btn-rounded hidden md:flex">
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Plans;
