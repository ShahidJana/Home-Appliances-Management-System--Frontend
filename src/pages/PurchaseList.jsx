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
  Layers,
  X,
  TrendingUp,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Copy,
  LayoutGrid,
  Tablet,
  Smartphone,
  Cpu,
  Hash,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePurchaseController } from '../hooks/usePurchaseController';
import { useVendorController } from '../hooks/useVendorController';
import { AuthModel } from '../services/AuthModel';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AddPurchase from './AddPurchase';

const PurchaseList = () => {
  const navigate = useNavigate();
  const {
    items,
    loading,
    fetchPurchases,
    report,
    fetchReport,
    addProduct,
    bulkAddProducts,
    updateProduct,
    deleteProduct
  } = usePurchaseController();

  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get('view') || 'stock';

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const currentUser = AuthModel.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    fetchPurchases();
    if (isAdmin) {
      fetchReport();
    }
  }, [fetchPurchases, fetchReport, isAdmin]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteProduct(id);
        toast.success('Item deleted successfully');
        fetchPurchases();
        fetchReport();
      } catch (err) {
        toast.error(err.message || 'Failed to delete item');
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      item.productName?.toLowerCase().includes(searchLower) ||
      item.model?.toLowerCase().includes(searchLower) ||
      item.product_id?.toLowerCase().includes(searchLower) ||
      item.imei1?.toLowerCase().includes(searchLower) ||
      item.serialNumber?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8"
    >
      {viewMode === 'add' ? (
        <AddPurchase />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
            </div>
            <div className="flex gap-4">
              <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors hidden md:block">Import CSV</button>
              {isAdmin && (
                <button
                  className="premium-btn"
                  onClick={() => setSearchParams({ view: 'add' })}
                >
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
                  placeholder="Search by name, model, PID, IMEI or Serial..."
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">PID / IMEI</th>
                    <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Vendor</th>
                    {isAdmin && <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Purchase Price</th>}
                    <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, i) => (
                    <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 md:p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--primary)] border border-white/10 shrink-0">
                            <Layers size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-white mb-0.5 flex items-center gap-2">
                              {item.productName}
                              {item.productType === 'Mobile' ? <Smartphone size={12} className="text-slate-500" /> : <Tablet size={12} className="text-slate-500" />}
                            </div>
                            <div className="text-xs text-slate-400">{item.model} • {item.brand} {item.category ? `• ${item.category}` : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="font-medium text-[var(--primary)] text-sm mb-0.5">{item.product_id}</div>
                        <div className="text-xs text-slate-400 font-mono tracking-wide">
                          {item.productType === 'Mobile' ? (item.imei1 || 'No IMEI') : (item.serialNumber || 'No Serial')}
                        </div>
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
                      <td className="p-4 md:p-6 relative">
                        <button
                          className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
                          onClick={() => setActiveDropdown(activeDropdown === item._id ? null : item._id)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeDropdown === item._id && (
                          <div className="absolute right-6 top-14 z-20 w-48 glass-card border border-white/10 shadow-2xl p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              onClick={() => {
                                setEditingItem(item);
                                setIsModalOpen(true);
                                setActiveDropdown(null);
                              }}
                            >
                              <Edit2 size={14} /> Edit Product
                            </button>
                            {isAdmin && (
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                onClick={() => {
                                  handleDelete(item._id);
                                  setActiveDropdown(null);
                                }}
                              >
                                <Trash2 size={14} /> Delete Product
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="p-12 text-center text-slate-500">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No products found matching your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              fetchPurchases();
              fetchReport();
            }}
            editingItem={editingItem}
            isAdmin={isAdmin}
          />
        </>
      )}
    </motion.div>
  );
};

