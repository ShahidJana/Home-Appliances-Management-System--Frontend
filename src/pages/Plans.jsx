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
            className="plans-page"
        >
            <div className="page-header">
                <div>
                    <h1>Sales & Installment Plans</h1>
                    <p>Monitor active contracts and recovery schedules</p>
                </div>
                <button className="premium-btn with-icon">
                    <Plus size={18} />
                    <span>New Sale Plan</span>
                </button>
            </div>

            <div className="glass-card table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search by Plan ID, Customer or Product..." />
                </div>
                <div className="filter-actions">
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

            <div className="plans-list">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card plan-item"
                    >
                        <div className="plan-main">
                            <div className="plan-id">#{plan._id.slice(-6).toUpperCase()}</div>
                            <div className="plan-details">
                                <div className="detail-group">
                                    <User size={14} className="text-muted" />
                                    <span>{plan.customer?.fullName || 'Walk-in Customer'}</span>
                                </div>
                                <div className="detail-group">
                                    <Package size={14} className="text-muted" />
                                    <span>{plan.productName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="plan-finance">
                            <div className="finance-item">
                                <span className="label">Total Amount</span>
                                <span className="value">Rs. {plan.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="finance-item">
                                <span className="label">Remaining</span>
                                <span className="value text-secondary">Rs. {plan.remainingAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="plan-status-section">
                            <div className={`status-badge ${plan.status.toLowerCase()}`}>
                                {plan.status}
                            </div>
                            <div className="progress-mini">
                                <div className="progress-bar-fill" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        <button className="icon-btn-rounded">
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .plans-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .table-controls {
          display: flex;
          justify-content: space-between;
          padding: 12px 24px;
          align-items: center;
        }
        .filter-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-left: 8px;
        }
        .filter-chip.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .plans-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .plan-item {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 40px;
          padding: 24px;
          align-items: center;
          gap: 24px;
          transition: transform 0.3s;
        }
        .plan-item:hover { transform: translateX(5px); }
        
        .plan-id { font-family: monospace; font-weight: 700; color: var(--primary); font-size: 14px; margin-bottom: 8px; }
        .detail-group { display: flex; align-items: center; gap: 8px; font-size: 14px; margin-bottom: 4px; }
        
        .finance-item { display: flex; flex-direction: column; gap: 4px; }
        .finance-item .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
        .finance-item .value { font-weight: 700; font-size: 16px; }

        .status-badge {
          width: fit-content;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .status-badge.active { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .status-badge.overdue { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        
        .progress-mini {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(to right, var(--primary), var(--secondary));
        }

        .icon-btn-rounded {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .icon-btn-rounded:hover { background: var(--primary); }
      `}} />
        </motion.div>
    );
};

export default Plans;
