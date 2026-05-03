import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Database,
  LogOut,
  Users,
  LayoutDashboard,
  Info,
  BookOpen,
  ChevronRight,
  Settings,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bpd', label: 'Database BPD', icon: Database },
    { to: '/information', label: 'Informasi', icon: Info },
    ...(user?.role === 'SUPERADMIN' ? [{ to: '/users', label: 'Manajemen User', icon: Users }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-primary/10 selection:text-primary overflow-hidden">
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] transition-opacity duration-500 lg:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-80 bg-white shadow-2xl flex flex-col 
        transition-transform duration-500 ease-out lg:shadow-none lg:bg-white/95 lg:backdrop-blur-xl lg:border-r lg:border-slate-200/60 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 lg:p-8 mb-4 flex items-center justify-between border-b border-slate-50 lg:border-none">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-tr from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-xl tracking-tighter">H</span>
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors leading-none">HIPMI</h1>
              <p className="text-[9px] lg:text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none mt-1.5">Sistem Pemenangan</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="mx-4 lg:mx-6 mb-6 lg:mb-8 p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="relative">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-inner overflow-hidden">
                  {user.username.substring(0, 2).toUpperCase()}
                  <div className="absolute inset-0 bg-white/10" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Utama</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3.5 px-4 py-3.5 lg:py-3 rounded-xl transition-all duration-300 relative ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`font-bold text-sm transition-all duration-300 ${isActive ? 'tracking-wide' : ''}`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </div>
                )}
              </Link>
            );
          })}

          <div className="pt-6 pb-2">
            <p className="px-4 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Lainnya</p>
            {user?.role === 'SUPERADMIN' && (
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api-docs`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3.5 px-4 py-3.5 lg:py-3 rounded-xl transition-all duration-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-sm">API Documentation</span>
                <ExternalLink className="ml-auto w-3 h-3 opacity-50" />
              </a>
            )}
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 mt-auto border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-4 lg:py-3 text-slate-500 hover:text-destructive hover:bg-destructive/5 active:bg-destructive/10 rounded-xl transition-all duration-300 font-black text-sm cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] -z-10 translate-y-1/2 -translate-x-1/2" />

        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-10 py-4 lg:py-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg lg:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {navItems.find(i => i.to === location.pathname)?.label || 'Aplikasi'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 lg:mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <p className="text-[9px] lg:text-sm text-slate-500 font-bold uppercase tracking-tight lg:normal-case lg:font-medium truncate max-w-[120px] lg:max-w-none">
                    Monitoring Real-time
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <button className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">
                <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

