import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useDashboardController } from '../hooks/useDashboardController';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-6 group relative overflow-hidden"
  >
    <div className="flex justify-between items-center mb-5 relative z-10 gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 shrink-0 ${color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400 shadow-indigo-500/10' :
        color === 'pink' ? 'bg-pink-500/20 text-pink-400 shadow-pink-500/10' :
          color === 'orange' ? 'bg-amber-500/20 text-amber-400 shadow-amber-500/10' :
            'bg-red-500/20 text-red-400 shadow-red-500/10'
        }`}>
        <Icon size={24} />
      </div>
      <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight truncate">{value}</h3>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{title}</p>
      {subValue && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full ${color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
          <p className={`text-[10px] font-bold tracking-tight ${color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>{subValue}</p>
        </div>
      )}
    </div>
    {/* Background Glow */}
    <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${color === 'indigo' ? 'bg-indigo-500' :
      color === 'pink' ? 'bg-pink-500' :
        color === 'orange' ? 'bg-amber-500' :
          'bg-red-500'
      }`} />
  </motion.div>
);

const Dashboard = () => {
  const { stats, loading } = useDashboardController();
  const navigate = useNavigate();

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
          value={`Rs. ${stats?.totalRecovery?.toLocaleString() || '0'}`}
          subValue={`${stats?.todayRecovery?.count || 0} Installments today`}
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
        <motion.div variants={item} className="glass-card p-7 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-none">Recent Installments</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1.5">Latest recovery logs</p>
              </div>
            </div>
            <button onClick={() => navigate('/plans')} className="premium-btn py-1.5 px-4 text-[10px] flex items-center gap-2">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 text-xs text-slate-400 border-b border-white/10 uppercase tracking-wider font-semibold">
              <span>Customer</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            {stats?.recentTransactions?.length > 0 ? stats.recentTransactions.map((tx) => (
              <div key={tx._id} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold text-xs">
                    {(tx.customer?.fullName || 'W').charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{tx.customer?.fullName || 'Walk-in'}</span>
                </div>
                <span className="text-sm font-bold text-white">Rs. {tx.amount?.toLocaleString()}</span>
                <span className="text-sm text-slate-400">
                  {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-center w-fit ${tx.category === 'Installment' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                  {tx.category || 'Sale'}
                </span>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-sm italic">No recent transactions found</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-7 relative overflow-hidden group flex flex-col h-full">
          {/* Subtle Background Decoration */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700" />

          <div className="flex items-center gap-3 mb-8 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">Collection Performance</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Weekly Recovery Trends</p>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-[10px] text-emerald-400 font-black">+14.2% Growth</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col">
            {/* Chart Area */}
            <div className="flex-1 relative flex flex-col justify-end mb-4">
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pb-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full border-t border-dashed border-white/20 h-0" />
                ))}
              </div>

              <div className="flex justify-between w-full h-[85%] items-end gap-3 relative z-10 px-1">
                {stats?.dailyPerformance?.length > 0 ? stats.dailyPerformance.map((day, i) => {
                  const maxAmount = Math.max(...stats.dailyPerformance.map(d => d.amount), 1);
                  const heightPercent = Math.max((day.amount / maxAmount) * 100, 5);

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group/bar relative h-full">
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] font-black text-white px-3 py-1.5 rounded-lg shadow-xl shadow-indigo-900/40 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 whitespace-nowrap z-20 translate-y-2 group-hover/bar:translate-y-0 scale-75 group-hover/bar:scale-100">
                        Rs. {day.amount.toLocaleString()}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45" />
                      </div>

                      <div className="flex-1 w-full flex flex-col items-center justify-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 1.2, delay: i * 0.1, ease: "circOut" }}
                          className="w-full max-w-[28px] bg-gradient-to-t from-indigo-700 via-indigo-500 to-indigo-400 rounded-t-lg shadow-[0_-4px_20px_-5px_rgba(99,102,241,0.4)] group-hover/bar:shadow-[0_-4px_25px_-2px_rgba(99,102,241,0.7)] transition-all duration-300 relative border-x border-t border-white/10"
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="w-full flex flex-col items-center justify-center gap-4 py-10 opacity-30">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                      <BarChart3 size={30} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Awaiting Data Streams</p>
                  </div>
                )}
              </div>
            </div>

            {/* X-Axis (Dates) at bottom */}
            <div className="flex justify-between w-full shrink-0 px-1 border-t border-white/5 pt-4">
              {stats?.dailyPerformance?.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <span className="text-sm text-white font-black italic tracking-tighter leading-none mb-1">
                    {new Date(day._id).getDate()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                    {new Date(day._id).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
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
