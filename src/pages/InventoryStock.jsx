import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Package,
    ShieldCheck,
    AlertTriangle,
    Layers,
    Smartphone,
    Tablet,
    TrendingUp,
    Filter,
    ChevronRight,
    ChevronDown,
    Cpu,
    Hash,
    Eye,
    X,
    ArrowRight
} from 'lucide-react';
import { usePurchaseController } from '../hooks/usePurchaseController';
import { AuthModel } from '../services/AuthModel';

const InventoryStock = () => {
    const {
        items,
        loading,
        fetchPurchases,
        report,
        fetchReport
    } = usePurchaseController();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [selectedGroup, setSelectedGroup] = useState(null);

    const currentUser = AuthModel.getCurrentUser();
    const isAdmin = currentUser?.role === 'Admin';

    useEffect(() => {
        // Fetch ALL items to allow the modal to show sales history
        fetchPurchases({});
        if (isAdmin) {
            fetchReport();
        }
    }, [fetchPurchases, fetchReport, isAdmin]);

    const filteredItems = items.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            item.productName?.toLowerCase().includes(searchLower) ||
            item.model?.toLowerCase().includes(searchLower) ||
            item.product_id?.toLowerCase().includes(searchLower) ||
            item.imei1?.toLowerCase().includes(searchLower) ||
            item.serialNumber?.toLowerCase().includes(searchLower);

        const matchesType = filterType === 'All' || item.productType === filterType;

        return matchesSearch && matchesType;
    });

    const groupedItemsMap = filteredItems.reduce((acc, item) => {
        const key = `${item.productName}-${item.model}-${item.condition}`;
        if (!acc[key]) {
            acc[key] = {
                ...item,
                groupKey: key,
                count: 0,
                availableCount: 0,
                totalCost: 0,
                items: []
            };
        }
        acc[key].items.push(item);

        if (item.status === 'Available') {
            acc[key].availableCount++;
            acc[key].totalCost += item.purchasePrice || 0;
        }

        acc[key].count = acc[key].items.length;
        return acc;
    }, {});

    const groupedItems = Object.values(groupedItemsMap);
    const displayGroups = groupedItems.filter(g => g.availableCount > 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Package size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Available</span>
                        <span className="text-xl font-bold text-white">{report?.availableItem || 0} Units</span>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Stock Value</span>
                        <span className="text-xl font-bold text-white">Rs. {report?.currentInventoryValue?.toLocaleString() || 0}</span>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Type Spilt</span>
                        <div className="flex gap-3 text-xs font-bold text-white mt-1">
                            <span className="text-indigo-400">M: {items.filter(i => i.productType === 'Mobile').length}</span>
                            <span className="text-amber-400">A: {items.filter(i => i.productType === 'Appliance').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 w-full md:w-80">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, model, PID, IMEI or Serial no..."
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-black/20 p-1 rounded-xl gap-1">
                        {['All', 'Mobile', 'Appliance'].map(type => (
                            <button
                                key={type}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filterType === type
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => setFilterType(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Product</th>
                                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider text-center">In-Stock</th>
                                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider">Condition</th>
                                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider text-right">Avg. Cost</th>
                                <th className="text-left p-4 md:p-6 text-xs text-slate-400 font-semibold bg-white/5 uppercase tracking-wider text-right">Total Valuation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayGroups.map((group) => {
                                return (
                                    <tr
                                        key={group.groupKey}
                                        onClick={() => setSelectedGroup(group)}
                                        className="border-b border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group/row"
                                    >
                                        <td className="p-4 md:p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0 group-hover/row:scale-110 transition-transform">
                                                    {group.productType === 'Mobile' ? <Smartphone size={18} /> : <Tablet size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white mb-0.5">{group.productName}</div>
                                                    <div className="text-xs text-slate-400">{group.model} • {group.brand}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-center">
                                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-black text-xs border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                                {group.availableCount} PCS
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-6">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${group.condition === 'New' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                                }`}>
                                                {group.condition}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-6 text-right">
                                            <span className="font-semibold text-white font-mono text-sm">Rs. {(group.totalCost / group.availableCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </td>
                                        <td className="p-4 md:p-6 text-right">
                                            <span className="font-black text-emerald-400 font-mono">Rs. {group.totalCost?.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && displayGroups.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold uppercase tracking-widest text-xs">No available items in stock</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedGroup && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedGroup(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-[#0f172a] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                        {selectedGroup.productType === 'Mobile' ? <Smartphone size={28} /> : <Tablet size={28} />}
                                    </div>
                                    <div>
                                        <div className="text-xs text-indigo-400 font-black uppercase tracking-[0.2em] mb-1">Group Inventory Details</div>
                                        <h2 className="text-2xl font-black text-white">{selectedGroup.productName}</h2>
                                        <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                            <span>{selectedGroup.model}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                                            <span>{selectedGroup.brand}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedGroup(null)}
                                    className="p-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content - The Table */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest w-16">#</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Information</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Details</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Details</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedGroup.items.map((item, idx) => (
                                                <tr key={item._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors group/item">
                                                    <td className="px-6 py-5">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-400 border border-indigo-500/20 group-hover/item:scale-110 transition-transform">
                                                            {idx + 1}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Product ID</span>
                                                                <span className="text-xs font-mono text-indigo-300 font-bold">{item.product_id || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {item.imei1 && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Smartphone size={10} className="text-slate-500" />
                                                                        <span className="text-[10px] text-slate-300 font-mono">{item.imei1}</span>
                                                                    </div>

                                                                )}

                                                                {item.serialNumber && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Hash size={10} className="text-slate-500" />
                                                                        <span className="text-[10px] text-slate-300 font-mono">{item.serialNumber}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Purchase Price</span>
                                                                <span className="text-xs font-black text-white font-mono">Rs. {item.purchasePrice?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Purchase Date</span>
                                                                <span className="text-xs text-slate-300 font-medium">
                                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* <td className="px-6 py-5 text-right">
                                                        <div className="flex flex-col items-end gap-2.5">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Cost Price:</span>
                                                                <span className="text-sm font-black text-white font-mono">Rs. {item.purchasePrice?.toLocaleString()}</span>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${item.status === 'Sold' ? 'text-blue-400' : 'text-slate-500'}`}>
                                                                    {item.status === 'Sold' ? 'Sold Price:' : 'Target Sale:'}
                                                                </span>
                                                                <span className={`text-sm font-black font-mono ${item.status === 'Sold' ? 'text-blue-400' : 'text-emerald-400'}`}>
                                                                    Rs. {item.sellingPrice?.toLocaleString() || '0'}
                                                                </span>
                                                            </div>

                                                            {item.status === 'Sold' && (
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.1em]">Sale Date:</span>
                                                                    <span className="text-xs font-black text-blue-300 font-mono">
                                                                        {item.soldDate ? new Date(item.soldDate).toLocaleDateString('en-GB') : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td> */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Sale Price</span>
                                                                <span className="text-xs font-black text-white font-mono">Rs. {item.sellingPrice?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Sale Date</span>
                                                                <span className="text-xs text-slate-300 font-medium">
                                                                    {item.soldDate ? new Date(item.soldDate).toLocaleDateString('en-GB') : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`w-fit px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${item.status === 'Available'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : item.status === 'Sold'
                                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                            <span className={`w-fit px-2 py-1 rounded-md text-[9px] font-bold uppercase border ${item.condition === 'New'
                                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                }`}>
                                                                {item.condition}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Valuation:</span>
                                        <span className="text-sm font-black text-white font-mono">Rs. {selectedGroup.totalCost?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedGroup(null)}
                                    className="px-8 py-3 rounded-xl bg-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/10"
                                >
                                    Close Window
                                </button>
                            </div>
                        </motion.div>
                    </div >
                )}
            </AnimatePresence >
        </motion.div >
    );
};

export default InventoryStock;
