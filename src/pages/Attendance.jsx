import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users2,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRightLeft,
    Search,
    UserPlus,
    X,
    Mail,
    Lock,
    MapPin,
    Phone,
    Shield,
    CreditCard,
    AlertCircle,
    UserCircle2,
    Briefcase,
    UserCheck,
    UserX,
    TrendingUp,
    History,
    Trash2
} from 'lucide-react';
import { useEmployeeController } from '../hooks/useEmployeeController';
import { AuthModel } from '../services/AuthModel';
import { AnimatePresence } from 'framer-motion';

const Attendance = () => {
    const {
        employees,
        loading,
        dashboardStats,
        fetchEmployees,
        fetchDashboardStats,
        markAttendance,
        createEmployee,
        autoMarkAllPresent,
        editAttendance,
        personalAttendanceStats,
        personalHistory,
        fetchPersonalStats,
        fetchPersonalHistory,
        fetchSummary,
        summary: employeeSummary,
        updateEmployee,
        deleteEmployee,
        error
    } = useEmployeeController();

    const currentUser = AuthModel.getCurrentUser();
    const isAdmin = currentUser?.role === 'Admin';
    const userEmployeeId = currentUser?.employeeId;

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const isToday = date === new Date().toISOString().split('T')[0];
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        role: 'Sale Officer',
        cnic: ''
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [timeEditData, setTimeEditData] = useState({
        checkInTime: '',
        checkOutTime: ''
    });

    const handleOpenTimeEdit = (emp) => {
        const formatLocal = (isoStr) => {
            if (!isoStr) return '';
            const d = new Date(isoStr);
            const tzOffset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        };

        setEditingRecord(emp);

        const att = emp.attendance || {};
        setTimeEditData({
            checkInTime: formatLocal(att.checkInTime),
            checkOutTime: formatLocal(att.checkOutTime)
        });
        setShowTimeModal(true);
    };

    const handleTimeEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await editAttendance(editingRecord.attendance._id, {
                checkInTime: timeEditData.checkInTime,
                checkOutTime: timeEditData.checkOutTime
            });
            setShowTimeModal(false);
            fetchDashboardStats();
            alert('Times updated successfully');
        } catch (err) {
            alert(err.message || 'Failed to update times');
        }
    };

    const [editData, setEditData] = useState({
        status: '',
        checkInTime: '',
        checkOutTime: ''
    });

    const [viewMode, setViewMode] = useState('attendance');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeFormData, setEmployeeFormData] = useState({
        name: '',
        email: '',
        role: '',
        phone: '',
        cnic: '',
        address: ''
    });

    useEffect(() => {
        fetchEmployees(date);
        if (isAdmin) {
            fetchDashboardStats();
        } else if (userEmployeeId) {
            fetchPersonalStats(userEmployeeId);
            fetchPersonalHistory(userEmployeeId);
        }
    }, [fetchEmployees, fetchDashboardStats, fetchPersonalStats, fetchPersonalHistory, date, isAdmin, userEmployeeId]);

    const handleMark = async (employeeId, status) => {
        try {
            // Use genuine system time for marks
            await markAttendance({
                employeeId,
                date,
                status,
                checkIn: status === 'Present' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null
            });
            if (isAdmin) {
                fetchDashboardStats();
            } else {
                fetchPersonalStats(userEmployeeId);
                fetchPersonalHistory(userEmployeeId);
            }
            fetchEmployees(date); // Instant refresh for list/buttons
        } catch (err) {
            alert(err.message);
        }
    };

    const handleOpenEdit = async (emp) => {
        const formatLocal = (isoStr) => {
            if (!isoStr) return '';
            const d = new Date(isoStr);
            const tzOffset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        };

        setEditingRecord(emp);

        // Handle "Not Marked" or missing attendance gracefully
        const att = emp.attendance || {};
        setEditData({
            status: (att.status === 'Not Marked' || !att.status) ? 'Present' : att.status,
            checkInTime: formatLocal(att.checkInTime),
            checkOutTime: formatLocal(att.checkOutTime)
        });

        setShowEditModal(true);
        await fetchPersonalHistory(emp._id);
    };

    const formatWorkedHours = (hours) => {
        if (!hours) return '-';
        const totalMinutes = Math.round(parseFloat(hours) * 60);
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        if (hrs === 0) return `${mins}m`;
        if (mins === 0) return `${hrs}h`;
        return `${hrs}h ${mins}m`;
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await editAttendance(editingRecord.attendance._id, editData);
            setShowEditModal(false);
            fetchDashboardStats(); // Refresh stats
            fetchEmployees(date); // Refresh list
            alert('Attendance updated successfully');
        } catch (err) {
            alert(err.message || 'Failed to update');
        }
    };

    const handleAutoMark = async () => {
        if (window.confirm('Mark all remaining employees as Present for today?')) {
            try {
                await autoMarkAllPresent(date);
                fetchDashboardStats();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase());

        if (isAdmin) return matchesSearch;
        return matchesSearch && String(emp._id) === String(userEmployeeId);
    });

    const handleViewProfile = async (emp) => {
        setSelectedEmployee(emp);
        setShowProfileModal(true);
        await Promise.all([
            fetchSummary(emp._id),
            fetchPersonalStats(emp._id)
        ]);
    };

    const handleOpenManage = (emp) => {
        setSelectedEmployee(emp);
        setEmployeeFormData({
            name: emp.name,
            email: emp.email,
            role: emp.role,
            phone: emp.phone || '',
            cnic: emp.cnic || '',
            address: emp.address || '',
            status: emp.status || 'Active'
        });
        setShowManageModal(true);
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        try {
            await updateEmployee(selectedEmployee._id, employeeFormData);
            setShowManageModal(false);
            alert('Employee updated successfully');
            fetchEmployees(date);
        } catch (err) {
            alert(err.message || 'Update failed');
        }
    };

    const handleDeleteEmployee = async () => {
        if (window.confirm(`Are you sure you want to deactivate ${selectedEmployee.name}?`)) {
            try {
                await deleteEmployee(selectedEmployee._id);
                setShowManageModal(false);
                alert('Employee deactivated');
            } catch (err) {
                alert(err.message || 'Deletion failed');
            }
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await createEmployee(formData);
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                address: '',
                phone: '',
                role: 'Sale Officer',
                cnic: ''
            });
            alert('Employee added successfully');
            fetchEmployees(date);
            fetchDashboardStats();
        } catch (err) {
            alert(err.message || 'Failed to add employee');
        }
    };

    useEffect(() => {
        console.log('Employees updated:', employees);
    }, [employees]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{isAdmin ? 'Attendance Registry' : 'My Attendance'}</h1>
                    <p className="text-slate-400">{isAdmin ? 'Track employee attendance and manage records' : 'View your attendance history'}</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    {isAdmin && (
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2 text-sm max-w-[200px]">
                            <Calendar size={18} className="text-slate-400" />
                            <input
                                type="date"
                                className="bg-transparent border-none text-white outline-none w-full"
                                value={date}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    )}
                    {isAdmin && (
                        <button className="premium-btn with-icon" onClick={() => setShowAddModal(true)}>
                            <UserPlus size={18} />
                            <span>Add Employee</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {isAdmin && viewMode === 'employee' ? (
                    <>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                                <Users2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{dashboardStats?.totalEmployees || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">Total Staff</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                                <UserCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{dashboardStats?.activeEmployees || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">Active</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-500/20 text-pink-400">
                                <UserX size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{dashboardStats?.inactiveEmployees || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">Inactive</p>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{isAdmin ? dashboardStats?.presentToday : personalAttendanceStats?.Present || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">Present</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20 text-red-400">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{isAdmin ? dashboardStats?.absentToday : personalAttendanceStats?.Absent || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">Absent</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{isAdmin ? dashboardStats?.lateToday : personalAttendanceStats?.Late || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">Late</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-400">
                                <UserCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{isAdmin ? dashboardStats?.leaveToday : personalAttendanceStats?.Leave || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">On Leave</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 text-white">{isAdmin ? dashboardStats?.halfDayToday : personalAttendanceStats?.HalfDay || 0}</h3>
                                <p className="text-xs text-slate-400 font-medium">Half Day</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Main Content Card */}
            <motion.div className="glass-card overflow-hidden">
                {isAdmin && (
                    <div className="flex border-b border-white/10 bg-slate-900/20">
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all ${viewMode === 'attendance' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setViewMode('attendance')}
                        >
                            <Calendar size={16} />
                            Attendance Registry
                        </button>
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all ${viewMode === 'employee' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setViewMode('employee')}
                        >
                            <Users2 size={16} />
                            Employee Database
                        </button>
                    </div>
                )}

                {error && (
                    <div className="m-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/10">
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2 text-sm w-full max-w-[350px]">
                        <Search size={20} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder={isAdmin ? 'Search employee or role...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-white outline-none w-full placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Employee List */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
                            <div className="w-5 h-5 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
                            <span>Loading...</span>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
                            <Users2 size={40} className="opacity-50" />
                            <p>{isAdmin ? 'No employees found' : 'No records'}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col bg-slate-900/10 w-full overflow-x-auto">
                            <div className="min-w-[800px] grid grid-cols-[2fr_1.2fr_1.2fr_1.5fr_1fr] gap-4 p-4 md:p-6 border-b-2 border-white/10 text-xs font-bold uppercase text-indigo-400 tracking-wider">
                                <span>Employee</span>
                                <span>Role</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            {filteredEmployees.map((emp, i) => (
                                <motion.div
                                    key={emp._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="min-w-[800px] grid grid-cols-[2fr_1.2fr_1.2fr_1.5fr_1fr] gap-4 p-4 md:p-6 border-b border-white/5 items-center hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex flex-col justify-center">
                                        <div className="font-semibold text-white text-sm">{emp.name}</div>
                                    </div>
                                    <span className="text-sm text-slate-300">{emp.role}</span>
                                    <span className="flex items-center">
                                        {viewMode === 'employee' ? (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border ${emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                    emp.status === 'Blocked' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                        'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                                }`}>
                                                {emp.status || 'Active'}
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border ${(emp.attendance?.status || 'Not Marked') === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                    (emp.attendance?.status || 'Not Marked') === 'Absent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                        (emp.attendance?.status || 'Not Marked') === 'Late' ? 'bg-orange-400/20 text-orange-400 border-orange-400/30' :
                                                            (emp.attendance?.status || 'Not Marked') === 'Leave' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                                'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                                }`}>
                                                {emp.attendance?.status || 'Not Marked'}
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {isAdmin ? (
                                            viewMode === 'attendance' ? (
                                                <>
                                                    <button
                                                        onClick={() => emp.status === 'Active' && handleMark(emp._id, 'Present')}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-emerald-400 hover:bg-emerald-500/20 text-slate-400"
                                                        title="Mark Present"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => emp.status === 'Active' && handleMark(emp._id, 'Absent')}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-red-400 hover:bg-red-500/20 text-slate-400"
                                                        title="Mark Absent"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(emp)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-white hover:bg-white/10 text-slate-400"
                                                        title="Edit History"
                                                    >
                                                        <History size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="text-indigo-400 flex items-center gap-1 text-sm font-semibold hover:text-indigo-300 transition-colors"
                                                    onClick={() => handleViewProfile(emp)}
                                                >
                                                    View Profile
                                                </button>
                                            )
                                        ) : (
                                            (emp._id === userEmployeeId && isToday) && (
                                                !emp.attendance?.checkOutTime ? (
                                                    <button
                                                        onClick={() => handleMark(emp._id, null)}
                                                        className="premium-btn text-xs px-3 py-1.5"
                                                    >
                                                        {!emp.attendance || emp.attendance.status === 'Not Marked' ? 'Check In' : 'Check Out'}
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-slate-500">Completed</span>
                                                )
                                            )
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Personal History Section */}
            {!isAdmin && personalHistory.length > 0 && (
                <motion.div className="glass-card overflow-hidden p-6">
                    <div className="flex flex-col gap-1 mb-6">
                        <h3 className="text-lg font-bold text-white">Personal Attendance History</h3>
                        <p className="text-sm text-slate-400">Last 30 days of activity</p>
                    </div>
                    <div className="flex flex-col bg-slate-900/20 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 text-xs font-bold uppercase text-indigo-400 tracking-wider">
                            <span>Date</span>
                            <span>Status</span>
                            <span>Time In</span>
                            <span>Time Out</span>
                            <span>Hours</span>
                        </div>
                        {personalHistory.map((rec, i) => (
                            <div key={rec._id} className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors last:border-0">
                                <span className="text-sm text-slate-300">{new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="flex items-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${(rec.status || 'Not Marked') === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        (rec.status || 'Not Marked') === 'Absent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            (rec.status || 'Not Marked') === 'Late' ? 'bg-orange-400/20 text-orange-400 border-orange-400/30' :
                                                'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                        }`}>
                                        {rec.status}
                                    </span>
                                </span>
                                <span className="text-sm text-slate-300 font-mono">{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                <span className="text-sm text-slate-300 font-mono">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                <span className="text-sm font-semibold text-white">{formatWorkedHours(rec.totalHours)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {showEditModal && (
                    <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">Attendance History: {editingRecord?.name}</h2>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                            </div>

                            <div className="py-2">
                                <p className="text-sm text-slate-400 mb-4">Last 30 days of activity</p>
                                <div className="flex flex-col bg-slate-900/20 rounded-xl overflow-hidden border border-white/5">
                                    <div className="grid grid-cols-5 gap-2 p-3 border-b border-white/10 text-xs font-bold uppercase text-indigo-400 tracking-wider">
                                        <span>Date</span>
                                        <span>Status</span>
                                        <span>In</span>
                                        <span>Out</span>
                                        <span>Hrs</span>
                                    </div>
                                    {personalHistory.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            <span>No records found</span>
                                        </div>
                                    ) : (
                                        personalHistory.map((rec, i) => (
                                            <div key={rec._id} className="grid grid-cols-5 gap-2 p-3 border-b border-white/5 items-center last:border-0 hover:bg-white/5 text-sm">
                                                <span className="text-slate-300">{new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                                                <span className={`${rec.status === 'Present' ? 'text-emerald-400' :
                                                    rec.status === 'Absent' ? 'text-red-400' :
                                                        'text-slate-400'
                                                    } font-medium`}>{rec.status}</span>
                                                <span className="text-slate-400 font-mono text-xs">{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                                <span className="text-slate-400 font-mono text-xs">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                                <span className="text-white font-medium">{formatWorkedHours(rec.totalHours)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-4">
                                <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/10 transition-colors bg-white/5" onClick={() => setShowEditModal(false)}>Close Window</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">Add New Employee</h2>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" onClick={() => setShowAddModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddSubmit} className="py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Users2 size={16} /> Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Mail size={16} /> Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Lock size={16} /> Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Phone size={16} /> Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="0300-1234567"
                                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><CreditCard size={16} /> CNIC</label>
                                        <input
                                            type="text"
                                            value={formData.cnic}
                                            onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                                            placeholder="35201-XXXXXXX-X"
                                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Shield size={16} /> Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                        >
                                            <option value="Sale Officer" className="bg-slate-900">Sale Officer</option>
                                            <option value="Inquiry Officer" className="bg-slate-900">Inquiry Officer</option>
                                            <option value="Delivery Officer" className="bg-slate-900">Delivery Officer</option>
                                            <option value="CRC Officer" className="bg-slate-900">CRC Officer</option>
                                            <option value="Admin" className="bg-slate-900">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><MapPin size={16} /> Residential Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Enter full address"
                                            rows="3"
                                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                                    <button type="button" className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/10 transition-colors bg-white/5" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-lg shadow-indigo-500/20" disabled={loading}>
                                        {loading ? 'Adding...' : 'Save Employee'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showProfileModal && (
                    <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedEmployee?.name}</h2>
                                    <p className="text-sm text-slate-400">{selectedEmployee?.role} • Joined {selectedEmployee?.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" onClick={() => setShowProfileModal(false)}><X /></button>
                            </div>

                            <div className="py-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-white flex items-center justify-center">
                                                <TrendingUp size={20} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Rs. {employeeSummary?.sales?.reduce((acc, s) => acc + s.amount, 0).toLocaleString() || 0}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-white flex items-center justify-center">
                                                <CreditCard size={20} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Rs. {employeeSummary?.recovery?.amount?.toLocaleString() || 0}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-white flex items-center justify-center">
                                                <Calendar size={20} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{personalAttendanceStats?.Present || 0}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Days</p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-sm text-white bg-white/5 p-3 rounded-lg border border-white/5">
                                        <Mail size={16} className="text-slate-400" />
                                        <span>{selectedEmployee?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white bg-white/5 p-3 rounded-lg border border-white/5">
                                        <Phone size={16} className="text-slate-400" />
                                        <span>{selectedEmployee?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white bg-white/5 p-3 rounded-lg border border-white/5">
                                        <CreditCard size={16} className="text-slate-400" />
                                        <span>{selectedEmployee?.cnic || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white bg-white/5 p-3 rounded-lg border border-white/5">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span>{selectedEmployee?.address || 'No address'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                                <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/10 transition-colors bg-white/5" onClick={() => setShowProfileModal(false)}>Close Profile</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showManageModal && (
                    <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">Manage Employee: {selectedEmployee?.name}</h2>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" onClick={() => setShowManageModal(false)}><X /></button>
                            </div>
                            <form onSubmit={handleUpdateEmployee} className="py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Users2 size={16} /> Full Name</label>
                                        <input type="text" value={employeeFormData.name} onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })} required className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Shield size={16} /> Role</label>
                                        <select value={employeeFormData.role} onChange={(e) => setEmployeeFormData({ ...employeeFormData, role: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
                                            <option value="Sale Officer" className="bg-slate-900">Sale Officer</option>
                                            <option value="Inquiry Officer" className="bg-slate-900">Inquiry Officer</option>
                                            <option value="Delivery Officer" className="bg-slate-900">Delivery Officer</option>
                                            <option value="CRC Officer" className="bg-slate-900">CRC Officer</option>
                                            <option value="Admin" className="bg-slate-900">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Phone size={16} /> Phone</label>
                                        <input type="text" value={employeeFormData.phone} onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><AlertCircle size={16} /> Account Status</label>
                                        <select value={employeeFormData.status} onChange={(e) => setEmployeeFormData({ ...employeeFormData, status: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
                                            <option value="Active" className="bg-slate-900">Active</option>
                                            <option value="Inactive" className="bg-slate-900">Inactive</option>
                                            <option value="Blocked" className="bg-slate-900">Blocked</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><MapPin size={16} /> Address</label>
                                        <textarea value={employeeFormData.address} onChange={(e) => setEmployeeFormData({ ...employeeFormData, address: e.target.value })} rows="3" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 resize-none" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                                    <button type="button" className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/10 transition-colors bg-white/5" onClick={() => setShowManageModal(false)}>Cancel</button>
                                    <button type="button" className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-colors" onClick={handleDeleteEmployee}>Deactivate Employee</button>
                                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-lg shadow-indigo-500/20">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showTimeModal && (
                    <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto relative p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">Edit Times: {editingRecord?.name}</h2>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" onClick={() => setShowTimeModal(false)}><X /></button>
                            </div>
                            <form onSubmit={handleTimeEditSubmit} className="py-2">
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Clock size={16} /> Check-In Time</label>
                                            <button
                                                type="button"
                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                                                onClick={() => {
                                                    const d = new Date();
                                                    const offset = d.getTimezoneOffset() * 60000;
                                                    setTimeEditData({ ...timeEditData, checkInTime: new Date(d.getTime() - offset).toISOString().slice(0, 16) });
                                                }}
                                            >
                                                Use System Time
                                            </button>
                                        </div>
                                        <input type="datetime-local" value={timeEditData.checkInTime} onChange={(e) => setTimeEditData({ ...timeEditData, checkInTime: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <label className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Clock size={16} /> Check-Out Time</label>
                                            <button
                                                type="button"
                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                                                onClick={() => {
                                                    const d = new Date();
                                                    const offset = d.getTimezoneOffset() * 60000;
                                                    setTimeEditData({ ...timeEditData, checkOutTime: new Date(d.getTime() - offset).toISOString().slice(0, 16) });
                                                }}
                                            >
                                                Use System Time
                                            </button>
                                        </div>
                                        <input type="datetime-local" value={timeEditData.checkOutTime} onChange={(e) => setTimeEditData({ ...timeEditData, checkOutTime: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                                    <button type="button" className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/10 transition-colors bg-white/5" onClick={() => setShowTimeModal(false)}>Cancel</button>
                                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-lg shadow-indigo-500/20">Save Times</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Attendance;
