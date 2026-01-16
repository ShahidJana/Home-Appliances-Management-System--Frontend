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
    { name: 'Vendors', icon: Truck, path: '/vendors' },
    { name: 'Employees & Attendance', icon: Users2, path: '/attendance' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Sales & Plans', icon: FileText, path: '/plans' },
    { name: 'Reports', icon: LineChart, path: '/reports' },
  ];

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
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/20">K</div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold leading-none text-white">Karim</h3>
          <span className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Electronics</span>
        </div>
        <button className="lg:hidden ml-auto text-white hover:bg-white/10 p-1 rounded-lg transition-colors" onClick={toggle}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
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
        ))}
      </nav>

      <div className="mt-5 p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
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
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex justify-between items-center px-5 py-5 lg:px-10 lg:py-8 lg:mb-2">
      <div className="flex items-center gap-5 flex-1">
        <button className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
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
