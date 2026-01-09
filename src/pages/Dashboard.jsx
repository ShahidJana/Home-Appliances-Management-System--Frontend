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
        className="glass-card stat-card"
    >
        <div className="stat-header">
            <div className={`stat-icon ${color}`}>
                <Icon size={24} />
            </div>
            <ArrowUpRight size={20} className="trend-arrow" />
        </div>
        <div className="stat-body">
            <h3>{value}</h3>
            <p className="stat-title">{title}</p>
            {subValue && <p className="stat-subtitle">{subValue}</p>}
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

    if (loading) return <div className="loading-screen">Synthesizing Analytics...</div>;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="dashboard-wrapper"
        >
            <div className="page-header">
                <div>
                    <h1>Strategic Overview</h1>
                    <p>Real-time analytics for Karim Electronics Enterprise</p>
                </div>
                <button className="premium-btn">Generate Report</button>
            </div>

            <div className="stats-grid">
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

            <div className="dashboard-grid">
                <motion.div variants={item} className="glass-card table-section">
                    <div className="section-header">
                        <h3>Recent Installments</h3>
                        <button className="text-btn">View All <ChevronRight size={16} /></button>
                    </div>
                    <div className="custom-table">
                        <div className="table-header">
                            <span>Customer</span>
                            <span>Amount</span>
                            <span>Date</span>
                            <span>Status</span>
                        </div>
                        {/* Mock data until real recent transactions implemented */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="table-row">
                                <div className="user-cell">
                                    <div className="avatar-sm">K</div>
                                    <span>Muhammad Khan</span>
                                </div>
                                <span className="amount-cell">Rs. 8,500</span>
                                <span className="date-cell">Oct 12, 2026</span>
                                <span className="status-badge paid">Approved</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={item} className="glass-card summary-section">
                    <h3>Collection Performance</h3>
                    <div className="chart-placeholder">
                        <div className="bar-grid">
                            {[60, 80, 45, 90, 70, 85].map((h, i) => (
                                <div key={i} className="bar-wrapper">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="chart-bar"
                                    />
                                    <span>Day {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .page-header p {
          color: var(--text-muted);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .stat-card {
          padding: 24px;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .stat-icon.pink { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
        .stat-icon.orange { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .stat-icon.red { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .trend-arrow {
          color: var(--text-muted);
          opacity: 0.5;
        }
        .stat-body h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .stat-title {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .stat-subtitle {
          font-size: 12px;
          color: var(--success);
          margin-top: 4px;
        }
        .stat-icon.red ~ .stat-body .stat-subtitle {
          color: var(--danger);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .table-section, .summary-section {
          padding: 24px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .text-btn {
          background: none;
          border: none;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
        }
        .custom-table {
          display: flex;
          flex-direction: column;
        }
        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: 12px 16px;
          color: var(--text-muted);
          font-size: 13px;
          border-bottom: 1px solid var(--border-color);
        }
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: 16px;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          transition: background 0.3s;
        }
        .table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar-sm {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          width: fit-content;
        }
        .status-badge.paid {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
        }
        .chart-placeholder {
          height: 200px;
          margin-top: 32px;
          display: flex;
          align-items: flex-end;
        }
        .bar-grid {
          display: flex;
          justify-content: space-between;
          width: 100%;
          height: 100%;
          align-items: flex-end;
          gap: 12px;
        }
        .bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .chart-bar {
          width: 100%;
          background: linear-gradient(to top, var(--primary), var(--secondary));
          border-radius: 6px 6px 0 0;
          opacity: 0.8;
        }
        .bar-wrapper span {
          font-size: 10px;
          color: var(--text-muted);
        }
        .loading-screen {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: var(--text-muted);
        }
      `}} />
        </motion.div>
    );
};

export default Dashboard;
