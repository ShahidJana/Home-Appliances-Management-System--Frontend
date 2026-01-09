import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Truck,
  Users2,
  LineChart,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { AuthModel } from '../services/AuthModel';

const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const user = AuthModel.getCurrentUser();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Sales & Plans', icon: FileText, path: '/plans' },
    { name: 'Vendors', icon: Truck, path: '/vendors' },
    { name: 'Employees & Attendance', icon: Users2, path: '/attendance' },
    { name: 'Reports', icon: LineChart, path: '/reports' },
  ];

  const handleLogout = () => {
    AuthModel.logout();
    window.location.href = '/login';
  };

  return (
    <div className={`sidebar glass-card ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon">K</div>
        <div className="logo-text">
          <h3>Karim</h3>
          <span>Electronics</span>
        </div>
        <button className="mobile-only close-sidebar" onClick={toggle}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => window.innerWidth < 1024 && toggle()}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
            {location.pathname === item.path && <div className="active-glow" />}
          </Link>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'Admin'}</p>
            <p className="user-role">{user?.role || 'Senior Officer'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar {
          width: 280px;
          height: calc(100vh - 40px);
          margin: 20px;
          display: flex;
          flex-direction: column;
          padding: 24px 12px;
          position: sticky;
          top: 20px;
          z-index: 1001;
        }
        .close-sidebar {
          margin-left: auto;
          background: none;
          border: none;
          color: white;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          margin-bottom: 40px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
        }
        .logo-text h3 {
          font-size: 18px;
          line-height: 1;
        }
        .logo-text span {
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          position: relative;
          transition: all 0.3s ease;
        }
        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.04);
        }
        .nav-item.active {
          color: white;
          background: rgba(99, 102, 241, 0.1);
        }
        .active-glow {
          position: absolute;
          left: 0;
          width: 4px;
          height: 50%;
          background: var(--primary);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px var(--primary);
        }
        .sidebar-user {
          margin-top: 20px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        .user-name {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }
        .user-role {
          font-size: 11px;
          color: var(--text-muted);
          margin: 0;
        }
        .logout-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          transition: color 0.3s;
        }
        .logout-btn:hover {
          color: var(--danger);
        }
        @media (min-width: 1025px) {
          .mobile-only { display: none; }
        }
        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: -300px;
            top: 0;
            margin: 0;
            height: 100vh;
            border-radius: 0;
            transition: left 0.3s ease-in-out;
          }
          .sidebar.mobile-open {
            left: 0;
          }
        }
      `}} />
    </div>
  );
};

const Header = ({ toggleSidebar }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="main-header">
      <div className="header-left">
        <button className="burger-menu" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <input type="text" placeholder="Quick Search (IMEI, CNIC, Phone...)" className="input-field" />
        </div>
      </div>
      <div className="header-actions">
        <button className="action-btn"><Bell size={20} /></button>
        <div className="date-display">
          <span className="time-part">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="date-sep">•</span>
          <span className="date-part">{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }
        .date-sep {
          margin: 0 8px;
          opacity: 0.5;
        }
        .time-part {
          color: white;
          font-weight: 700;
        }
        .burger-menu {
          display: none;
          background: none;
          border: none;
          color: white;
        }
        .search-bar {
          width: 100%;
          max-width: 400px;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .action-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .date-display {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          background: rgba(255, 255, 255, 0.03);
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        @media (max-width: 1024px) {
          .burger-menu { display: block; }
          .main-header { padding: 16px 20px; }
        }
      `}} />
    </header>
  );
};

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-root">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <main className="page-body">
          {children}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .layout-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg-main);
          position: relative;
        }
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .page-body {
          padding: 0 40px 40px 40px;
          flex: 1;
        }
        @media (max-width: 768px) {
          .page-body { padding: 0 16px 16px 16px; }
        }
      `}} />
    </div>
  );
};

export default MainLayout;
