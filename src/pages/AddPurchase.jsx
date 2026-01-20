import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Smartphone,
    Cpu,
    Hash,
    CheckCircle2,
    AlertCircle,
    X,
    Package,
    Tag
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePurchaseController } from '../hooks/usePurchaseController';
import { useVendorController } from '../hooks/useVendorController';
import toast from 'react-hot-toast';

const AddPurchase = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { addProduct, loading } = usePurchaseController();
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
        customSellerName: '',
        customSellerCnic: '',
        imei1: '',
        imei2: '',
        serialNumber: '',
        specification_description: ''
    });

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addProduct(formData);
            toast.success('Product added successfully');
            setSearchParams({ view: 'stock' });
        } catch (err) {
            toast.error(err.message || 'Action failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
        >

            {/* Main Form Area */}
            <form onSubmit={handleSubmit} className="glass-card overflow-hidden shadow-2xl">
                <div className="px-4 py-6 bg-white/[0.02] border-b border-white/5 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Product Type:</span>
                            <div className="flex gap-4">
                                {['Mobile', 'Appliance'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, productType: type })}
                                        className={`px-8 py-2 rounded-md text-[12px] font-black uppercase tracking-[0.15em] transition-all border ${formData.productType === type
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 ring-4 ring-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                            : 'text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-400'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-10 md:px-10 md:py-1 mt-6">
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
                                        onChange={e => setFormData({ ...formData, condition: e.target.value, conditionRating: e.target.value === 'New' ? 10 : formData.conditionRating })}
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

                            {formData.condition === 'Used' && (
                                <div className="flex flex-col gap-3 p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl">
                                    <label className="text-sm font-bold text-slate-300 flex items-center justify-between px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Condition Rating</span>
                                        <span className="text-amber-400 font-bold text-lg">{formData.conditionRating}/10</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="1"
                                        className="w-full h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        value={formData.conditionRating}
                                        onChange={e => setFormData({ ...formData, conditionRating: parseInt(e.target.value) })}
                                    />
                                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                        <span>Poor (0)</span>
                                        <span>Excellent (10)</span>
                                    </div>
                                </div>
                            )}

                            {formData.productType === 'Appliance' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Category</label>
                                    <select
                                        required
                                        className="premium-input w-full bg-[#1e293b]/50"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="AC">Air Conditioner</option>
                                        <option value="Fridge">Refrigerator</option>
                                        <option value="Washing Machine">Washing Machine</option>
                                        <option value="Microwave">Microwave</option>
                                        <option value="TV">LED TV</option>
                                        <option value="Other">Other Home Appliance</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Column 2: Logistics & Identity */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Vendor / Supplier</label>
                                    <select
                                        required
                                        className="premium-input w-full bg-[#1e293b]/50 text-sm"
                                        value={formData.vendor}
                                        onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                                    >
                                        <option value="">Select Vendor</option>
                                        <option value="custom">Custom Seller</option>
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

                            {formData.vendor === 'custom' && (
                                <div className="grid grid-cols-2 gap-5 p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-300 ml-1 font-mono uppercase tracking-tighter scale-90 origin-left opacity-60">Seller Name</label>
                                        <input
                                            required
                                            className="premium-input w-full bg-white/[0.02] border-white/5"
                                            placeholder="Enter name"
                                            value={formData.customSellerName}
                                            onChange={e => setFormData({ ...formData, customSellerName: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-300 ml-1 font-mono uppercase tracking-tighter scale-90 origin-left opacity-60">CNIC / ID</label>
                                        <input
                                            required
                                            className="premium-input w-full bg-white/[0.02] border-white/5"
                                            placeholder="XXXXX-XXXXXXX-X"
                                            value={formData.customSellerCnic}
                                            onChange={e => setFormData({ ...formData, customSellerCnic: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-indigo-400 ml-1">Sale Price (Rs.)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-[10px] opacity-40 uppercase tracking-tighter">PKR</span>
                                    <input
                                        required
                                        type="number"
                                        className="premium-input w-full pl-12 bg-indigo-500/[0.03] border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                                        placeholder="0"
                                        value={formData.sellingPrice}
                                        onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Identification Area */}
                            <div className="pt-4">
                                {formData.productType === 'Mobile' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-2.5">
                                            <label className="text-sm font-medium text-indigo-400 ml-1 flex items-center gap-2">
                                                <CheckCircle2 size={16} strokeWidth={2} /> IMEI 1 (PRIMARY)
                                            </label>
                                            <input
                                                required
                                                className="premium-input w-full bg-indigo-500/[0.03] border-indigo-500/20 text-white font-mono text-sm"
                                                placeholder="35XXXXXXXXXXXXX"
                                                value={formData.imei1}
                                                onChange={e => setFormData({ ...formData, imei1: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            <label className="text-sm font-medium text-slate-500 ml-1">IMEI 2 (OPTIONAL)</label>
                                            <input
                                                className="premium-input w-full bg-[#1e293b]/50 border-white/5 text-white font-mono text-sm"
                                                placeholder="35XXXXXXXXXXXXX"
                                                value={formData.imei2}
                                                onChange={e => setFormData({ ...formData, imei2: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-sm font-medium text-amber-400 ml-1 flex items-center gap-2">
                                            <CheckCircle2 size={16} strokeWidth={2} /> SERIAL NUMBER
                                        </label>
                                        <input
                                            required
                                            className="premium-input w-full bg-amber-500/[0.02] border-amber-500/20 text-white font-mono text-sm"
                                            placeholder="SN-XXXXX-XXXXXX"
                                            value={formData.serialNumber}
                                            onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Specifications Area */}
                <div className="mt-6 pt-6 border-t border-white/5 p-10">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Specifications & Description</label>
                        <textarea
                            rows={4}
                            className="premium-input w-full resize-none p-5"
                            placeholder="Enter technical specifications, RAM, Storage, Warranty details etc..."
                            value={formData.specification_description}
                            onChange={e => setFormData({ ...formData, specification_description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-4 p-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 rounded-2xl bg-indigo-500 text-white font-black hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-3 order-1 sm:order-2 group"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                        )}
                        <span>Finalize Stock Addition</span>
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default AddPurchase;
