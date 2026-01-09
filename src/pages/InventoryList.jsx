import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Package,
  Database,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  Layers
} from 'lucide-react';
import { useInventoryController } from '../hooks/useInventoryController';
import { AuthModel } from '../services/AuthModel';

const InventoryList = () => {
  const { items, loading, fetchInventory, report, fetchReport } = useInventoryController();
  const [filterStatus, setFilterStatus] = useState('All');

  const currentUser = AuthModel.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    fetchInventory();
    if (isAdmin) {
      fetchReport();
    }
  }, [fetchInventory, fetchReport, isAdmin]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inventory-page"
    >
      <div className="page-header">
        <div>
          <h1>Inventory Assets</h1>
          <p>Real-time stock management and valuation</p>
        </div>
        <div className="header-btns">
          <button className="glass-btn">Import CSV</button>
          {isAdmin && (
            <button className="premium-btn with-icon">
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="inventory-summary">
          <div className="summary-item">
            <Package className="text-primary" />
            <div className="summary-details">
              <span className="label">Total Stock</span>
              <span className="value">{report?.totalItem || 0} Units</span>
            </div>
          </div>
          <div className="summary-item">
            <ShieldCheck className="text-success" />
            <div className="summary-details">
              <span className="label">Available</span>
              <span className="value">{report?.availableItem || 0} Units</span>
            </div>
          </div>
          <div className="summary-item">
            <AlertTriangle className="text-warning" />
            <div className="summary-details">
              <span className="label">Low Stock</span>
              <span className="value">4 Models</span>
            </div>
          </div>
          <div className="summary-item">
            <Database className="text-secondary" />
            <div className="summary-details">
              <span className="label">Total Valuation</span>
              <span className="value">Rs. {report?.totalInvestment?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card inventory-table-container">
        <div className="table-controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Filter by product name, model, IMEI..." />
          </div>
          <div className="tab-filters">
            {['All', 'Available', 'Sold', 'Defective'].map(status => (
              <button
                key={status}
                className={`tab-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>SKU / IMEI</th>
              <th>Vendor</th>
              {isAdmin && <th>Purchase Price</th>}
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item._id}>
                <td>
                  <div className="product-cell">
                    <div className="product-icon"><Layers size={16} /></div>
                    <div>
                      <div className="product-name">{item.productName}</div>
                      <div className="product-model">{item.model} • {item.company}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="sku-text">{item.sku}</div>
                  <div className="imei-text">{item.imei1 || 'N/A'}</div>
                </td>
                <td>{item.vendor?.name}</td>
                {isAdmin && <td><span className="price-tag">Rs. {item.purchasePrice?.toLocaleString()}</span></td>}
                <td>
                  <span className={`status-tag ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="action-dots"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .inventory-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .header-btns {
          display: flex;
          gap: 16px;
        }
        .glass-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 500;
        }
        .inventory-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .summary-item {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .summary-details {
          display: flex;
          flex-direction: column;
        }
        .summary-details .label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-details .value {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }
        
        .inventory-table-container {
          padding: 0;
          overflow: hidden;
        }
        .table-controls {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }
        .tab-filters {
          display: flex;
          background: rgba(0,0,0,0.2);
          padding: 4px;
          border-radius: 10px;
          gap: 4px;
        }
        .tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .tab-btn.active {
          background: var(--primary);
          color: white;
        }
        
        .inventory-table {
          width: 100%;
          border-collapse: collapse;
        }
        .inventory-table th {
          text-align: left;
          padding: 16px 24px;
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          background: rgba(255,255,255,0.02);
        }
        .inventory-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
        }
        .product-cell {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .product-icon {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .product-name { font-weight: 600; margin-bottom: 2px; }
        .product-model { font-size: 12px; color: var(--text-muted); }
        .sku-text { font-weight: 500; color: var(--primary); font-size: 13px; }
        .imei-text { font-size: 12px; color: var(--text-muted); font-family: monospace; }
        .price-tag { font-weight: 600; color: #fff; }
        
        .status-tag {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-tag.available { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .status-tag.sold { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
        .status-tag.defective { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        
        .action-dots {
          background: none;
          border: none;
          color: var(--text-muted);
        }
      `}} />
    </motion.div>
  );
};

export default InventoryList;
