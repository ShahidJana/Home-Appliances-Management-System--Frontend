import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    UserCheck,
    Phone,
    MapPin,
    ExternalLink,
    ChevronDown,
    Filter
} from 'lucide-react';
import { useCustomerController } from '../hooks/useCustomerController';

const CustomerList = () => {
    const { customers, loading, fetchCustomers } = useCustomerController();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="customers-page"
        >
            <div className="page-header">
                <div>
                    <h1>Client Directory</h1>
                    <p>Manage and monitor customer records</p>
                </div>
                <button className="premium-btn with-icon">
                    <Plus size={18} />
                    <span>New Customer</span>
                </button>
            </div>

            <div className="glass-card filter-bar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, CNIC or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <button className="filter-btn"><Filter size={18} /> Filter</button>
                    <button className="filter-btn">Export <ChevronDown size={18} /></button>
                </div>
            </div>

            <div className="customer-grid">
                <AnimatePresence>
                    {customers.map((c, i) => (
                        <motion.div
                            key={c._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card customer-card"
                        >
                            <div className="card-header">
                                <div className="avatar-lg">{c.fullName[0]}</div>
                                <div className="header-info">
                                    <h3>{c.fullName}</h3>
                                    <span className={`status-pill ${c.status === 'Active' ? 'active' : 'blocked'}`}>
                                        {c.status}
                                    </span>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="info-item">
                                    <UserCheck size={16} />
                                    <span>{c.cnic}</span>
                                </div>
                                <div className="info-item">
                                    <Phone size={16} />
                                    <span>{c.primaryPhone}</span>
                                </div>
                                <div className="info-item">
                                    <MapPin size={16} />
                                    <span>{c.sectorCity}, {c.zilla}</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="plan-count">
                                    <strong>2</strong> Active Plans
                                </div>
                                <button className="view-btn">
                                    View Profile <ExternalLink size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .customers-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .with-icon {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-bar {
          display: flex;
          justify-content: space-between;
          padding: 12px 24px;
          align-items: center;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .search-box input {
          background: none;
          border: none;
          color: white;
          font-size: 15px;
          width: 100%;
          outline: none;
        }
        .search-icon { color: var(--text-muted); }
        
        .filter-actions {
          display: flex;
          gap: 12px;
        }
        .filter-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .customer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .customer-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card-header {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .avatar-lg {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
        }
        .header-info h3 {
          font-size: 18px;
          margin-bottom: 4px;
        }
        .status-pill {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .status-pill.blocked { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 14px;
        }
        .info-item span { color: var(--text-main); }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }
        .plan-count { font-size: 13px; color: var(--text-muted); }
        .plan-count strong { color: var(--primary); }
        
        .view-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}} />
        </motion.div>
    );
};

export default CustomerList;
