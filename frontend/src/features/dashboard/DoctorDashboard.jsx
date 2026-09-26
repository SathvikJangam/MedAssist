import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Activity, ArrowRight, AlertCircle,
  Stethoscope, FlaskConical, ClipboardList, Settings, LayoutDashboard, User
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import useFetch from '../../hooks/useFetch';
import useAuthStore from '../../store/useAuthStore';

// Sub-page imports
import ProfileSettings from '../auth/ProfileSettings';
import MasterCalendar from '../appointments/MasterCalendar';
import DoctorLabs from '../lab/DoctorLabs';
import DoctorPatients from '../patients/DoctorPatients';
import ConsultationForm from '../clinical/ConsultationForm';
import PatientRecords from '../clinical/PatientRecords';

const doctorNavLinks = [
  { name: 'My Dashboard', path: '/doctor-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'My Schedule', path: '/doctor-dashboard/appointments', icon: Calendar },
  { name: 'My Patients', path: '/doctor-dashboard/patients', icon: Users },
  { name: 'Lab Reviews', path: '/doctor-dashboard/labs', icon: FlaskConical },
  { name: 'Consultations', path: '/doctor-dashboard/consultation', icon: ClipboardList },
  { name: 'Medical Records', path: '/doctor-dashboard/records', icon: Stethoscope },
  { name: 'My Profile', path: '/doctor-dashboard/profile', icon: Settings },
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
    'Checked-In': 'bg-blue-50 text-blue-700 border-blue-200',
    'Completed': 'bg-green-50 text-green-700 border-green-200',
    'Confirmed': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Cancelled': 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

// --- Doctor Overview ---
const DoctorOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const today = new Date().toISOString().split('T')[0];

  const { data: appointments, isLoading: apptsLoading, error: apptsError } = useFetch('/appointments');
  const { data: patients, isLoading: patientsLoading } = useFetch('/appointments/doctor-patients');
  const { data: labs, isLoading: labsLoading } = useFetch('/lab');

  if (apptsLoading || patientsLoading || labsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (apptsError) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl">
        <AlertCircle size={20} /> Error loading dashboard data.
      </div>
    );
  }

  const safeAppointments = appointments || [];
  const todaysAppointments = safeAppointments.filter(apt => {
    const aptDate = new Date(apt.date).toISOString().split('T')[0];
    return aptDate === today;
  });
  const safePatients = patients || [];
  const safeLabs = labs || [];
  const pendingLabs = safeLabs.filter(lab => lab.status === 'Pending');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={18} className="text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">Clinical Dashboard</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Good morning, Dr. {user?.name?.split(' ').slice(-1)[0] || 'Doctor'}</h2>
          <p className="text-blue-200 text-sm mt-1">
            {todaysAppointments.length > 0
              ? `You have ${todaysAppointments.length} appointment${todaysAppointments.length !== 1 ? 's' : ''} scheduled today.`
              : 'No appointments scheduled for today.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor-dashboard/appointments')}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
        >
          <Calendar size={16} /> View Full Schedule
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Today's Appointments", value: todaysAppointments.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', nav: '/doctor-dashboard/appointments' },
          { label: 'Unique Patients', value: safePatients.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', nav: '/doctor-dashboard/patients' },
          { label: 'Pending Lab Reviews', value: pendingLabs.length, icon: Activity, color: pendingLabs.length > 0 ? 'text-amber-600' : 'text-green-600', bg: pendingLabs.length > 0 ? 'bg-amber-50' : 'bg-green-50', nav: '/doctor-dashboard/labs' },
        ].map((m) => (
          <button key={m.label} onClick={() => navigate(m.nav)} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center gap-4 text-left w-full">
            <div className={`p-3 rounded-xl ${m.bg}`}>
              <m.icon size={24} className={m.color} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{m.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{m.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[420px]">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={17} className="text-primary" /> Today's Schedule
            </h3>
            <button onClick={() => navigate('/doctor-dashboard/appointments')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {todaysAppointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Calendar size={40} className="mb-3 opacity-20" />
                <p className="text-sm">No appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysAppointments.map(apt => (
                  <div key={apt._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-primary/20 hover:bg-primary/2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-center min-w-[70px]">
                        <span className="block text-sm font-bold">{apt.time}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{apt.patientId?.name || 'Unknown Patient'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{apt.type || 'Consultation'}</p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Lab Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[420px]">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FlaskConical size={17} className="text-primary" /> Pending Lab Reviews
            </h3>
            <button onClick={() => navigate('/doctor-dashboard/labs')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              Go to Labs <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {pendingLabs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Activity size={40} className="mb-3 opacity-20" />
                <p className="text-sm">No pending lab results to review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLabs.map(lab => (
                  <div key={lab._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{lab.testName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Patient: {lab.patientId?.name || 'Unknown'}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Awaiting Lab
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

const DoctorDashboard = () => (
  <DashboardLayout navLinks={doctorNavLinks} title="Clinical Dashboard">
    <Routes>
      <Route path="/" element={<DoctorOverview />} />
      <Route path="/appointments" element={<MasterCalendar />} />
      <Route path="/patients" element={<DoctorPatients />} />
      <Route path="/labs" element={<DoctorLabs />} />
      <Route path="/consultation" element={<ConsultationForm />} />
      <Route path="/records" element={<PatientRecords />} />
      <Route path="/profile" element={<ProfileSettings />} />
    </Routes>
  </DashboardLayout>
);

export default DoctorDashboard;