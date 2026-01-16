import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { useDashboardController } from '../hooks/useDashboardController';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-6"
  >
    <div className="flex justify-between items-start mb-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'indigo' ? 'bg-indigo-500/15 text-indigo-400' :
        color === 'pink' ? 'bg-pink-500/15 text-pink-400' :
          color === 'orange' ? 'bg-amber-500/15 text-amber-400' :
            'bg-red-500/15 text-red-400'
        }`}>
        <Icon size={24} />
      </div>
      <ArrowUpRight size={20} className="text-slate-400 opacity-50" />
    </div>
    <div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-slate-400 font-medium">{title}</p>
      {subValue && <p className={`text-xs mt-1 ${color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>{subValue}</p>}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { stats, loading } = useDashboardController();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-lg text-slate-400">Synthesizing Analytics...</div>;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
        </div>
        <button className="premium-btn">Generate Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Plans"
          value={stats?.activePlans || '0'}
          subValue="+12% from last month"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Total Recovery"
          value={`Rs. ${stats?.recoveryMonthWise?.[0]?.recovery?.toLocaleString() || '0'}`}
          subValue={`${stats?.recoveryMonthWise?.[0]?.count || 0} Installments today`}
          icon={CreditCard}
          color="pink"
        />
        <StatCard
          title="Pending Commitments"
          value={stats?.commitments?.today || '0'}
          subValue="Due for collection"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Overdue Sessions"
          value={stats?.commitments?.overdue || '0'}
          subValue="Requires immediate action"
          icon={AlertCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="glass-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Installments</h3>
            <button className="text-[var(--primary)] flex items-center gap-1 text-sm font-semibold hover:text-indigo-400 transition-colors">View All <ChevronRight size={16} /></button>
          </div>
          <div className="flex flex-col">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 text-xs text-slate-400 border-b border-white/10 uppercase tracking-wider font-semibold">
              <span>Customer</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            {/* Mock data until real recent transactions implemented */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center font-semibold text-xs">K</div>
                  <span className="text-sm">Muhammad Khan</span>
                </div>
                <span className="text-sm font-medium">Rs. 8,500</span>
                <span className="text-sm text-slate-400">Oct 12, 2026</span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-center w-fit bg-emerald-500/10 text-emerald-400">Approved</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-bold">Collection Performance</h3>
          <div className="h-[200px] mt-8 flex items-end">
            <div className="flex justify-between w-full h-full items-end gap-3">
              {[60, 80, 45, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--secondary)] rounded-t-lg opacity-80"
                  />
                  <span className="text-[10px] text-slate-400">Day {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
