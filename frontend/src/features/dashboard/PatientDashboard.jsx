import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Calendar, FileText, Activity, Clock, ArrowRight,
  User, PlusCircle, Stethoscope, LayoutDashboard, Settings
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import useFetch from '../../hooks/useFetch';
import useAuthStore from '../../store/useAuthStore';

// Sub-page imports
import PatientAppointments from '../appointments/PatientAppointments';
import PatientLabs from '../lab/PatientLabs';
import PatientRecords from '../clinical/PatientRecords';
import ProfileSettings from '../auth/ProfileSettings';

const patientNavLinks = [
  { name: 'My Health Overview', path: '/patient-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Appointments', path: '/patient-dashboard/appointments', icon: Calendar },
  { name: 'Lab Results', path: '/patient-dashboard/labs', icon: Activity },
  { name: 'Medical Records', path: '/patient-dashboard/records', icon: Stethoscope },
  { name: 'My Profile', path: '/patient-dashboard/profile', icon: User },
];

const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-80 text-center">
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
      <Settings size={28} className="text-primary" />
    </div>
    <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500 text-sm">This module is coming soon.</p>
    <div className="mt-4 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">Coming Soon</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
    'Checked-In': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Completed': 'bg-green-50 text-green-700 border-green-200',
    'Cancelled': 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

// --- Patient Overview ---
const PatientOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: appointments, isLoading: apptsLoading } = useFetch('/appointments');
  const { data: labs, isLoading: labsLoading } = useFetch('/lab');

  if (apptsLoading || labsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  const safeAppointments = appointments || [];
  const upcomingAppointments = safeAppointments
    .filter(apt => apt.status !== 'Completed' && apt.status !== 'Cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const safeLabs = labs || [];
  const recentLabs = safeLabs.slice(0, 3);

  const quickLinks = [
    { label: 'Appointments', sub: `${upcomingAppointments.length} upcoming`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', nav: '/patient-dashboard/appointments' },
    { label: 'Lab Results', sub: `${safeLabs.length} records`, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50', nav: '/patient-dashboard/labs' },
    { label: 'Medical Records', sub: 'Notes & Prescriptions', icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-50', nav: '/patient-dashboard/records' },
    { label: 'My Profile', sub: 'Settings & Details', icon: User, color: 'text-orange-500', bg: 'bg-orange-50', nav: '/patient-dashboard/profile' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-6 md:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-blue-200 text-sm font-medium mb-1">Patient Health Portal</p>
          <h2 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name?.split(' ')[0] || 'Patient'}</h2>
          <p className="text-blue-200 text-sm mt-1 opacity-90">Manage your healthcare journey and upcoming schedules.</p>
        </div>
        <button
          onClick={() => navigate('/patient-dashboard/appointments')}
          className="flex items-center gap-2 bg-white text-primary hover:bg-blue-50 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex-shrink-0 w-full sm:w-auto justify-center"
        >
          <PlusCircle size={18} /> Book Appointment
        </button>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(q.nav)}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${q.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <q.icon size={22} className={q.color} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">{q.label}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{q.sub}</p>
          </button>
        ))}
      </div>

      {/* Data Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={17} className="text-primary" /> Upcoming Visits
            </h3>
            <button onClick={() => navigate('/patient-dashboard/appointments')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {upcomingAppointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Clock size={40} className="mb-3 opacity-20" />
                <p className="text-sm">You have no upcoming appointments.</p>
                <button onClick={() => navigate('/patient-dashboard/appointments')} className="mt-3 text-sm text-primary font-semibold hover:underline">
                  Book one now →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(apt => (
                  <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-primary/20 transition-colors gap-3">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Dr. {apt.doctorId?.name || 'Unassigned'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {apt.time}
                      </p>
                      {apt.notes && <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{apt.notes}</p>}
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Lab Results */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={17} className="text-primary" /> Recent Labs
            </h3>
            <button onClick={() => navigate('/patient-dashboard/labs')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              All Results <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {recentLabs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={40} className="mb-3 opacity-20" />
                <p className="text-sm">No recent lab results found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLabs.map(lab => (
                  <div key={lab._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl gap-3">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{lab.testName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ordered: {new Date(lab.orderDate || lab.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      lab.status === 'Completed'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const PatientDashboard = () => (
  <DashboardLayout navLinks={patientNavLinks} title="My Health Portal">
    <Routes>
      <Route path="/" element={<PatientOverview />} />
      <Route path="/appointments" element={<PatientAppointments />} />
      <Route path="/labs" element={<PatientLabs />} />
      <Route path="/records" element={<PatientRecords />} />
      <Route path="/profile" element={<ProfileSettings />} />
    </Routes>
  </DashboardLayout>
);

export default PatientDashboard;