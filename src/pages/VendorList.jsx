import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Truck,
    Plus,
    Search,
    Phone,
    Mail,
    MapPin,
    ExternalLink,
    MoreVertical,
    Briefcase
} from 'lucide-react';
import { useVendorController } from '../hooks/useVendorController';

const VendorList = () => {
    const { vendors, loading, fetchVendors } = useVendorController();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="vendors-page"
        >
            <div className="page-header">
                <div>
                    <h1>Vendor Network</h1>
                    <p>Manage product suppliers and procurement channels</p>
                </div>
                <button className="premium-btn with-icon">
                    <Plus size={18} />
                    <span>Add Vendor</span>
                </button>
            </div>

            <div className="glass-card filter-bar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search vendors by name, company or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="vendor-grid">
                {vendors.map((v, i) => (
                    <motion.div
                        key={v._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card vendor-card"
                    >
                        <div className="card-header">
                            <div className="vendor-logo">
                                <Truck size={24} />
                            </div>
                            <div className="header-text">
                                <h3>{v.name}</h3>
                                <span className="vendor-type">{v.description || 'General Supplier'}</span>
                            </div>
                            <button className="icon-btn"><MoreVertical size={18} /></button>
                        </div>

                        <div className="card-body">
                            <div className="contact-info">
                                <div className="info-row">
                                    <Phone size={14} />
                                    <span>{v.phone || '+92 000 0000000'}</span>
                                </div>
                                <div className="info-row">
                                    <Mail size={14} />
                                    <span>{v.email || 'contact@vendor.com'}</span>
                                </div>
                                <div className="info-row">
                                    <MapPin size={14} />
                                    <span>{v.address || 'Industrial Zone, Karachi'}</span>
                                </div>
                            </div>

                            <div className="vendor-meta">
                                <div className="meta-item">
                                    <span className="label">Active Ledger</span>
                                    <span className="value text-primary">Rs. 1.2M</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Total Products</span>
                                    <span className="value">42</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button className="outline-btn full-width">
                                View Transactions <ExternalLink size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .vendors-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .vendor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }
        .vendor-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .vendor-logo {
          width: 48px;
          height: 48px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .header-text { flex: 1; }
        .header-text h3 { font-size: 18px; margin-bottom: 2px; }
        .vendor-type { font-size: 12px; color: var(--text-muted); }
        
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-muted);
        }
        .info-row span { color: var(--text-main); }
        
        .vendor-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }
        .meta-item { display: flex; flex-direction: column; gap: 4px; }
        .meta-item .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
        .meta-item .value { font-weight: 700; font-size: 15px; }
        
        .outline-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: white;
          padding: 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.3s;
        }
        .outline-btn:hover { background: rgba(255, 255, 255, 0.05); }
        .full-width { width: 100%; }
      `}} />
        </motion.div>
    );
};

export default VendorList;
