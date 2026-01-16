import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Filter,
    ChevronDown,
    X,
    Eye,
    Edit,
    Trash2,
    FileText,
    Calendar,
    User,
    Phone,
    Package,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign
} from 'lucide-react';

// Dummy Claims Data
const dummyClaimsData = [
    {
        id: 'CLM-001',
        customerName: 'Ahmed Ali',
        customerPhone: '0300-1234567',
        productName: 'Samsung Refrigerator',
        claimType: 'Warranty',
        issueDescription: 'Cooling system not working properly',
        claimDate: '2026-01-10',
        status: 'Pending',
        claimAmount: 15000,
        assignedTo: 'Tech Team A'
    },
    {
        id: 'CLM-002',
        customerName: 'Fatima Khan',
        customerPhone: '0301-9876543',
        productName: 'LG Washing Machine',
        claimType: 'Repair',
        issueDescription: 'Drum not spinning, making loud noise',
        claimDate: '2026-01-12',
        status: 'In Progress',
        claimAmount: 8500,
        assignedTo: 'Tech Team B'
    },
    {
        id: 'CLM-003',
        customerName: 'Hassan Raza',
        customerPhone: '0302-5551234',
        productName: 'Haier LED TV 43"',
        claimType: 'Warranty',
        issueDescription: 'Screen flickering and no sound output',
        claimDate: '2026-01-08',
        status: 'Resolved',
        claimAmount: 12000,
        assignedTo: 'Tech Team A'
    },
    {
        id: 'CLM-004',
        customerName: 'Ayesha Malik',
        customerPhone: '0303-7778888',
        productName: 'Dawlance Microwave',
        claimType: 'Replacement',
        issueDescription: 'Heating element completely failed',
        claimDate: '2026-01-14',
        status: 'Pending',
        claimAmount: 18000,
        assignedTo: 'Tech Team C'
    },
    {
        id: 'CLM-005',
        customerName: 'Bilal Ahmed',
        customerPhone: '0304-1112222',
        productName: 'Orient Air Conditioner',
        claimType: 'Warranty',
        issueDescription: 'Not cooling, compressor issue',
        claimDate: '2026-01-11',
        status: 'In Progress',
        claimAmount: 25000,
        assignedTo: 'Tech Team B'
    },
    {
        id: 'CLM-006',
        customerName: 'Zainab Hussain',
        customerPhone: '0305-9998877',
        productName: 'PEL Deep Freezer',
        claimType: 'Repair',
        issueDescription: 'Temperature control not functioning',
        claimDate: '2026-01-09',
        status: 'Resolved',
        claimAmount: 9500,
        assignedTo: 'Tech Team A'
    },
    {
        id: 'CLM-007',
        customerName: 'Usman Tariq',
        customerPhone: '0306-4445566',
        productName: 'Gree Split AC 1.5 Ton',
        claimType: 'Warranty',
        issueDescription: 'Remote not working, gas leakage',
        claimDate: '2026-01-13',
        status: 'Rejected',
        claimAmount: 0,
        assignedTo: 'Tech Team C'
    },
    {
        id: 'CLM-008',
        customerName: 'Sana Iqbal',
        customerPhone: '0307-6667788',
        productName: 'Kenwood Blender',
        claimType: 'Replacement',
        issueDescription: 'Motor burned out, jar cracked',
        claimDate: '2026-01-15',
        status: 'Pending',
        claimAmount: 6500,
        assignedTo: 'Tech Team A'
    }
];

