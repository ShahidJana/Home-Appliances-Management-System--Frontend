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
    Eye
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [editingVendorId, setEditingVendorId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        if (vendor) {
            setEditingVendorId(vendor._id);
            setFormData({
                name: vendor.name,
                cnic: vendor.cnic,
                shopName: vendor.shopName,
                shopAddress: vendor.shopAddress,
                shopContactNo: vendor.shopContactNo,
                homeAddress: vendor.homeAddress,
                personalContactNumber: vendor.personalContactNumber,
                shopImage: vendor.shopImage,
                agreementImage: vendor.agreementImage
            });
        } else {
            setEditingVendorId(null);
            setFormData(initialFormState);
        }
        setSubmissionError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVendorId(null);
        setFormData(initialFormState);
    };

    const filteredVendors = vendors.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.cnic?.includes(searchTerm)
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Vendor Network</h1>
                    <p className="text-slate-400">Manage product suppliers and shop procurement channels</p>
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

            <div className="glass-card p-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md w-full focus-within:bg-white/10 focus-within:border-[var(--primary)] transition-colors">
                    <Search size={20} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, shop, or CNIC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Loading vendors...</p>
                    </div>
                ) : filteredVendors.length > 0 ? (
                    filteredVendors.map((v, i) => (
                        <motion.div
                            key={v._id || i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-card p-5 flex flex-col gap-4 ${v.isBlocked ? 'opacity-60 grayscale border-red-500/20' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-[15px] text-white line-clamp-1">{v.shopName || 'Untitled Shop'}</h3>
                                        {v.isBlocked && <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-bold uppercase">Blocked</span>}
                                    </div>
                                    <span className="text-[11px] text-slate-400 block">{v.name}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button className="action-btn-mini edit" title="Edit" onClick={() => openModal(v)}>
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        className={`action-btn-mini ${v.isBlocked ? 'unblock' : 'block'}`}
                                        title={v.isBlocked ? 'Unblock' : 'Block'}
                                        onClick={() => toggleBlockVendor(v._id)}
                                    >
                                        {v.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                                    </button>
                                    <button className="action-btn-mini delete" title="Delete" onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this vendor?')) deleteVendor(v._id);
                                    }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 p-1.5 rounded border border-white/5">
                                            <CreditCard size={12} className="text-[var(--primary)] shrink-0" />
                                            <span className="truncate">CNIC: {v.cnic || 'Unverified'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 p-1.5 rounded border border-white/5">
                                            <Phone size={12} className="text-[var(--primary)] shrink-0" />
                                            <span className="truncate">S: {v.shopContactNo || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 p-1.5 rounded border border-white/5">
                                            <Phone size={12} className="text-[var(--primary)] shrink-0" />
                                            <span className="truncate">P: {v.personalContactNumber || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1 mb-0.5"><Store size={10} /> Shop Address</label>
                                            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{v.shopAddress || 'Not specified'}</p>
                                        </div>
                                        <div className="h-px bg-white/5 w-full"></div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1 mb-0.5"><Home size={10} /> Home Address</label>
                                            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{v.homeAddress || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-1">
                                    <div
                                        className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] py-1.5 rounded-lg border transition-all ${v.shopImage ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)] cursor-pointer hover:bg-[var(--primary)]/20' : 'bg-white/5 border-white/5 text-slate-500'}`}
                                        onClick={() => v.shopImage && setPreviewImage(v.shopImage)}
                                    >
                                        <ImageIcon size={10} /> {v.shopImage ? 'View Shop Photo' : 'No Photo'}
                                    </div>
                                    <div
                                        className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] py-1.5 rounded-lg border transition-all ${v.agreementImage ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)] cursor-pointer hover:bg-[var(--primary)]/20' : 'bg-white/5 border-white/5 text-slate-500'}`}
                                        onClick={() => v.agreementImage && setPreviewImage(v.agreementImage)}
                                    >
                                        <Upload size={10} /> {v.agreementImage ? 'View Agreement' : 'No Agreement'}
                                    </div>
                                </div>
                            </div>

                            {/* <div className="card-footer-refined">
                                <button className="profile-btn">
                                    Open Full Profile <ExternalLink size={12} />
                                </button>
                            </div> */}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur" onClick={() => setPreviewImage(null)}>
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