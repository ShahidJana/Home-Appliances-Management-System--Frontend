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
  X,
  Calendar,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { AuthModel } from '../services/AuthModel';

import logo from '../assets/Karim_electronic_logo.svg';

const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const user = AuthModel.getCurrentUser();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'POS', icon: FileText, path: '/pos' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Vendors', icon: Truck, path: '/vendors' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Installment Plans', icon: FileText, path: '/plans' },
    {
      name: 'HR Management',
      icon: Users2,
      path: '/attendance?view=attendance',
      children: [
        { name: 'Attendance', path: '/attendance?view=attendance', icon: Calendar },
        { name: 'Employees', path: '/attendance?view=employee', icon: Users }
      ]
    },
    { name: 'Reports', icon: LineChart, path: '/reports' },
    { name: 'Financials', icon: DollarSign, path: '/transactions' },
    { name: 'Claims', icon: FileText, path: '/claims' },
  ];

  const [expandedItems, setExpandedItems] = useState([]);

  // Removed automatic expansion to keep dropdowns closed by default
  /*
  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.children?.some(c => location.pathname + location.search === c.path)) {
        if (!expandedItems.includes(item.name)) {
          setExpandedItems(prev => [...prev, item.name]);
        }
      }
    });
  }, [location.pathname, location.search]);
  */

  const toggleExpand = (name, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedItems(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleLogout = () => {
    AuthModel.logout();
    window.location.href = '/login';
  };

  return (
    <div className={`
        fixed lg:sticky top-0 lg:top-5 h-screen lg:h-[calc(100vh-40px)] 
        w-[280px] lg:m-5 z-[1001] transition-all duration-300 ease-in-out
        glass-card flex flex-col p-6
        ${isOpen ? 'left-0 rounded-none' : '-left-[300px] lg:left-0'}
    `}>
      <div className="flex-shrink-0 flex items-center gap-3 mb-8 overflow-hidden">
        <div className="w-full flex items-center justify-center overflow-hidden">
          <img src={logo} alt="Karim Electronics" className="w-[200px] h-auto object-contain" />
        </div>
        <button className="lg:hidden ml-auto text-white hover:bg-white/10 p-1 rounded-lg transition-colors absolute right-4 top-10" onClick={toggle}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
        {menuItems.map((item) => {
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = !!item.children;
          const isParentActive = location.pathname === item.path || (hasChildren && item.children.some(c => location.pathname + location.search === c.path));

          return (
            <React.Fragment key={item.name}>
              {hasChildren ? (
                <div className="flex flex-col gap-1">
                  <Link
                    to={item.path}
                    onClick={() => {
                      window.innerWidth < 1024 && toggle();
                      if (!isExpanded) setExpandedItems(prev => [...prev, item.name]);
                    }}
                    className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl relative transition-all duration-300
                        ${isParentActive
                        ? 'text-white bg-indigo-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <item.icon size={20} />
                    <span className="font-medium flex-1">{item.name}</span>
                    <button
                      onClick={(e) => toggleExpand(item.name, e)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`}
                      />
                    </button>
                    {isParentActive && (
                      <div className="absolute left-0 w-1.5 h-1/2 bg-indigo-500 rounded-r-md shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    )}
                  </Link>
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggle()}
                  className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl relative transition-all duration-300
                      ${location.pathname === item.path
                      ? 'text-white bg-indigo-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                  {location.pathname === item.path && (
                    <div className="absolute left-0 w-1 h-1/2 bg-indigo-500 rounded-r-md shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  )}
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="flex flex-col gap-1 ml-9 border-l-2 border-white/5 pl-2 my-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.path}
                      onClick={() => window.innerWidth < 1024 && toggle()}
                      className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300
                          ${location.pathname + location.search === child.path
                          ? 'text-white bg-white/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'}
                      `}
                    >
                      {child.icon && <child.icon size={14} />}
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="flex-shrink-0 mt-5 p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-white">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{user?.role || 'Senior Officer'}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageInfo = () => {
    const search = location.search;
    const path = location.pathname;

    if (path === '/attendance') {
      if (search.includes('view=employee')) return { title: 'Employee Management', subtitle: 'Manage staff and employee profiles' };
      return { title: 'Attendance', subtitle: 'Track daily employee attendance records' };
    }
    if (path === '/pos') return { title: 'Point of Sale', subtitle: 'Create new sales and installment plans' };
    if (path === '/plans') return { title: 'Installment Plans', subtitle: 'Monitor active contracts and recovery schedules' };
    if (path === '/vendors') return { title: 'Vendor Management', subtitle: 'Manage suppliers and purchase sources' };
    if (path === '/customers') return { title: 'Customer Management', subtitle: 'Manage and monitor customer records' };
    if (path === '/inventory') return { title: 'Inventory Management', subtitle: 'Real-time stock management and valuation' };
    if (path === '/reports') return { title: 'Reports & Analytics', subtitle: 'Financial analytics and operational performance auditing' };
    if (path === '/transactions') return { title: 'Financial Management', subtitle: 'Track all inflows, expenses, salaries and purchase payments' };
    if (path === '/claims') return { title: 'Claims Management', subtitle: 'Manage and monitor claims' };
    return { title: 'Dashboard', subtitle: 'Statistics overview' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="sticky top-0 z-[1000] flex justify-between items-center px-4 py-4 mb-2 lg:px-6 lg:py-6 bg-[#0f172a]/70 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{title}</h1>
          <p className="text-[12px] md:text-base text-slate-400 font-medium tracking-wider">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800/40 border border-white/10 text-white hover:bg-white/10 transition-colors">
          <Bell size={20} />
        </button>
        <div className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
          <span className="text-white font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="opacity-50">•</span>
          <span>{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
};

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-5 pb-5 lg:px-10 lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
