import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Activity, AlertCircle, CheckCircle2, XCircle,
  Shield, Building2, Truck, Stethoscope, FileText,
  Settings, IndianRupee, Pill, LayoutDashboard
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

// Sub-page imports
import StaffManagement from '../staff/StaffManagement';
import MasterCalendar from '../appointments/MasterCalendar';
import BillingManagement from '../billing/BillingManagement';
import FacilitiesManagement from '../facilities/FacilitiesManagement';
import AmbulanceManagement from '../fleet/AmbulanceManagement';
import DoctorLabs from '../lab/DoctorLabs';
import LabInventory from '../lab/LabInventory';
import ProfileSettings from '../auth/ProfileSettings';

const adminNavLinks = [
  { name: 'Command Center', path: '/admin-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Staff & Duty', path: '/admin-dashboard/staff', icon: Users },
  { name: 'Master Calendar', path: '/admin-dashboard/appointments', icon: Calendar },
  { name: 'Billing & Invoices', path: '/admin-dashboard/billing', icon: IndianRupee },
  { name: 'Laboratory', path: '/admin-dashboard/labs', icon: FileText },
  { name: 'Pharmacy Inventory', path: '/admin-dashboard/inventory', icon: Pill },
  { name: 'Ambulance Fleet', path: '/admin-dashboard/fleet', icon: Truck },
  { name: 'Bed Management', path: '/admin-dashboard/facilities', icon: Building2 },
  { name: 'AI Setup', path: '/admin-dashboard/ai-settings', icon: Stethoscope },
  { name: 'My Profile', path: '/admin-dashboard/profile', icon: Settings },
];

const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-80 text-center">
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
      <Settings size={28} className="text-primary" />
    </div>
    <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500 text-sm max-w-xs">This enterprise module is currently under development and will be available soon.</p>
    <div className="mt-4 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">Coming Soon</div>
  </div>
);

// --- Admin Overview Page ---
const AdminOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: staffList, isLoading: staffLoading, error: staffError, setData: setStaffList } = useFetch('/admin/staff');
  const { data: appointments, isLoading: apptsLoading } = useFetch('/appointments');

  const handleApprove = async (id) => {
    // Optimistic update — no loading flash
    setStaffList(staffList.map(s => s._id === id ? { ...s, isApproved: true } : s));
    try {
      await api.put(`/admin/staff/${id}/approve`);
    } catch (err) {
      // Revert on failure
      setStaffList(staffList);
      alert(err.response?.data?.message || 'Failed to approve staff');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject and delete this registration? They must re-apply.')) {
      // Optimistic update — remove from list immediately
      setStaffList(staffList.filter(s => s._id !== id));
      try {
        await api.delete(`/admin/staff/${id}/reject`);
      } catch (err) {
        // Revert on failure
        setStaffList(staffList);
        alert(err.response?.data?.message || 'Failed to reject staff');
      }
    }
  };

  if (staffLoading || apptsLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (staffError) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl">
        <AlertCircle size={20} />
        Error loading clinic data. Check your network connection.
      </div>
    );
  }

  const safeStaff = staffList || [];
  const pendingRequests = safeStaff.filter(u => !u.isApproved && u.role !== 'Patient');
  const activeStaff = safeStaff.filter(u => u.isApproved && u.role !== 'Patient');
  const safeAppointments = appointments || [];
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = safeAppointments.filter(apt => apt.date?.startsWith(today));

  const modules = [
    { label: 'Staff & Duty', sub: 'Manage doctors, nurses, shifts', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin-dashboard/staff' },
    { label: 'Master Calendar', sub: 'Hospital-wide appointment view', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', path: '/admin-dashboard/appointments' },
    { label: 'Billing & Invoices', sub: 'Financial records and payments', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/admin-dashboard/billing' },
    { label: 'Laboratory', sub: 'Diagnostic tests and reporting', icon: FileText, color: 'text-red-500', bg: 'bg-red-50', path: '/admin-dashboard/labs' },
    { label: 'Pharmacy Inventory', sub: 'Medicines and medical stock', icon: Pill, color: 'text-orange-500', bg: 'bg-orange-50', path: '/admin-dashboard/inventory' },
    { label: 'Ambulance Fleet', sub: 'Emergency vehicle dispatching', icon: Truck, color: 'text-sky-500', bg: 'bg-sky-50', path: '/admin-dashboard/fleet' },
    { label: 'Bed Management', sub: 'Room and ward allocation', icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/admin-dashboard/facilities' },
    { label: 'AI Setup', sub: 'Gemini AI configurations', icon: Stethoscope, color: 'text-pink-500', bg: 'bg-pink-50', path: '/admin-dashboard/ai-settings' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className="text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">System Administration</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h2>
          <p className="text-slate-400 text-sm mt-1">MedAssist Enterprise Portal — Full System Access</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-slate-200">All Systems Operational</span>
        </div>
      </div>

      {/* Pending Approvals — High Priority Block */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-600" />
            <h3 className="text-base font-bold text-amber-800">
              Action Required: {pendingRequests.length} Pending Staff Registration{pendingRequests.length > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-white p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm hover:border-amber-200 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-800">{req.name}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{req.email} • {req.phone}</p>
                  <span className="inline-flex items-center mt-2 bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                    {req.role}{req.department && ` — ${req.department}`}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(req._id)}
                    className="flex items-center gap-1.5 bg-success-light text-success hover:bg-success hover:text-white transition-colors px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Staff', value: activeStaff.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: "Today's Visits", value: todaysAppointments.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Bookings', value: safeAppointments.length, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Pending Approvals', value: pendingRequests.length, icon: AlertCircle, color: pendingRequests.length > 0 ? 'text-amber-600' : 'text-green-600', bg: pendingRequests.length > 0 ? 'bg-amber-50' : 'bg-green-50' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`p-3 rounded-xl ${m.bg}`}>
              <m.icon size={24} className={m.color} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{m.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Hospital Modules Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-primary" />
          <h3 className="text-lg font-bold text-slate-800">Hospital Modules</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.label}
              onClick={() => navigate(mod.path)}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all text-left group"
            >
              <div className={`w-11 h-11 ${mod.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <mod.icon size={22} className={mod.color} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{mod.label}</h4>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">{mod.sub}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

// Main export with full routing
const AdminDashboard = () => (
  <DashboardLayout navLinks={adminNavLinks} title="Admin Command Center">
    <Routes>
      <Route path="/" element={<AdminOverview />} />
      <Route path="/staff" element={<StaffManagement />} />
      <Route path="/appointments" element={<MasterCalendar />} />
      <Route path="/billing" element={<BillingManagement />} />
      <Route path="/facilities" element={<FacilitiesManagement />} />
      <Route path="/fleet" element={<AmbulanceManagement />} />
      <Route path="/labs" element={<DoctorLabs />} />
      <Route path="/inventory" element={<LabInventory />} />
      <Route path="/ai-settings" element={<ComingSoon title="Gemini AI Setup" />} />
      <Route path="/profile" element={<ProfileSettings />} />
    </Routes>
  </DashboardLayout>
);

export default AdminDashboard;