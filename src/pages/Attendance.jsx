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
    Briefcase
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
    const [editData, setEditData] = useState({
        status: '',
        checkInTime: '',
        checkOutTime: ''
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

    const handleOpenEdit = (emp) => {
        if (!emp.attendance || emp.attendance.status === 'Not Marked') {
            alert("No attendance record to edit yet. Mark them Present/Absent first.");
            return;
        }

        const formatLocal = (isoStr) => {
            if (!isoStr) return '';
            const d = new Date(isoStr);
            const tzOffset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        };

        setEditingRecord(emp);
        setEditData({
            status: emp.attendance.status,
            checkInTime: formatLocal(emp.attendance.checkInTime),
            checkOutTime: formatLocal(emp.attendance.checkOutTime)
        });
        setShowEditModal(true);
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
            className="attendance-page"
        >
            <div className="page-header">
                <div>
                    <h1>{isAdmin ? `Attendance Registry (${employees.length})` : 'My Attendance Dashboard'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
                        {isAdmin ? 'Personnel tracking and shift management' : (isToday ? 'Your daily check-in and shift record' : 'Historical record view')}
                    </div>
                </div>
                <div className="header-actions">
                    {isAdmin && (
                        <div className="date-selector glass-card">
                            <Calendar size={18} />
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

            <div className="attendance-stats">
                <div className="stat-plate glass-card">
                    <div className="plate-icon green"><CheckCircle2 /></div>
                    <div className="plate-data">
                        <span className="val">{isAdmin ? (dashboardStats?.presentToday || 0) : (personalAttendanceStats?.Present || 0)}</span>
                        <span className="lab">Present</span>
                    </div>
                </div>
                <div className="stat-plate glass-card">
                    <div className="plate-icon red"><XCircle /></div>
                    <div className="plate-data">
                        <span className="val">{isAdmin ? (dashboardStats?.absentToday || 0) : (personalAttendanceStats?.Absent || 0)}</span>
                        <span className="lab">Absent</span>
                    </div>
                </div>
                <div className="stat-plate glass-card">
                    <div className="plate-icon yellow"><Clock /></div>
                    <div className="plate-data">
                        <span className="val">{isAdmin ? (dashboardStats?.lateToday || 0) : (personalAttendanceStats?.Late || 0)}</span>
                        <span className="lab">Late</span>
                    </div>
                </div>
                {!isAdmin && (
                    <>
                        <div className="stat-plate glass-card">
                            <div className="plate-icon orange" style={{ background: 'rgba(255, 126, 0, 0.1)', color: '#ff7e00' }}><ArrowRightLeft /></div>
                            <div className="plate-data">
                                <span className="val">{personalAttendanceStats?.['Half Day'] || 0}</span>
                                <span className="lab">Half Day</span>
                            </div>
                        </div>
                        <div className="stat-plate glass-card">
                            <div className="plate-icon purple" style={{ background: 'rgba(163, 58, 255, 0.1)', color: '#a33aff' }}><UserCircle2 /></div>
                            <div className="plate-data">
                                <span className="val">{personalAttendanceStats?.Leave || 0}</span>
                                <span className="lab">Leave</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="glass-card attendance-container">
                {error && (
                    <div className="error-banner" style={{ padding: '16px', color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', borderBottom: '1px solid rgba(255, 77, 79, 0.2)' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                <div className="table-header-custom">
                    {isAdmin ? (
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search employee or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div style={{ padding: '10px 0' }}>
                            {!userEmployeeId && (
                                <div className="error-banner" style={{ margin: 0, borderRadius: '8px', fontSize: '12px' }}>
                                    <AlertCircle size={14} /> Warning: Employee ID missing. Please log out and back in.
                                </div>
                            )}
                        </div>
                    )}
                    {isAdmin && (
                        <div className="quick-actions">
                            <button className="text-btn" onClick={handleAutoMark}>Auto-Mark All Present</button>
                        </div>
                    )}
                </div>

                <div className="employee-list">
                    {loading ? (
                        <div className="no-data">Loading employees...</div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="no-data">
                            {isAdmin ? 'No employees found matching your search.' : 'You do not have a shift record for this date.'}
                        </div>
                    ) : (
                        filteredEmployees.map((emp, i) => (
                            <motion.div
                                key={emp._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="employee-row"
                            >
                                <div className="emp-info">
                                    <div className="emp-avatar">{emp.name[0]}</div>
                                    <div>
                                        <div className="emp-name">{emp.name}</div>
                                        <div className="emp-role">{emp.role} {emp.phone ? `• ${emp.phone}` : ''}</div>
                                    </div>
                                </div>

                                <div className="emp-times">
                                    {(!isAdmin && String(emp._id) === String(userEmployeeId)) ? (
                                        // Simplified for the logged-in user as they have big badges below
                                        <div className="status-badge" data-status={emp.attendance?.status || 'Not Marked'}>
                                            {emp.attendance?.status || 'Not Marked'}
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className="status-badge"
                                                data-status={emp.attendance?.status || 'Not Marked'}
                                                onClick={() => isAdmin && handleOpenEdit(emp)}
                                                style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                                                title={isAdmin ? "Click to edit" : ""}
                                            >
                                                {emp.attendance?.status || 'Not Marked'}
                                                {emp.attendance?.status !== 'Not Marked' && <Clock size={10} style={{ marginLeft: '6px', opacity: 0.6 }} />}
                                            </div>
                                            {emp.attendance?.checkInTime && (
                                                <div className="time-val" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                                    <span>In: {new Date(emp.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {emp.attendance?.checkOutTime && <span>Out: {new Date(emp.attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="emp-actions">
                                    {isAdmin ? (
                                        <>
                                            <button
                                                onClick={() => handleMark(emp._id, 'Present')}
                                                className={`status-btn present ${emp.attendance?.status === 'Present' ? 'active' : ''}`}
                                            >
                                                Mark Present
                                            </button>
                                            <button
                                                onClick={() => handleMark(emp._id, 'Absent')}
                                                className={`status-btn absent ${emp.attendance?.status === 'Absent' ? 'active' : ''}`}
                                            >
                                                Absent
                                            </button>
                                        </>
                                    ) : (emp._id === userEmployeeId && isToday) ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            {(!emp.attendance || emp.attendance.status === 'Not Marked') ? (
                                                <button
                                                    onClick={() => handleMark(emp._id, 'Present')}
                                                    className="status-btn present"
                                                >
                                                    Check In
                                                </button>
                                            ) : !emp.attendance.checkOutTime ? (
                                                <>
                                                    <div className="time-val-display">
                                                        <span className="label">IN</span>
                                                        <span className="time">{new Date(emp.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMark(emp._id, 'Present')}
                                                        className="status-btn absent"
                                                    >
                                                        Check Out
                                                    </button>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <div className="time-val-display completed">
                                                        <span className="label">IN</span>
                                                        <span className="time">{new Date(emp.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="time-val-display completed">
                                                        <span className="label">OUT</span>
                                                        <span className="time">{new Date(emp.attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    {emp.attendance?.totalHours && (
                                                        <div className="time-val-display worked">
                                                            <span className="label">WORKED</span>
                                                            <span className="time">{formatWorkedHours(emp.attendance.totalHours)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {!isToday && emp._id === userEmployeeId ? 'History View Only' : 'View Only'}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {!isAdmin && personalHistory.length > 0 && (
                <div className="glass-card history-section" style={{ marginTop: '30px' }}>
                    <div className="history-header">
                        <h2>Personal Attendance History</h2>
                        <p>Last 30 days of activity</p>
                    </div>
                    <div className="history-list">
                        <div className="history-row header">
                            <span>Date</span>
                            <span>Status</span>
                            <span>Time In</span>
                            <span>Time Out</span>
                            <span>Hours</span>
                        </div>
                        {personalHistory.map((rec, i) => (
                            <div key={rec._id} className="history-row">
                                <span className="date-val">{new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="status-val">
                                    <div className="status-badge" data-status={rec.status} style={{ fontSize: '10px', height: '24px' }}>
                                        {rec.status}
                                    </div>
                                </span>
                                <span className="time-val">{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                <span className="time-val">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                <span className="time-val">{formatWorkedHours(rec.totalHours)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showEditModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content glass-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="modal-header">
                                <h2>Edit Attendance: {editingRecord?.name}</h2>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}><X /></button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="add-emp-form">
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label><Shield size={16} /> Status</label>
                                        <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                            <option value="Late">Late</option>
                                            <option value="Half Day">Half Day</option>
                                            <option value="Leave">Leave</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0 }}><Clock size={16} /> Check-In Time</label>
                                            <button
                                                type="button"
                                                className="text-btn"
                                                style={{ fontSize: '10px', padding: '2px 8px', height: 'auto' }}
                                                onClick={() => {
                                                    const d = new Date();
                                                    const offset = d.getTimezoneOffset() * 60000;
                                                    setEditData({ ...editData, checkInTime: new Date(d.getTime() - offset).toISOString().slice(0, 16) });
                                                }}
                                            >
                                                Use System Time
                                            </button>
                                        </div>
                                        <input type="datetime-local" value={editData.checkInTime} onChange={(e) => setEditData({ ...editData, checkInTime: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0 }}><Clock size={16} /> Check-Out Time</label>
                                            <button
                                                type="button"
                                                className="text-btn"
                                                style={{ fontSize: '10px', padding: '2px 8px', height: 'auto' }}
                                                onClick={() => {
                                                    const d = new Date();
                                                    const offset = d.getTimezoneOffset() * 60000;
                                                    setEditData({ ...editData, checkOutTime: new Date(d.getTime() - offset).toISOString().slice(0, 16) });
                                                }}
                                            >
                                                Use System Time
                                            </button>
                                        </div>
                                        <input type="datetime-local" value={editData.checkOutTime} onChange={(e) => setEditData({ ...editData, checkOutTime: e.target.value })} />
                                    </div>
                                </div>
                                <div className="modal-actions" style={{ marginTop: '40px' }}>
                                    <button type="button" className="text-btn" style={{ padding: '12px 24px' }} onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="premium-btn" style={{ minWidth: '180px' }}>Update Record</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content glass-card"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <div className="modal-header">
                                <h2>Add New Employee</h2>
                                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddSubmit} className="add-emp-form">
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label><Users2 size={16} /> Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Mail size={16} /> Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Lock size={16} /> Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Phone size={16} /> Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="0300-1234567"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><CreditCard size={16} /> CNIC</label>
                                        <input
                                            type="text"
                                            value={formData.cnic}
                                            onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                                            placeholder="35201-XXXXXXX-X"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Shield size={16} /> Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="Sale Officer">Sale Officer</option>
                                            <option value="Inquiry Officer">Inquiry Officer</option>
                                            <option value="Delivery Officer">Delivery Officer</option>
                                            <option value="CRC Officer">CRC Officer</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="input-group full-width">
                                        <label><MapPin size={16} /> Residential Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Enter full address"
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="text-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="premium-btn" disabled={loading}>
                                        {loading ? 'Adding...' : 'Save Employee'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        .attendance-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .today-badge {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          padding: 4px 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: inline-flex;
          align-items: center;
        }
        .header-actions { display: flex; gap: 16px; }
        .date-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-radius: 12px;
        }
        .date-selector input {
          background: none;
          border: none;
          color: white;
          outline: none;
          font-family: inherit;
        }
        
        .attendance-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }
        .stat-plate {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .plate-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .plate-icon.green { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .plate-icon.red { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .plate-icon.yellow { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
        .plate-data { display: flex; flex-direction: column; }
        .plate-data .val { font-size: 24px; font-weight: 700; }
        .plate-data .lab { font-size: 13px; color: var(--text-muted); }

        .attendance-container { padding: 0; overflow: hidden; }
        .table-header-custom {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 18px;
          border-radius: 14px;
          width: 340px;
          transition: all 0.3s ease;
        }
        .search-box:focus-within {
          background: rgba(255, 255, 255, 0.07);
          border-color: var(--primary);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .search-box input {
          background: none;
          border: none;
          color: white;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          width: 100%;
        }
        .search-box input::placeholder { color: var(--text-muted); }
        .search-box svg { color: var(--text-muted); transition: color 0.3s; }
        .search-box:focus-within svg { color: var(--primary); }

        .employee-list { display: flex; flex-direction: column; }
        .employee-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          padding: 20px 24px;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          transition: background 0.3s;
        }
        .employee-row:hover { background: rgba(255, 255, 255, 0.02); }
        
        .emp-info { display: flex; gap: 16px; align-items: center; }
        .emp-avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .emp-name { font-weight: 600; }
        .emp-role { font-size: 12px; color: var(--text-muted); }
        
        .emp-times { display: flex; align-items: center; gap: 12px; }
        .time-block { display: flex; flex-direction: column; }
        .time-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
        .time-val { font-size: 13px; font-weight: 600; }
        
        .emp-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .status-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .status-btn.present {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.2);
        }
        .status-btn.present:hover, .status-btn.present.active { 
          background: rgba(16, 185, 129, 0.3); 
          border-color: #34d399;
        }
        .status-btn.absent {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }
        .status-btn.absent:hover, .status-btn.absent.active { 
          background: rgba(239, 68, 68, 0.3); 
          border-color: #f87171;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-badge[data-status="Present"] { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .status-badge[data-status="Absent"] { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .status-badge[data-status="Late"] { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .status-badge[data-status="Not Marked"] { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); }

        .no-data {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          font-style: italic;
        }

        .time-val-display {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .time-val-display .label {
          font-size: 9px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.5px;
          line-height: 1;
          margin-bottom: 2px;
        }
        .time-val-display .time {
          font-size: 13px;
          font-weight: 700;
          color: white;
          line-height: 1;
        }
        .time-val-display.completed {
          background: rgba(255, 255, 255, 0.03);
          border-color: transparent;
        }
        .time-val-display.completed .label {
          color: var(--text-muted);
        }
        .time-val-display.worked {
          background: rgba(37, 99, 235, 0.1);
          border-color: rgba(37, 99, 235, 0.2);
        }
        .time-val-display.worked .label {
          color: var(--primary);
        }

        .history-section {
          padding: 24px;
        }
        .history-header {
          margin-bottom: 20px;
        }
        .history-header h2 {
          font-size: 18px;
          color: white;
          margin-bottom: 4px;
        }
        .history-header p {
          font-size: 12px;
          color: var(--text-muted);
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .history-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
          padding: 14px 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          align-items: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        .history-row.header {
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 1px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }
        .history-row .date-val {
          color: white;
          font-weight: 600;
        }
        .history-row:last-child {
          border-bottom: none;
        }
        .history-row:not(.header):hover {
          background: rgba(255, 255, 255, 0.02);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          width: 100%;
          max-width: 650px;
          padding: 32px;
          position: relative;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h2 { margin: 0; font-size: 1.5rem; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .close-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }

        .add-emp-form .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full-width { grid-column: span 2; }
        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-muted);
        }
        .input-group input, .input-group select, .input-group textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .input-group input:focus, .input-group select:focus, .input-group textarea:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .input-group textarea { height: 80px; resize: none; }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
        }
      `}} />
        </motion.div>
    );
};

export default Attendance;
