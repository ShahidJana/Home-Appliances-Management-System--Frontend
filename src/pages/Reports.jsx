import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    FileText
} from 'lucide-react';

const ReportCard = ({ title, value, trend, trendValue, icon: Icon }) => (
    <div className="glass-card p-6">
        <div className="flex justify-between mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--primary)]">
                <Icon size={20} />
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{trendValue}</span>
            </div>
        </div>
        <div>
            <p className="text-xs text-slate-400 mb-1 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
    </div>
);

const Reports = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Intelligence Hub</h1>
                    <p className="text-slate-400">Financial analytics and operational performance auditing</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
                        <Calendar size={18} />
                        <span>Oct 2026</span>
                    </button>
                    <button className="premium-btn">
                        <Download size={18} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard
                    title="Gross Revenue"
                    value="Rs. 4.2M"
                    trend="up"
                    trendValue="18%"
                    icon={TrendingUp}
                />
                <ReportCard
                    title="Recovery Efficiency"
                    value="94.2%"
                    trend="up"
                    trendValue="2.4%"
                    icon={PieChart}
                />
                <ReportCard
                    title="Operating Costs"
                    value="Rs. 840K"
                    trend="down"
                    trendValue="5.1%"
                    icon={BarChart3}
                />
                <ReportCard
                    title="Inventory Assets"
                    value="Rs. 12.8M"
                    trend="up"
                    trendValue="8.2%"
                    icon={FileText}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Revenue Projection</h3>
                        <div className="flex gap-2 bg-black/10 p-1 rounded-lg">
                            <button className="bg-[var(--primary)] text-white text-[11px] font-semibold px-3 py-1 rounded-md">Weekly</button>
                            <button className="bg-transparent border-none text-[11px] font-semibold text-slate-400 px-3 py-1 rounded-md hover:text-white transition-colors">Monthly</button>
                        </div>
                    </div>
                    <div className="h-[300px] bg-white/[0.01] border border-dashed border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                        {/* Dynamic chart logic would go here */}
                        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
                        <p className="text-sm text-slate-500 opacity-50 italic group-hover:opacity-80 transition-opacity">Revenue Growth Visualization Engine</p>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Audit Log</h3>
                        <button className="text-sm text-[var(--primary)] hover:text-indigo-400 transition-colors font-medium">View All</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)] shrink-0"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-200 m-0 leading-relaxed">Inventory Stock Reconciled by <strong className="text-pink-500">Admin</strong></p>
                                    <span className="text-[11px] text-slate-500">2 hours ago</span>
                                </div>
                                <ChevronRight size={14} className="text-slate-600" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;
