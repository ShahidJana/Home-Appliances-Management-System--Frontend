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
  Filter,
  X,
  Loader2,
  Calendar,
  Briefcase,
  Building,
  Users,
  CreditCard,
  Home,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Ban,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useCustomerController } from '../hooks/useCustomerController';

const CustomerList = () => {
  const { customers, loading, fetchCustomers, createCustomer, updateCustomer, deleteCustomer, toggleCustomerStatus } = useCustomerController();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    maritalStatus: '',
    homeType: '',
    sourceOfIncome: ''
  });
  const [searchBy, setSearchBy] = useState('all');

  const cnicFrontRef = React.useRef(null);
  const cnicBackRef = React.useRef(null);
  const homeImageRef = React.useRef(null);
  const shopImageRef = React.useRef(null);
  const g1CnicFrontRef = React.useRef(null);
  const g1CnicBackRef = React.useRef(null);
  const g2CnicFrontRef = React.useRef(null);
  const g2CnicBackRef = React.useRef(null);

  const initialFormState = {
    fullName: '',
    fatherName: '',
    primaryPhone: '',
    secondaryPhone: '',
    cnic: '',
    dob: '',
    maritalStatus: '',
    address: '', // Includes zilla, route, city, sector, muhalla
    homeType: '', // owner/rent
    sourceOfIncome: '', // business/job
    companyName: '',
    companyAddress: '',
    designation: '',
    yearsOfEmployment: '',
    status: 'Active',
    referredBy: '',
    cnicFront: null,
    cnicBack: null,
    homeImage: null,
    shopImage: null,
    guarantor1Name: '',
    guarantor1FatherName: '',
    guarantor1Phone: '',
    guarantor1Cnic: '',
    guarantor1Address: '',
    guarantor1CnicFront: null,
    guarantor1CnicBack: null,
    guarantor2Name: '',
    guarantor2FatherName: '',
    guarantor2Phone: '',
    guarantor2Cnic: '',
    guarantor2Address: '',
    guarantor2CnicFront: null,
    guarantor2CnicBack: null
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
    if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('contact')) {
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

  const formatPhone = (val) => {
    if (!val) return 'N/A';
    const clean = val.replace(/\D/g, '');
    const parts = [];
    if (clean.length > 0) parts.push(clean.slice(0, 4));
    if (clean.length > 4) parts.push(clean.slice(4, 11));
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
      if (isEditing && selectedCustomer) {
        await updateCustomer(selectedCustomer._id || selectedCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      closeModal();
      fetchCustomers();
    } catch (err) {
      console.error('Save Error:', err);
      setSubmissionError(err.message || 'Failed to save customer. Please check your data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer) => {
    const formattedCustomer = { ...customer };

    // Helper to format values
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
      if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('contact')) {
        const d = val.replace(/\D/g, '');
        const p = [];
        if (d.length > 0) p.push(d.slice(0, 4));
        if (d.length > 4) p.push(d.slice(4, 11));
        return p.join('-');
      }
      return val;
    };

    // Format all relevant fields
    Object.keys(formattedCustomer).forEach(key => {
      if (typeof formattedCustomer[key] === 'string') {
        formattedCustomer[key] = formatValue(key, formattedCustomer[key]);
      }
    });

    setSelectedCustomer(customer);
    setFormData(formattedCustomer);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        alert('Failed to delete customer');
      }
    }
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const openModal = () => {
    setFormData(initialFormState);
    setSelectedCustomer(null);
    setIsEditing(false);
    setSubmissionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setSelectedCustomer(null);
    setIsEditing(false);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      maritalStatus: '',
      homeType: '',
      sourceOfIncome: ''
    });
    setSearchTerm('');
    setSearchBy('all');
  };

  const filteredCustomers = customers.filter(c => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (() => {
      if (searchBy === 'fullName') return c.fullName?.toLowerCase().includes(lowerSearch);
      if (searchBy === 'cnic') return c.cnic?.includes(searchTerm);
      if (searchBy === 'primaryPhone') return c.primaryPhone?.includes(searchTerm);
      if (searchBy === 'address') return c.address?.toLowerCase().includes(lowerSearch);
      return (
        c.fullName?.toLowerCase().includes(lowerSearch) ||
        c.cnic?.includes(searchTerm) ||
        c.primaryPhone?.includes(searchTerm) ||
        c.address?.toLowerCase().includes(lowerSearch)
      );
    })();

    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-8">

        <button className="premium-btn with-icon" onClick={openModal}>
          <Plus size={18} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-40">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md w-full focus-within:bg-white/10 focus-within:border-[var(--primary)] transition-colors">
          <Search size={20} className="text-slate-400" />
          <input
            className="bg-transparent border-none outline-none text-white w-full placeholder-slate-400"
            type="text"
            placeholder={
              searchBy === 'all' ? "Search for anything..." :
                searchBy === 'fullName' ? "Search by name..." :
                  searchBy === 'cnic' ? "Search by CNIC..." :
                    searchBy === 'primaryPhone' ? "Search by phone..." : "Search by address..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 relative z-50">
          <div className="relative">
            <button
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${showFilters ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>{searchBy === 'all' ? 'Filter' : `By: ${searchBy === 'fullName' ? 'Name' : searchBy === 'cnic' ? 'CNIC' : searchBy === 'primaryPhone' ? 'Phone' : 'Address'}`}</span>
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
                    { id: 'fullName', label: 'Full Name' },
                    { id: 'cnic', label: 'CNIC No' },
                    { id: 'primaryPhone', label: 'Phone No' },
                    { id: 'address', label: 'Address/City' }
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
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
        <AnimatePresence>
          {filteredCustomers.map((c, i) => (
            <motion.div
              key={c._id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group p-5 flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--primary)]/10 border-white/5 hover:border-white/10"
            >
              {/* Section 1: Customer Profile */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-indigo-400 truncate group-hover:text-indigo-300 transition-colors line-clamp-1">{c.fullName}</h3>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${c.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {c.status}
                  </span>
                </div>
                {c.cnic && <span className="text-[14px] text-slate-500 font-mono tracking-tight mb-4" title='CNIC'>{formatCNIC(c.cnic)}</span>}

                {/* Integrated Contact & Address */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[9px] w-[110px] shrink-0">
                      <Phone size={10} className="text-indigo-400" />
                      <span>Phone:</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-200">{formatPhone(c.primaryPhone)}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[9px] w-[110px] shrink-0 mt-0.5">
                      <MapPin size={10} className="text-[var(--primary)]" />
                      <span>Address:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium line-clamp-2 mr-2 flex-1" title={c.address}>
                      {c.address || 'No address provided.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Actions */}
              <div className="flex items-center gap-3 mt-auto pt-5 border-t border-white/5 w-full justify-end">
                <button
                  className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all ${c.status === 'Active' ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20' : 'text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'}`}
                  onClick={() => toggleCustomerStatus(c)}
                  title={c.status === 'Active' ? 'Block Customer' : 'Unblock Customer'}
                >
                  {c.status === 'Active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                </button>
                <button
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/20 transition-all"
                  onClick={() => handleView(c)}
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all"
                  onClick={() => handleEdit(c)}
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                  onClick={() => handleDelete(c._id || c.id)}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal for Adding Customer */}
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
                <h2 className="text-lg font-bold">{isEditing ? 'Update Customer Profile' : 'Register New Customer'}</h2>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" onClick={closeModal}>
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
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><UserCheck size={14} /> Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        className="input-field"
                        placeholder="Enter full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Father Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        className="input-field"
                        placeholder="Enter father name"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Phone size={12} /> Primary Phone *</label>
                      <input
                        type="tel"
                        name="primaryPhone"
                        className="input-field"
                        placeholder="03XX-XXXXXXX"
                        value={formData.primaryPhone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Phone size={12} /> Secondary Phone</label>
                      <input
                        type="tel"
                        name="secondaryPhone"
                        className="input-field"
                        placeholder="03XX-XXXXXXX"
                        value={formData.secondaryPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><CreditCard size={12} /> CNIC Number *</label>
                      <input
                        type="text"
                        name="cnic"
                        className="input-field"
                        placeholder="XXXXX-XXXXXXX-X"
                        value={formData.cnic}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Calendar size={12} /> Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        className="input-field"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Marital Status *</label>
                      <select
                        name="maritalStatus"
                        className="input-field"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><MapPin size={12} /> Full Address (Zilla, Route, City, Sector, Muhalla) *</label>
                      <textarea
                        name="address"
                        className="input-field min-h-[80px]"
                        placeholder="Enter complete address details..."
                        rows="2"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><Briefcase size={14} /> Work & Income</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Home size={12} /> Home Type *</label>
                      <select
                        name="homeType"
                        className="input-field"
                        value={formData.homeType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Owner">Owner</option>
                        <option value="Rent">Rent</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Briefcase size={12} /> Source of Income *</label>
                      <select
                        name="sourceOfIncome"
                        className="input-field"
                        value={formData.sourceOfIncome}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Source</option>
                        <option value="Business">Business</option>
                        <option value="Job">Job</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Building size={12} /> Company Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        className="input-field"
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><CreditCard size={12} /> Designation</label>
                      <input
                        type="text"
                        name="designation"
                        className="input-field"
                        placeholder="Enter designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Calendar size={12} /> Years of Employment</label>
                      <input
                        type="text"
                        name="yearsOfEmployment"
                        className="input-field"
                        placeholder="e.g. 5 years"
                        value={formData.yearsOfEmployment}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Referred By</label>
                      <input
                        type="text"
                        name="referredBy"
                        className="input-field"
                        placeholder="Referral name"
                        value={formData.referredBy}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><MapPin size={12} /> Company Address *</label>
                      <textarea
                        name="companyAddress"
                        className="input-field min-h-[80px]"
                        placeholder="Enter office address"
                        rows="2"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><Users size={14} /> Guarantor 1 Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Full Name</label>
                      <input
                        type="text"
                        name="guarantor1Name"
                        className="input-field"
                        placeholder="Enter guarantor name"
                        value={formData.guarantor1Name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Father Name</label>
                      <input
                        type="text"
                        name="guarantor1FatherName"
                        className="input-field"
                        placeholder="Enter father name"
                        value={formData.guarantor1FatherName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Phone size={12} /> Contact Number</label>
                      <input
                        type="tel"
                        name="guarantor1Phone"
                        className="input-field"
                        placeholder="03XX-XXXXXXX"
                        value={formData.guarantor1Phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><CreditCard size={12} /> CNIC Number</label>
                      <input
                        type="text"
                        name="guarantor1Cnic"
                        className="input-field"
                        placeholder="XXXXX-XXXXXXX-X"
                        value={formData.guarantor1Cnic}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><MapPin size={12} /> Address</label>
                      <textarea
                        name="guarantor1Address"
                        className="input-field min-h-[42px]"
                        placeholder="Guarantor full address"
                        rows="1"
                        value={formData.guarantor1Address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-3">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><ImageIcon size={12} /> Guarantor 1 Documents</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="aspect-[3/2] bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => g1CnicFrontRef.current.click()}>
                          <input type="file" hidden ref={g1CnicFrontRef} accept="image/*" onChange={(e) => handleImageChange(e, 'guarantor1CnicFront')} />
                          {formData.guarantor1CnicFront ? <img src={formData.guarantor1CnicFront} className="w-full h-full object-cover" alt="G1 Front" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-1"><CreditCard size={16} /> <span className="text-[10px]">Front</span></div>}
                        </div>
                        <div className="aspect-[3/2] bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => g1CnicBackRef.current.click()}>
                          <input type="file" hidden ref={g1CnicBackRef} accept="image/*" onChange={(e) => handleImageChange(e, 'guarantor1CnicBack')} />
                          {formData.guarantor1CnicBack ? <img src={formData.guarantor1CnicBack} className="w-full h-full object-cover" alt="G1 Back" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-1"><CreditCard size={16} /> <span className="text-[10px]">Back</span></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><Users size={14} /> Guarantor 2 Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Full Name</label>
                      <input
                        type="text"
                        name="guarantor2Name"
                        className="input-field"
                        placeholder="Enter guarantor name"
                        value={formData.guarantor2Name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Users size={12} /> Father Name</label>
                      <input
                        type="text"
                        name="guarantor2FatherName"
                        className="input-field"
                        placeholder="Enter father name"
                        value={formData.guarantor2FatherName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Phone size={12} /> Contact Number</label>
                      <input
                        type="tel"
                        name="guarantor2Phone"
                        className="input-field"
                        placeholder="03XX-XXXXXXX"
                        value={formData.guarantor2Phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><CreditCard size={12} /> CNIC Number</label>
                      <input
                        type="text"
                        name="guarantor2Cnic"
                        className="input-field"
                        placeholder="XXXXX-XXXXXXX-X"
                        value={formData.guarantor2Cnic}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><MapPin size={12} /> Address</label>
                      <textarea
                        name="guarantor2Address"
                        className="input-field min-h-[42px]"
                        placeholder="Guarantor full address"
                        rows="1"
                        value={formData.guarantor2Address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-3">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><ImageIcon size={12} /> Guarantor 2 Documents</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="aspect-[3/2] bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => g2CnicFrontRef.current.click()}>
                          <input type="file" hidden ref={g2CnicFrontRef} accept="image/*" onChange={(e) => handleImageChange(e, 'guarantor2CnicFront')} />
                          {formData.guarantor2CnicFront ? <img src={formData.guarantor2CnicFront} className="w-full h-full object-cover" alt="G2 Front" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-1"><CreditCard size={16} /> <span className="text-[10px]">Front</span></div>}
                        </div>
                        <div className="aspect-[3/2] bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => g2CnicBackRef.current.click()}>
                          <input type="file" hidden ref={g2CnicBackRef} accept="image/*" onChange={(e) => handleImageChange(e, 'guarantor2CnicBack')} />
                          {formData.guarantor2CnicBack ? <img src={formData.guarantor2CnicBack} className="w-full h-full object-cover" alt="G2 Back" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-1"><CreditCard size={16} /> <span className="text-[10px]">Back</span></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><ImageIcon size={14} /> Documents & Photos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => cnicFrontRef.current.click()}>
                      <input type="file" hidden ref={cnicFrontRef} accept="image/*" onChange={(e) => handleImageChange(e, 'cnicFront')} />
                      {formData.cnicFront ? <img src={formData.cnicFront} className="w-full h-full object-cover" alt="CNIC Front" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2"><CreditCard size={24} /> <span className="text-xs text-white">CNIC Front *</span></div>}
                    </div>
                    <div className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => cnicBackRef.current.click()}>
                      <input type="file" hidden ref={cnicBackRef} accept="image/*" onChange={(e) => handleImageChange(e, 'cnicBack')} />
                      {formData.cnicBack ? <img src={formData.cnicBack} className="w-full h-full object-cover" alt="CNIC Back" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2"><CreditCard size={24} /> <span className="text-xs text-white">CNIC Back *</span></div>}
                    </div>
                    <div className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => homeImageRef.current.click()}>
                      <input type="file" hidden ref={homeImageRef} accept="image/*" onChange={(e) => handleImageChange(e, 'homeImage')} />
                      {formData.homeImage ? <img src={formData.homeImage} className="w-full h-full object-cover" alt="Home" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2"><Home size={24} /> <span className="text-xs text-white">Home Photo</span></div>}
                    </div>
                    <div className="aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl relative overflow-hidden group hover:border-[var(--primary)]/50 transition-colors cursor-pointer" onClick={() => shopImageRef.current.click()}>
                      <input type="file" hidden ref={shopImageRef} accept="image/*" onChange={(e) => handleImageChange(e, 'shopImage')} />
                      {formData.shopImage ? <img src={formData.shopImage} className="w-full h-full object-cover" alt="Shop" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2"><Building size={24} /> <span className="text-xs text-white">Shop Photo</span></div>}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-[#0f172a]/95 backdrop-blur pt-4 pb-0 flex gap-3 border-t border-white/10 z-10">
                  <button type="button" className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-colors" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="premium-btn flex-1" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Save Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Customer Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 text-white font-bold">
                  <UserCheck size={20} className="text-[var(--primary)]" />
                  <h2>Customer Profile Detail</h2>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" onClick={closeViewModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><UserCheck size={14} /> Personal Details</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Full Name:</strong>
                        <span className="text-white font-semibold">{selectedCustomer.fullName}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Father Name:</strong>
                        <span className="text-white">{selectedCustomer.fatherName}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">CNIC:</strong>
                        <span className="text-white font-mono">{formatCNIC(selectedCustomer.cnic)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Primary Phone:</strong>
                        <span className="text-white font-mono">{formatPhone(selectedCustomer.primaryPhone)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Secondary Phone:</strong>
                        <span className="text-white font-mono">{formatPhone(selectedCustomer.secondaryPhone)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">DOB:</strong>
                        <span className="text-white">{selectedCustomer.dob || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Marital Status:</strong>
                        <span className="text-white">{selectedCustomer.maritalStatus}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Status:</strong>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${selectedCustomer.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                          {selectedCustomer.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Full Address:</strong>
                        <span className="text-white text-xs leading-relaxed">{selectedCustomer.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><Briefcase size={14} /> Work & Income</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Home Type:</strong>
                        <span className="text-white">{selectedCustomer.homeType}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Source of Income:</strong>
                        <span className="text-white">{selectedCustomer.sourceOfIncome}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Company Name:</strong>
                        <span className="text-white">{selectedCustomer.companyName}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Designation:</strong>
                        <span className="text-white">{selectedCustomer.designation || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Work Exp:</strong>
                        <span className="text-white">{selectedCustomer.yearsOfEmployment || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Referred By:</strong>
                        <span className="text-white">{selectedCustomer.referredBy || 'Direct'}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                        <strong className="text-slate-400 font-medium">Company Address:</strong>
                        <span className="text-white text-xs leading-relaxed">{selectedCustomer.companyAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><Users size={14} /> Guarantor 1</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">Name:</strong> <span className="text-white">{selectedCustomer.guarantor1Name || 'N/A'}</span></div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">Phone:</strong> <span className="text-white font-mono">{formatPhone(selectedCustomer.guarantor1Phone)}</span></div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">CNIC:</strong> <span className="text-white font-mono">{formatCNIC(selectedCustomer.guarantor1Cnic)}</span></div>
                      <div className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">Address:</strong> <span className="text-white text-xs leading-relaxed">{selectedCustomer.guarantor1Address || 'N/A'}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><Users size={14} /> Guarantor 2</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">Name:</strong> <span className="text-white">{selectedCustomer.guarantor2Name || 'N/A'}</span></div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">Phone:</strong> <span className="text-white font-mono">{formatPhone(selectedCustomer.guarantor2Phone)}</span></div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">CNIC:</strong> <span className="text-white font-mono">{formatCNIC(selectedCustomer.guarantor2Cnic)}</span></div>
                      <div className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors"><strong className="text-slate-400 font-medium">Address:</strong> <span className="text-white text-xs leading-relaxed">{selectedCustomer.guarantor2Address || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><ImageIcon size={14} /> Documents</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { title: 'CNIC Front', src: selectedCustomer.cnicFront },
                      { title: 'CNIC Back', src: selectedCustomer.cnicBack },
                      { title: 'Home Photo', src: selectedCustomer.homeImage },
                      { title: 'Shop Photo', src: selectedCustomer.shopImage },
                      { title: 'G1 CNIC Front', src: selectedCustomer.guarantor1CnicFront },
                      { title: 'G1 CNIC Back', src: selectedCustomer.guarantor1CnicBack },
                      { title: 'G2 CNIC Front', src: selectedCustomer.guarantor2CnicFront },
                      { title: 'G2 CNIC Back', src: selectedCustomer.guarantor2CnicBack }
                    ].map((img, idx) => (
                      <div key={idx} className="aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10 relative group cursor-pointer" onClick={() => img.src && setPreviewImage(img.src)}>
                        {img.src ? (
                          <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-1.5 grayscale opacity-40">
                            <ImageIcon size={20} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">{img.title}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-xs font-bold text-white">View Full</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-white/10 shrink-0">
                <button className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-dark)] transition-colors w-full sm:w-auto" onClick={closeViewModal}>Close Profile</button>
              </div>
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

export default CustomerList;