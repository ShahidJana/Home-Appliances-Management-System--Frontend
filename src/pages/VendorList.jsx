import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Plus,
    Search,
    Phone,
    MapPin,
    ExternalLink,
    MoreVertical,
    X,
    Loader2,
    Upload,
    Image as ImageIcon,
    User,
    Store,
    CreditCard,
    Home,
    Edit,
    Trash2,
    Ban,
    CheckCircle,
    Eye,
    Filter,
    ChevronDown
} from 'lucide-react';
import { useVendorController } from '../hooks/useVendorController';

const VendorList = () => {
    const {
        vendors,
        loading,
        fetchVendors,
        createVendor,
        updateVendor,
        deleteVendor,
        toggleBlockVendor,
        error: controllerError
    } = useVendorController();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [editingVendorId, setEditingVendorId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const shopImageRef = useRef(null);
    const agreementImageRef = useRef(null);

    const initialFormState = {
        name: '',
        cnic: '',
        shopName: '',
        shopAddress: '',
        shopContactNo: '',
        homeAddress: '',
        personalContactNumber: '',
        shopImage: null,
        agreementImage: null
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        // Auto-hyphen for CNIC: XXXXX-XXXXXXX-X
        if (name.toLowerCase().includes('cnic')) {
            value = value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 13) value = value.slice(0, 13); // Limit to 13 digits

            const parts = [];
            if (value.length > 0) parts.push(value.slice(0, 5));
            if (value.length > 5) parts.push(value.slice(5, 12));
            if (value.length > 12) parts.push(value.slice(12, 13));
            value = parts.join('-');
        }

        // Auto-hyphen for Phone: XXXX-XXXXXXX
        if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('contact') || name.toLowerCase().includes('number')) {
            value = value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 11) value = value.slice(0, 11); // Limit to 11 digits

            const parts = [];
            if (value.length > 0) parts.push(value.slice(0, 4));
            if (value.length > 4) parts.push(value.slice(4, 11));
            value = parts.join('-');
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatCNIC = (val) => {
        if (!val) return 'N/A';
        const clean = val.replace(/\D/g, '');
        const parts = [];
        if (clean.length > 0) parts.push(clean.slice(0, 5));
        if (clean.length > 5) parts.push(clean.slice(5, 12));
        if (clean.length > 12) parts.push(clean.slice(12, 13));
        return parts.join('-');
    };

    const handleImageChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setSubmissionError('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmissionError(null);
        try {
            if (editingVendorId) {
                await updateVendor(editingVendorId, formData);
            } else {
                await createVendor(formData);
            }
            closeModal();
            fetchVendors();
        } catch (err) {
            console.error('Save Error:', err);
            setSubmissionError(err.message || 'Failed to save vendor. Please check your data.');
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = (vendor = null) => {
        const formatValue = (key, val) => {
            if (!val) return val;
            if (key.toLowerCase().includes('cnic')) {
                const d = val.replace(/\D/g, '');
                const p = [];
                if (d.length > 0) p.push(d.slice(0, 5));
                if (d.length > 5) p.push(d.slice(5, 12));
                if (d.length > 12) p.push(d.slice(12, 13));
                return p.join('-');
            }
            if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('contact') || key.toLowerCase().includes('number')) {
                const d = val.replace(/\D/g, '');
                const p = [];
                if (d.length > 0) p.push(d.slice(0, 4));
                if (d.length > 4) p.push(d.slice(4, 11));
                return p.join('-');
            }
            return val;
        };

        if (vendor) {
            setEditingVendorId(vendor._id);
            setFormData({
                name: vendor.name,
                cnic: formatValue('cnic', vendor.cnic),
                shopName: vendor.shopName,
                shopAddress: vendor.shopAddress,
                shopContactNo: formatValue('shopContactNo', vendor.shopContactNo),
                homeAddress: vendor.homeAddress,
                personalContactNumber: formatValue('personalContactNumber', vendor.personalContactNumber),
                shopImage: vendor.shopImage,
                agreementImage: vendor.agreementImage
            });
        } else {
            setFormData(initialFormState);
            setEditingVendorId(null);
        }
        setSubmissionError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVendorId(null);
        setFormData(initialFormState);
    };

    const handleView = (vendor) => {
        setSelectedVendor(vendor);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setSelectedVendor(null);
        setIsViewModalOpen(false);
    };

    const filteredVendors = vendors.filter(v => {
        const term = searchTerm.toLowerCase();
        if (searchBy === 'shopName') return v.shopName?.toLowerCase().includes(term);
        if (searchBy === 'name') return v.name?.toLowerCase().includes(term);
        if (searchBy === 'cnic') return v.cnic?.includes(searchTerm);
        if (searchBy === 'phone') return v.shopContactNo?.includes(searchTerm) || v.personalContactNumber?.includes(searchTerm);

        return v.name?.toLowerCase().includes(term) ||
            v.shopName?.toLowerCase().includes(term) ||
            v.cnic?.includes(searchTerm);
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                </div>
                <button
                    className="premium-btn with-icon"
                    onClick={() => openModal()}
                >
                    <Plus size={18} />
                    <span>Add Vendor</span>
                </button>
            </div>

            {controllerError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                    <X size={16} />
                    <span>Connection Error: {controllerError}. Is the backend server running?</span>
                </div>
            )}

            <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-40">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md w-full focus-within:bg-white/10 focus-within:border-[var(--primary)] transition-colors">
                    <Search size={20} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder={
                            searchBy === 'all' ? "Search everything..." :
                                searchBy === 'shopName' ? "Search by shop name..." :
                                    searchBy === 'name' ? "Search by vendor name..." :
                                        searchBy === 'cnic' ? "Search by CNIC..." : "Search by phone number..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full placeholder-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 relative z-50">
                    <div className="relative">
                        <button
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${showFilters ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} />
                            <span className="text-sm font-medium">
                                {searchBy === 'all' ? 'Filter' : `By: ${searchBy === 'shopName' ? 'Shop' : searchBy === 'name' ? 'Name' : searchBy === 'cnic' ? 'CNIC' : 'Phone'}`}
                            </span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] py-1"
                                >
                                    {[
                                        { id: 'all', label: 'All Fields' },
                                        { id: 'shopName', label: 'Shop Name' },
                                        { id: 'name', label: 'Vendor Name' },
                                        { id: 'cnic', label: 'CNIC Number' },
                                        { id: 'phone', label: 'Phone Number' }
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

                    <button
                        className="px-4 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                        onClick={() => {
                            setSearchTerm('');
                            setSearchBy('all');
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Loading vendors...</p>
                    </div>
                ) : filteredVendors.length > 0 ? (
                    filteredVendors.map((v, i) => (
                        <motion.div
                            key={v._id || i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`glass-card group p-5 flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--primary)]/10 border-white/5 hover:border-white/10 ${v.isBlocked ? 'opacity-60 grayscale' : ''}`}
                        >
                            {/* Section 1: Identity & Profile */}
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg text-indigo-400 leading-tight truncate group-hover:text-indigo-300 transition-colors">
                                        {v.shopName || 'Untitled Shop'}
                                    </h3>
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border shrink-0 ${v.isBlocked
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                        {v.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-slate-500 font-medium truncate">{v.name || 'N/A'}</span>
                                    {v.cnic && <span className="text-[12px] text-slate-500 font-mono border-l border-white/5 pl-2 leading-none">{formatCNIC(v.cnic)}</span>}
                                </div>

                                {/* Integrated Contact & Address */}
                                <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[9px] shrink-0">
                                                <Phone size={10} className="text-indigo-400" />
                                                <span>Shop:</span>
                                            </div>
                                            <span className="text-[12px] font-bold text-slate-200">{v.shopContactNo || 'N/A'}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[9px] shrink-0">
                                                <Phone size={10} className="text-purple-400" />
                                                <span>Personal:</span>
                                            </div>
                                            <span className="text-[12px] font-bold text-slate-200">{v.personalContactNumber || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[9px] shrink-0 mt-0.5">
                                            <MapPin size={10} className="text-[var(--primary)]" />
                                            <span>Location:</span>
                                        </div>
                                        <p className="text-[11px] text-slate-300 font-medium line-clamp-2 flex-1" title={v.shopAddress}>
                                            {v.shopAddress || '--'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Action Buttons & Media */}
                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5 w-full justify-end">
                                {/* <div className="flex gap-2 mr-2 border-r border-white/5 pr-4">
                                    <button
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${v.shopImage ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'}`}
                                        title="View Shop Photo"
                                        onClick={() => v.shopImage && setPreviewImage(v.shopImage)}
                                    >
                                        <ImageIcon size={18} />
                                    </button>
                                    <button
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${v.agreementImage ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'}`}
                                        title="View Agreement"
                                        onClick={() => v.agreementImage && setPreviewImage(v.agreementImage)}
                                    >
                                        <Upload size={18} />
                                    </button>
                                </div> */}
                                <div className="flex gap-2">
                                    <button
                                        className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all ${v.isBlocked ? 'text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20'}`}
                                        title={v.isBlocked ? 'Unblock' : 'Block'}
                                        onClick={() => toggleBlockVendor(v._id)}
                                    >
                                        {v.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                                    </button>
                                    <button
                                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/20 transition-all"
                                        title="View Details"
                                        onClick={() => handleView(v)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold"
                                        title="Edit"
                                        onClick={() => openModal(v)}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                                        title="Delete"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this vendor?')) deleteVendor(v._id);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                        <Store size={48} className="opacity-20" />
                        <p>No vendors found</p>
                        <span className="text-sm">Try adjusting your search or adding a new vendor.</span>
                    </div>
                )}
            </div>

            {/* Modal for Adding Vendor */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                                <h2 className="text-lg font-bold">Register New Vendor</h2>
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" onClick={() => setIsModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {submissionError && (
                                <div className="mx-5 mt-5 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm">
                                    <X size={14} />
                                    <span>{submissionError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="overflow-y-auto p-5 flex flex-col gap-8 custom-scrollbar">
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><User size={12} /> Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="input-field"
                                                placeholder="Enter owner name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><CreditCard size={12} /> CNIC Number</label>
                                            <input
                                                type="text"
                                                name="cnic"
                                                className="input-field"
                                                placeholder="42XXX-XXXXXXX-X"
                                                value={formData.cnic}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Phone size={12} /> Personal Contact No</label>
                                            <input
                                                type="tel"
                                                name="personalContactNumber"
                                                className="input-field"
                                                placeholder="0300-1234567"
                                                value={formData.personalContactNumber}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Store size={12} /> Shop Name</label>
                                            <input
                                                type="text"
                                                name="shopName"
                                                className="input-field"
                                                placeholder="Enter store name"
                                                value={formData.shopName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Phone size={12} /> Shop Contact No</label>
                                            <input
                                                type="tel"
                                                name="shopContactNo"
                                                className="input-field"
                                                placeholder="Landline or mobile"
                                                value={formData.shopContactNo}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Home size={12} /> Home Address</label>
                                            <input
                                                type="text"
                                                name="homeAddress"
                                                className="input-field"
                                                placeholder="Residential address"
                                                value={formData.homeAddress}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 md:col-span-3">
                                            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><MapPin size={12} /> Shop Address</label>
                                            <textarea
                                                name="shopAddress"
                                                className="input-field min-h-[80px]"
                                                placeholder="Complete commercial address"
                                                rows="2"
                                                value={formData.shopAddress}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><ImageIcon size={14} /> Documents & Media</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => shopImageRef.current.click()}>
                                            <input
                                                type="file"
                                                hidden
                                                ref={shopImageRef}
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, 'shopImage')}
                                            />
                                            {formData.shopImage ? (
                                                <img src={formData.shopImage} alt="Shop Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                                                    <Store size={24} />
                                                    <span className="text-xs text text-white">Shop Photo</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => agreementImageRef.current.click()}>
                                            <input
                                                type="file"
                                                hidden
                                                ref={agreementImageRef}
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, 'agreementImage')}
                                            />
                                            {formData.agreementImage ? (
                                                <img src={formData.agreementImage} alt="Agreement Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                                                    <Upload size={24} />
                                                    <span className="text-xs text text-white">Agreement</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur pt-4 pb-0 flex gap-3 border-t border-white/10 z-10">
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-colors"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="premium-btn flex-1"
                                        disabled={submitting}
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Save Vendor'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* View Vendor Modal */}
            <AnimatePresence>
                {isViewModalOpen && selectedVendor && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2 text-white font-bold">
                                    <Store size={20} className="text-[var(--primary)]" />
                                    <h2>Vendor Profile Details</h2>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" onClick={closeViewModal}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><User size={14} /> Personal Details</h3>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">Full Name:</strong>
                                                <span className="text-white font-semibold">{selectedVendor.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">CNIC:</strong>
                                                <span className="text-white font-mono">{formatCNIC(selectedVendor.cnic)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">Personal No:</strong>
                                                <span className="text-white font-mono">{selectedVendor.personalContactNumber}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">Home Address:</strong>
                                                <span className="text-white text-xs leading-relaxed">{selectedVendor.homeAddress}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><Store size={14} /> Shop Details</h3>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">Shop Name:</strong>
                                                <span className="text-white font-bold text-[var(--primary)]">{selectedVendor.shopName}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">Shop Phone:</strong>
                                                <span className="text-white font-mono">{selectedVendor.shopContactNo}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">Status:</strong>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${selectedVendor.isBlocked
                                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    }`}>
                                                    {selectedVendor.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                                <strong className="text-slate-400 font-medium">Shop Address:</strong>
                                                <span className="text-white text-xs leading-relaxed">{selectedVendor.shopAddress}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><ImageIcon size={14} /> Documents</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { title: 'Shop Photo', src: selectedVendor.shopImage },
                                            { title: 'Agreement Photo', src: selectedVendor.agreementImage }
                                        ].map((img, idx) => (
                                            <div key={idx} className="aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10 relative group cursor-pointer" onClick={() => img.src && setPreviewImage(img.src)}>
                                                {img.src ? (
                                                    <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-1.5 font-bold uppercase tracking-widest">
                                                        <Store size={20} className="opacity-20" />
                                                        <span className="text-[10px]">{img.title}</span>
                                                    </div>
                                                )}
                                                {img.src && (
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity flex-col gap-2">
                                                        <Eye size={20} className="text-white" />
                                                        <span className="text-xs font-bold text-white">Preview Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 p-5 border-t border-white/10 shrink-0">
                                <button className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-colors" onClick={() => { closeViewModal(); openModal(selectedVendor); }}>Edit Profile</button>
                                <button className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-dark)] transition-colors" onClick={closeViewModal}>Close View</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/90 backdrop-blur" onClick={() => setPreviewImage(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-[90vw] max-h-[90vh]"
                        >
                            <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
                            <button className="absolute -top-5 -right-5 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-700" onClick={() => setPreviewImage(null)}>
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VendorList;