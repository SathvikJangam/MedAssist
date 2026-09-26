import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LogOut, User, Bell, Menu, X, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const DashboardLayout = ({ children, navLinks, title }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Correct path — Login is at "/"
  };

  const closeSidebar = () => setSidebarOpen(false);

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'flex flex-col h-full' : 'hidden md:flex flex-col h-screen sticky top-0'} w-64 bg-white border-r border-slate-200 shadow-sm z-20`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Activity className="text-white" size={17} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">MedAssist</span>
        </div>
        {mobile && (
          <button onClick={closeSidebar} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {user?.role} Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.exact}
            onClick={mobile ? closeSidebar : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/8 text-primary border border-primary/15 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  size={18}
                  className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`}
                />
                {link.name}
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
            <User size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#F4F7F9] overflow-hidden">

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeSidebar} />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-slate-800 truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <User size={14} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{user?.role}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-700 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;