// --- Product Modal Component ---
const ProductModal = ({ isOpen, onClose, onSuccess, editingItem, isAdmin }) => {
  const { addProduct, bulkAddProducts, updateProduct, loading } = usePurchaseController();
  const { vendors, fetchVendors } = useVendorController();

  const [formData, setFormData] = useState({
    productType: 'Mobile',
    productName: '',
    model: '',
    brand: '',
    category: '',
    product_id: '',
    color: '',
    condition: 'New',
    conditionRating: 10,
    purchasePrice: '',
    sellingPrice: '',
    vendor: '',
    imei1: '',
    imei2: '',
    serialNumber: '',
    specification_description: ''
  });

  const [entryMode, setEntryMode] = useState('Single'); // Single or Bulk
  const [bulkInput, setBulkInput] = useState(''); // New-line separated IMEIs or Serials
  const [bulkItemsCount, setBulkItemsCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      if (editingItem) {
        setFormData({ ...editingItem, vendor: editingItem.vendor?._id || editingItem.vendor });
        setEntryMode('Single');
      } else {
        setFormData({
          productType: 'Mobile',
          productName: '',
          model: '',
          brand: '',
          category: '',
          product_id: '',
          color: '',
          condition: 'New',
          conditionRating: 10,
          purchasePrice: '',
          sellingPrice: '',
          vendor: '',
          imei1: '',
          imei2: '',
          serialNumber: '',
          specification_description: ''
        });
        setBulkInput('');
      }
    }
  }, [isOpen, editingItem, fetchVendors]);

  useEffect(() => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    setBulkItemsCount(lines.length);
  }, [bulkInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateProduct(editingItem._id, formData);
        toast.success('Product updated successfully');
      } else if (entryMode === 'Bulk') {
        const identifiers = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (identifiers.length === 0) throw new Error('Please enter at least one IMEI/Serial');

        const items = identifiers.map(id => ({
          [formData.productType === 'Mobile' ? 'imei1' : 'serialNumber']: id
        }));

        await bulkAddProducts({
          commonDetails: {
            ...formData,
            status: 'Available'
          },
          items
        });
        toast.success(`Succesfully added ${items.length} products`);
      } else {
        await addProduct(formData);
        toast.success('Product added successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              {editingItem ? <Edit2 className="text-[var(--primary)]" /> : <Plus className="text-[var(--primary)]" />}
              {editingItem ? 'Edit Purchase' : 'Add New Purchase'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {editingItem ? 'Update product details and specifications' : 'Add single or multiple Items to your stock'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Action Bar (Only for New Items) */}
        {!editingItem && (
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex bg-black/20 p-1 rounded-xl gap-1">
              {['Single', 'Bulk'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEntryMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${entryMode === mode
                    ? 'bg-[var(--primary)] text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {mode === 'Single' ? <Smartphone size={14} /> : <LayoutGrid size={14} />}
                  {mode} Entry
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {['Mobile', 'Appliance'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, productType: type })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${formData.productType === type
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
                    : 'text-slate-500 border-white/5 hover:border-white/10'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Top Bar - Product Type Selection */}
          {!editingItem && (
            <div className="px-10 py-6 bg-white/[0.02] border-b border-white/5 flex items-center gap-10">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Product Type:</span>
                <div className="flex gap-4">
                  {['Mobile', 'Appliance'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, productType: type })}
                      className={`px-8 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all border ${formData.productType === type
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        : 'text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-400'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-10 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">

              {/* Column 1: Core Information */}
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Product ID</label>
                  <input
                    required
                    className="premium-input w-full bg-[#1e293b]/50"
                    placeholder="ITEM-001"
                    value={formData.product_id}
                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Product Name</label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                      <input
                        required
                        className="premium-input w-full pl-11 bg-[#1e293b]/50"
                        placeholder="e.g. iPhone 15 Pro Max"
                        value={formData.productName}
                        onChange={e => setFormData({ ...formData, productName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Brand</label>
                    <input
                      required
                      className="premium-input w-full bg-[#1e293b]/50"
                      placeholder="e.g. Apple"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Model</label>
                    <input
                      required
                      className="premium-input w-full bg-[#1e293b]/50"
                      placeholder="e.g. A3106"
                      value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Condition</label>
                    <select
                      className="premium-input w-full bg-[#1e293b]/50"
                      value={formData.condition}
                      onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Color</label>
                    <input
                      className="premium-input w-full bg-[#1e293b]/50"
                      placeholder="Titanium"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Logistics & Identification */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Vendor / Supplier</label>
                    <select
                      required
                      className="premium-input w-full bg-[#1e293b]/50"
                      value={formData.vendor}
                      onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(v => (
                        <option key={v._id} value={v._id}>{v.name} ({v.company})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Cost Price (Rs.)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px] opacity-40 uppercase tracking-tighter">PKR</span>
                      <input
                        required
                        type="number"
                        className="premium-input w-full pl-12 bg-[#1e293b]/50"
                        placeholder="0"
                        value={formData.purchasePrice}
                        onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {formData.productType === 'Mobile' ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-indigo-400 ml-1 flex items-center gap-2">
                          <CheckCircle2 size={16} strokeWidth={2} /> IMEI 1 (PRIMARY)
                        </label>
                        <input
                          required
                          className="premium-input w-full bg-[#1e293b]/50 text-white font-mono text-sm"
                          placeholder="35XXXXXXXXXXXXX"
                          value={formData.imei1}
                          onChange={e => setFormData({ ...formData, imei1: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-500 ml-1">IMEI 2 (OPTIONAL)</label>
                        <input
                          className="premium-input w-full bg-[#1e293b]/50 border-white/5 text-white font-mono text-sm"
                          placeholder="35XXXXXXXXXXXXX"
                          value={formData.imei2}
                          onChange={e => setFormData({ ...formData, imei2: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 col-span-2">
                      <label className="text-sm font-medium text-amber-400 ml-1 flex items-center gap-2">
                        <CheckCircle2 size={16} strokeWidth={2} /> SERIAL NUMBER
                      </label>
                      <input
                        required
                        className="premium-input w-full bg-[#1e293b]/50 text-white font-mono text-sm"
                        placeholder="SN-XXXXX-XXXXXX"
                        value={formData.serialNumber}
                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-indigo-400 ml-1">Sale Price (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-[10px] opacity-40 uppercase tracking-tighter">PKR</span>
                    <input
                      required
                      type="number"
                      className="premium-input w-full pl-12 bg-indigo-500/[0.03] border-indigo-500/20"
                      placeholder="0"
                      value={formData.sellingPrice || ''}
                      onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="pt-10 border-t border-white/5">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-slate-300 ml-1">Specifications & Description</label>
                <textarea
                  rows={4}
                  className="premium-input w-full resize-none p-6 bg-[#1e293b]/50 text-sm leading-relaxed"
                  placeholder="Enter technical specifications, RAM, Storage, etc..."
                  value={formData.specification_description}
                  onChange={e => setFormData({ ...formData, specification_description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-5">
              <button
                type="button"
                onClick={onClose}
                className="px-10 py-4 rounded-2xl border border-white/5 text-slate-400 font-bold uppercase text-xs tracking-widest hover:bg-white/5 hover:text-white transition-all shadow-xl"
              >
                DISCARD CHANGES
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 rounded-2xl bg-indigo-500 text-white font-black uppercase text-xs tracking-[0.15em] hover:bg-indigo-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                )}
                {editingItem ? 'SAVE CHANGES' : 'FINALIZE PRODUCT'}
              </button>
            </div>
          </div>
        </form>

      </motion.div>
    </div>
  );
};

export default PurchaseList;