const Claims = () => {
    const [claims, setClaims] = useState(dummyClaimsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [searchBy, setSearchBy] = useState('all');
    const [statusFilter, setStatusFilter] = useState('');
    const [claimTypeFilter, setClaimTypeFilter] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [newClaim, setNewClaim] = useState({
        customerName: '',
        customerCNIC: '',
        customerPhone: '',
        productName: '',
        claimType: 'Warranty',
        claimAmount: '',
        issueDescription: '',
        assignedTo: '',
        status: 'Pending',
        id: null
    });

    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setNewClaim(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (claim) => {
        setNewClaim({
            customerName: claim.customerName,
            customerCNIC: claim.customerCNIC || '',
            customerPhone: claim.customerPhone,
            productName: claim.productName,
            claimType: claim.claimType,
            claimAmount: claim.claimAmount,
            issueDescription: claim.issueDescription,
            assignedTo: claim.assignedTo,
            status: claim.status,
            id: claim.id
        });
        setIsEditing(true);
        setIsAddModalOpen(true);
    };

    const handleSubmitClaim = (e) => {
        e.preventDefault();
        if (isEditing) {
            setClaims(claims.map(c => c.id === newClaim.id ? { ...newClaim, claimDate: c.claimDate } : c));
        } else {
            const claim = {
                id: `CLM-${String(claims.length + 1).padStart(3, '0')}`,
                ...newClaim,
                claimDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
                claimAmount: Number(newClaim.claimAmount) || 0
            };
            setClaims([claim, ...claims]);
        }
        setIsAddModalOpen(false);
        setIsEditing(false);
        setNewClaim({
            customerName: '',
            customerCNIC: '',
            customerPhone: '',
            productName: '',
            claimType: 'Warranty',
            claimAmount: '',
            issueDescription: '',
            assignedTo: '',
            status: 'Pending',
            id: null
        });
    };

    // Filter claims based on search and filters
    const filteredClaims = claims.filter(claim => {
        const lowerSearch = searchTerm.toLowerCase();

        // Search filter
        const matchesSearch = !searchTerm || (() => {
            if (searchBy === 'id') return claim.id.toLowerCase().includes(lowerSearch);
            if (searchBy === 'customerName') return claim.customerName.toLowerCase().includes(lowerSearch);
            if (searchBy === 'customerPhone') return claim.customerPhone.includes(searchTerm);
            if (searchBy === 'productName') return claim.productName.toLowerCase().includes(lowerSearch);
            return (
                claim.id.toLowerCase().includes(lowerSearch) ||
                claim.customerName.toLowerCase().includes(lowerSearch) ||
                claim.customerPhone.includes(searchTerm) ||
                claim.productName.toLowerCase().includes(lowerSearch)
            );
        })();

        // Status filter
        const matchesStatus = !statusFilter || claim.status === statusFilter;

        // Claim type filter
        const matchesClaimType = !claimTypeFilter || claim.claimType === claimTypeFilter;

        return matchesSearch && matchesStatus && matchesClaimType;
    });

    const handleView = (claim) => {
        setSelectedClaim(claim);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedClaim(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this claim?')) {
            setClaims(claims.filter(c => c.id !== id));
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSearchBy('all');
        setStatusFilter('');
        setClaimTypeFilter('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'In Progress':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Resolved':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Rejected':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <Clock size={14} />;
            case 'In Progress':
                return <AlertCircle size={14} />;
            case 'Resolved':
                return <CheckCircle size={14} />;
            case 'Rejected':
                return <X size={14} />;
            default:
                return <FileText size={14} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Claims Management</h1>
                    <p className="text-slate-400">Track and manage customer warranty & repair claims</p>
                </div>
                <button className="premium-btn with-icon" onClick={() => { setIsEditing(false); setIsAddModalOpen(true); }}>
                    <Plus size={18} />
                    <span>New Claim</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="glass-card p-4 flex flex-col lg:flex-row items-center gap-4 relative z-30">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 w-full focus-within:bg-white/10 focus-within:border-[var(--primary)] transition-colors">
                    <Search size={20} className="text-slate-400" />
                    <input
                        className="bg-transparent border-none outline-none text-white w-full placeholder-slate-400"
                        type="text"
                        placeholder={
                            searchBy === 'all' ? "Search claims..." :
                                searchBy === 'id' ? "Search by Claim ID..." :
                                    searchBy === 'customerName' ? "Search by Customer Name..." :
                                        searchBy === 'customerPhone' ? "Search by Phone..." : "Search by Product..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 relative z-20 shrink-0">
                    {/* Search By Filter */}
                    <div className="relative">
                        <button
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${showFilters ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} />
                            <span>{searchBy === 'all' ? 'Search By' : `By: ${searchBy === 'id' ? 'ID' : searchBy === 'customerName' ? 'Customer' : searchBy === 'customerPhone' ? 'Phone' : 'Product'}`}</span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                                >
                                    {[
                                        { id: 'all', label: 'All Fields' },
                                        { id: 'id', label: 'Claim ID' },
                                        { id: 'customerName', label: 'Customer Name' },
                                        { id: 'customerPhone', label: 'Phone Number' },
                                        { id: 'productName', label: 'Product Name' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${searchBy === opt.id ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-slate-300 hover:bg-white/5'}`}
                                            onClick={() => {
                                                setSearchBy(opt.id);
                                                setShowFilters(false);
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Status Filter */}
                    <select
                        className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors text-sm whitespace-nowrap outline-none focus:border-[var(--primary)]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    {/* Claim Type Filter */}
                    <select
                        className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors text-sm whitespace-nowrap outline-none focus:border-[var(--primary)]"
                        value={claimTypeFilter}
                        onChange={(e) => setClaimTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="Warranty">Warranty</option>
                        <option value="Repair">Repair</option>
                        <option value="Replacement">Replacement</option>
                    </select>

                    <button
                        className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors whitespace-nowrap"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Claims Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredClaims.map((claim, i) => (
                        <motion.div
                            key={claim.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-5 flex flex-col gap-4"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-bold text-white text-base">{claim.id}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded w-fit font-bold uppercase tracking-wider border flex items-center gap-1 ${getStatusColor(claim.status)}`}>
                                        {getStatusIcon(claim.status)}
                                        {claim.status}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(claim.claimDate).toLocaleDateString('en-GB')}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <User size={14} className="text-[var(--primary)] shrink-0" />
                                    <span className="truncate font-semibold">{claim.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <Phone size={14} className="text-[var(--primary)] shrink-0" />
                                    <span className="truncate">{claim.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <Package size={14} className="text-[var(--primary)] shrink-0" />
                                    <span className="truncate" title={claim.productName}>{claim.productName}</span>
                                </div>
                            </div>

                            {/* Claim Details */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Type:</span>
                                    <span className="text-white font-semibold px-2 py-1 bg-indigo-500/10 rounded border border-indigo-500/20">{claim.claimType}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Amount:</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <DollarSign size={12} />
                                        {claim.claimAmount.toLocaleString()} PKR
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 line-clamp-2" title={claim.issueDescription}>
                                    <strong>Issue:</strong> {claim.issueDescription}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                                <button className="action-btn-mini view flex-1" onClick={() => handleView(claim)} title="View Details">
                                    <Eye size={16} />
                                </button>
                                <button className="action-btn-mini edit flex-1" onClick={() => handleEdit(claim)} title="Edit">
                                    <Edit size={16} />
                                </button>
                                <button className="action-btn-mini delete flex-1" onClick={() => handleDelete(claim.id)} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* No Results */}
            {filteredClaims.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <FileText size={48} className="mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-bold text-white mb-2">No Claims Found</h3>
                    <p className="text-slate-400">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Add Claim Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                                <h2 className="text-lg font-bold text-white">{isEditing ? 'Update Claim' : 'Register New Claim'}</h2>
                                <button
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitClaim} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                        <User size={14} /> Customer Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium">Customer Name *</label>
                                            <input
                                                type="text"
                                                name="customerName"
                                                className="input-field"
                                                placeholder="Enter name"
                                                value={newClaim.customerName}
                                                onChange={handleAddInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium">Customer CNIC</label>
                                            <input
                                                type="text"
                                                name="customerCNIC"
                                                className="input-field"
                                                placeholder="XXXXX-XXXXXXX-X"
                                                value={newClaim.customerCNIC}
                                                onChange={handleAddInputChange}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium">Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="customerPhone"
                                                className="input-field"
                                                placeholder="03XX-XXXXXXX"
                                                value={newClaim.customerPhone}
                                                onChange={handleAddInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                        <Package size={14} /> Product Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium">Product Name *</label>
                                            <input
                                                type="text"
                                                name="productName"
                                                className="input-field"
                                                placeholder="e.g. Samsung AC"
                                                value={newClaim.productName}
                                                onChange={handleAddInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium">Claim Type *</label>
                                            <select
                                                name="claimType"
                                                className="input-field"
                                                value={newClaim.claimType}
                                                onChange={handleAddInputChange}
                                            >
                                                <option value="Warranty">Warranty</option>
                                                <option value="Repair">Repair</option>
                                                <option value="Replacement">Replacement</option>
                                            </select>
                                        </div>
                                        {isEditing && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs text-slate-400 font-medium">Status</label>
                                                <select
                                                    name="status"
                                                    className="input-field"
                                                    value={newClaim.status}
                                                    onChange={handleAddInputChange}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium">Estimated Amount</label>
                                            <input
                                                type="number"
                                                name="claimAmount"
                                                className="input-field"
                                                placeholder="0"
                                                value={newClaim.claimAmount}
                                                onChange={handleAddInputChange}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium">Assigned To</label>
                                            <input
                                                type="text"
                                                name="assignedTo"
                                                className="input-field"
                                                placeholder="e.g. Tech Team A"
                                                value={newClaim.assignedTo}
                                                onChange={handleAddInputChange}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-xs text-slate-400 font-medium">Issue Description *</label>
                                            <textarea
                                                name="issueDescription"
                                                className="input-field min-h-[80px]"
                                                placeholder="Describe the issue..."
                                                value={newClaim.issueDescription}
                                                onChange={handleAddInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 pt-4 flex gap-3 border-t border-white/10 mt-auto bg-[#0f172a]/95 backdrop-blur z-10 -mx-6 px-6 -mb-6 pb-6">
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-colors"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="premium-btn flex-1">
                                        {isEditing ? 'Update Claim' : 'Submit Claim'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {isViewModalOpen && selectedClaim && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2 text-white font-bold">
                                    <FileText size={20} className="text-[var(--primary)]" />
                                    <h2>Claim Details - {selectedClaim.id}</h2>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" onClick={closeViewModal}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm px-4 py-2 rounded-lg font-bold uppercase tracking-wider border flex items-center gap-2 ${getStatusColor(selectedClaim.status)}`}>
                                        {getStatusIcon(selectedClaim.status)}
                                        {selectedClaim.status}
                                    </span>
                                    <div className="text-sm text-slate-400 flex items-center gap-2">
                                        <Calendar size={16} />
                                        Filed on: <strong className="text-white">{new Date(selectedClaim.claimDate).toLocaleDateString('en-GB')}</strong>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                                        <User size={14} /> Customer Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Customer Name</span>
                                            <span className="text-white font-semibold">{selectedClaim.customerName}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Phone Number</span>
                                            <span className="text-white font-semibold">{selectedClaim.customerPhone}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">CNIC</span>
                                            <span className="text-white font-semibold">{selectedClaim.customerCNIC || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product & Claim Information */}
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                                        <Package size={14} /> Product & Claim Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Product Name</span>
                                            <span className="text-white font-semibold">{selectedClaim.productName}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Claim Type</span>
                                            <span className="text-white font-semibold px-2 py-1 bg-indigo-500/10 rounded border border-indigo-500/20 w-fit">{selectedClaim.claimType}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Claim Amount</span>
                                            <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                                                <DollarSign size={16} />
                                                {selectedClaim.claimAmount.toLocaleString()} PKR
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Assigned To</span>
                                            <span className="text-white font-semibold">{selectedClaim.assignedTo}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Issue Description */}
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                                        <AlertCircle size={14} /> Issue Description
                                    </h3>
                                    <p className="text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5">
                                        {selectedClaim.issueDescription}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 border-t border-white/10 flex gap-3">
                                <button className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-colors" onClick={closeViewModal}>
                                    Close
                                </button>
                                <button className="premium-btn flex-1" onClick={() => { closeViewModal(); handleEdit(selectedClaim); }}>
                                    Update Status
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Claims;