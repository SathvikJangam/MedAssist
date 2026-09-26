import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Users, CalendarCheck, AlertCircle, CreditCard,
  Search, UserPlus, Clock, CheckCircle2, ChevronRight,
  LayoutDashboard, Settings, X, Activity, Flame
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import ProfileSettings from '../auth/ProfileSettings';
import PatientRegistration from '../patients/PatientRegistration';
import MasterCalendar from '../appointments/MasterCalendar';
import BillingManagement from '../billing/BillingManagement';
import DoctorRoster from './DoctorRoster';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const receptionistLinks = [
  { name: 'Live Queue', path: '/reception-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Patient Registration', path: '/reception-dashboard/register', icon: UserPlus },
  { name: 'Appointments', path: '/reception-dashboard/appointments', icon: CalendarCheck },
  { name: 'Billing & Invoices', path: '/reception-dashboard/billing', icon: CreditCard },
  { name: 'Doctor Roster', path: '/reception-dashboard/roster', icon: Users },
  { name: 'My Profile', path: '/reception-dashboard/settings', icon: Settings },
];

const StatusBadge = ({ status }) => {
  const map = {
    'Checked-In': 'bg-blue-50 text-blue-700 border-blue-200',
    'Confirmed': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Completed': 'bg-green-50 text-green-700 border-green-200',
    'Cancelled': 'bg-red-50 text-red-600 border-red-200',
    'In-Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

// --- Receptionist Overview ---
const ReceptionistOverview = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showERModal, setShowERModal] = useState(false);

  const { data: appointments, isLoading, error, refetch } = useFetch('/appointments');

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const safeAppointments = appointments || [];
  const today = new Date().toISOString().split('T')[0];
  const todaysQueue = safeAppointments.filter(apt => apt.date?.startsWith(today));

  const filteredQueue = todaysQueue.filter(apt => {
    const q = searchQuery.toLowerCase();
    return !q ||
      apt.patientId?.name?.toLowerCase().includes(q) ||
      apt.doctorId?.name?.toLowerCase().includes(q) ||
      apt.status?.toLowerCase().includes(q);
  });

  const checkedIn = todaysQueue.filter(a => a.status === 'Checked-In').length;
  const completed = todaysQueue.filter(a => a.status === 'Completed').length;
  const pending = todaysQueue.filter(a => a.status === 'Pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Front Desk Operations</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage today's patient flow and walk-ins.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/reception-dashboard/register')}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-all"
          >
            <UserPlus size={16} /> New Walk-in
          </button>
          <button
            onClick={() => setShowERModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            <AlertCircle size={16} /> Rapid ER Admit
          </button>
        </div>
      </div>

      {showERModal && (
        <RapidERModal
          onClose={() => setShowERModal(false)}
          onSuccess={() => { setShowERModal(false); refetch(); }}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Total", value: todaysQueue.length, color: 'text-slate-800', bg: 'bg-slate-50' },
          { label: 'Pending Confirm', value: pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Checked-In', value: checkedIn, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Completed', value: completed, color: 'text-green-700', bg: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-2">{s.label}</p>
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ height: '520px' }}>
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock size={17} className="text-primary" /> Live Waiting Queue
            </h3>
            <div className="relative w-56">
              <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                placeholder="Search patient or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-slate-100" />
              ))
            ) : error ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                <AlertCircle size={18} /> {error}
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Clock size={40} className="mb-3 opacity-20" />
                <p className="text-sm">{searchQuery ? 'No matches found.' : 'Queue is empty for today.'}</p>
              </div>
            ) : (
              filteredQueue.map((apt) => (
                <div
                  key={apt._id}
                  className={`bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm transition-all ${apt.status === 'Pending' ? 'border-amber-100' : 'border-slate-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {apt.time?.split(':')[0] || '--'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{apt.patientId?.name || 'Unknown'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {apt.time} • Dr. {apt.doctorId?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={apt.status} />
                    {apt.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'Confirmed')}
                        className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 size={14} /> Confirm
                      </button>
                    )}
                    {apt.status === 'Confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'Checked-In')}
                        className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Quick Tasks */}
        <div className="flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Front Desk Tasks</h3>
            <div className="space-y-2">
              {[
                { label: 'Book Follow-up', icon: CalendarCheck, nav: '/reception-dashboard/appointments' },
                { label: 'Generate Invoice', icon: CreditCard, nav: '/reception-dashboard/billing' },
                { label: 'View Doctor Roster', icon: Users, nav: '/reception-dashboard/roster' },
                { label: 'Register Walk-in', icon: UserPlus, nav: '/reception-dashboard/register' },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => navigate(t.nav)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-primary/5 hover:border-primary/20 text-slate-700 hover:text-primary rounded-xl transition-all border border-transparent group"
                >
                  <span className="font-medium text-sm flex items-center gap-2">
                    <t.icon size={16} className="text-slate-400 group-hover:text-primary" /> {t.label}
                  </span>
                  <ChevronRight size={15} className="text-slate-400 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>

          {/* Pending Alert */}
          {pending > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2 mb-2">
                <AlertCircle size={16} /> Action Required
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>{pending} appointment{pending !== 1 ? 's' : ''}</strong> {pending !== 1 ? 'are' : 'is'} still pending confirmation. Please confirm them to proceed with check-in.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const RapidERModal = ({ onClose, onSuccess }) => {
  const { data: staff } = useFetch('/admin/staff');
  const doctors = (staff || []).filter(s => s.role === 'Doctor' && s.isApproved);
  
  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, '0')}:00`;

  const [formData, setFormData] = useState({
    name: 'Emergency Patient',
    phone: '9999999999',
    doctorId: '',
    triage: 'Critical - Code Red',
    complaint: 'Acute Trauma / Severe Distress'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default to first available doctor once loaded
  React.useEffect(() => {
    if (doctors.length > 0 && !formData.doctorId) {
      setFormData(prev => ({ ...prev, doctorId: doctors[0]._id }));
    }
  }, [doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      setErrorMsg('Please select an on-duty attending doctor.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Create walk-in Emergency Patient
      const randomTag = Date.now().toString().slice(-6);
      const patientRes = await api.post('/auth/register', {
        name: formData.name,
        email: `er_patient_${randomTag}@medassist.hospital`,
        phone: formData.phone,
        password: 'ER_EmergencyPassword123!',
        role: 'Patient'
      });

      const patientId = patientRes.data._id;

      // 2. Book immediate Emergency Appointment checked in
      await api.post('/appointments', {
        patientId,
        doctorId: formData.doctorId,
        date: new Date().toISOString(),
        time: currentHour,
        type: 'Emergency',
        notes: `[Triage: ${formData.triage}] ${formData.complaint}`,
        status: 'Checked-In'
      });

      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to admit emergency patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-red-200 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <Flame className="text-red-600 animate-bounce" size={22} />
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Rapid ER Admission</h3>
              <p className="text-xs text-red-500 font-semibold">Immediate triage & emergency bay registration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Triage Priority *</label>
            <select
              value={formData.triage}
              onChange={(e) => setFormData({ ...formData, triage: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-red-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-red-50/50 font-semibold text-red-700"
            >
              <option value="Critical - Code Red">🔴 Critical — Code Red (Immediate Resuscitation)</option>
              <option value="Urgent - Code Yellow">🟡 Urgent — Code Yellow (Severe Trauma / Cardiac)</option>
              <option value="Standard - Code Green">🟢 Standard — Code Green (Stable ER Walk-in)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign ER / Duty Physician *</label>
            <select
              required
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-slate-50"
            >
              <option value="">— Select Attending Physician —</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name} ({d.department || 'General / ER'}) • {d.shiftStart}-{d.shiftEnd}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chief Complaint & Symptoms *</label>
            <textarea
              required
              rows={3}
              value={formData.complaint}
              onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
              placeholder="e.g. Unconscious, vehicular trauma, tachycardia, severe burn..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-slate-50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Activity size={16} />
              {loading ? 'Admitting Patient...' : 'Admit & Check-In Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceptionistDashboard = () => (
  <DashboardLayout navLinks={receptionistLinks} title="Front Desk Operations">
    <Routes>
      <Route path="/" element={<ReceptionistOverview />} />
      <Route path="/register" element={<PatientRegistration />} />
      <Route path="/appointments" element={<MasterCalendar />} />
      <Route path="/billing" element={<BillingManagement />} />
      <Route path="/roster" element={<DoctorRoster />} />
      <Route path="/settings" element={<ProfileSettings />} />
    </Routes>
  </DashboardLayout>
);

export default ReceptionistDashboard;