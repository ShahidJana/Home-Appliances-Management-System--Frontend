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
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Import CSV</button>
          {isAdmin && (
            <button className="premium-btn">
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex items-center gap-5">
            <Package className="text-[var(--primary)]" size={32} />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Stock</span>
              <span className="text-xl font-bold text-white">{report?.totalItem || 0} Units</span>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-5">
            <ShieldCheck className="text-emerald-400" size={32} />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Available</span>
              <span className="text-xl font-bold text-white">{report?.availableItem || 0} Units</span>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-5">
            <AlertTriangle className="text-amber-400" size={32} />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Low Stock</span>
              <span className="text-xl font-bold text-white">4 Models</span>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-5">
            <Database className="text-pink-500" size={32} />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Valuation</span>
              <span className="text-xl font-bold text-white">Rs. {report?.totalInvestment?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 w-full md:w-80">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Filter by product name, model, IMEI..."
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500"
            />
          </div>
          <div className="flex bg-black/20 p-1 rounded-xl gap-1">
            {['All', 'Available', 'Sold', 'Defective'].map(status => (
              <button
                key={status}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filterStatus === status
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Product Details</th>
                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">SKU / IMEI</th>
                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Vendor</th>
                {isAdmin && <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Purchase Price</th>}
                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 md:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--primary)] border border-white/10 shrink-0">
                        <Layers size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-0.5">{item.productName}</div>
                        <div className="text-xs text-slate-400">{item.model} • {item.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 md:p-6">
                    <div className="font-medium text-[var(--primary)] text-sm mb-0.5">{item.sku}</div>
                    <div className="text-xs text-slate-400 font-mono tracking-wide">{item.imei1 || 'N/A'}</div>
                  </td>
                  <td className="p-4 md:p-6 text-sm text-slate-300">{item.vendor?.name}</td>
                  {isAdmin && <td className="p-4 md:p-6"><span className="font-semibold text-white">Rs. {item.purchasePrice?.toLocaleString()}</span></td>}
                  <td className="p-4 md:p-6">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${item.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      item.status === 'Sold' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 md:p-6">
                    <button className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryList;
