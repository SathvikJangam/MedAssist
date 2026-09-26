import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2,
  User, Stethoscope, FileText, XCircle, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const ALL_TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00'
];

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

const PatientAppointments = () => {
  const { data: appointments, refetch, isLoading } = useFetch('/appointments');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: '', date: '', time: '09:00', type: 'Consultation', notes: ''
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api.get('/auth/doctors').then(res => setDoctors(res.data)).catch(() => {});
  }, []);

  // When doctor changes, update available time slots based on their shift
  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const doc = doctors.find(d => d._id === docId);
    setSelectedDoctor(doc || null);
    setFormData(prev => ({ ...prev, doctorId: docId, time: doc?.shiftStart || '09:00' }));
  };

  // Filter time slots to only show slots within doctor's shift hours
  const availableSlots = selectedDoctor
    ? ALL_TIME_SLOTS.filter(t => t >= (selectedDoctor.shiftStart || '09:00') && t <= (selectedDoctor.shiftEnd || '17:00'))
    : ALL_TIME_SLOTS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setIsSubmitting(true);
    try {
      await api.post('/appointments', formData);
      setStatusMsg({
        type: 'success',
        text: 'Appointment requested! Waiting for receptionist confirmation.'
      });
      setFormData({ doctorId: '', date: '', time: '09:00', type: 'Consultation', notes: '' });
      setSelectedDoctor(null);
      refetch();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to book appointment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await api.put(`/appointments/${id}/status`, { status: 'Cancelled' });
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 transition-all";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl pb-8">

      {/* LEFT — Booking Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit sticky top-4">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary" /> Book Appointment
          </h3>

          {statusMsg.text && (
            <div className={`p-3.5 text-sm mb-4 rounded-xl flex items-start gap-2.5 ${
              statusMsg.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {statusMsg.type === 'error'
                ? <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                : <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />}
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Doctor */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Doctor</label>
              <div className="relative">
                <Stethoscope size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                <select
                  required
                  value={formData.doctorId}
                  onChange={handleDoctorChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 appearance-none"
                >
                  <option value="">— Choose a Doctor —</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} ({doc.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>
              {selectedDoctor && (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Clock size={11} /> Duty hours: {selectedDoctor.shiftStart} – {selectedDoctor.shiftEnd}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time Slot</label>
              <div className="relative">
                <Clock size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                <select
                  required
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 appearance-none"
                >
                  {availableSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {selectedDoctor && availableSlots.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No available slots for this doctor.</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Visit Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 appearance-none"
              >
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Emergency</option>
                <option>Routine Check-up</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason for Visit</label>
              <textarea
                required
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 resize-none"
                placeholder="Briefly describe your symptoms..."
              />
            </div>

            <button
              type="submit"
              id="book-appointment-btn"
              disabled={isSubmitting || availableSlots.length === 0}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-sm shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Booking...</>
              ) : (
                <><CalendarIcon size={16} /> Request Appointment</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT — History */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={17} className="text-primary" /> My Appointments
            </h3>
            <button
              onClick={refetch}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !appointments?.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <CalendarIcon size={44} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">No appointments yet.</p>
                <p className="text-xs mt-1">Book your first appointment using the form.</p>
              </div>
            ) : (
              <table className="w-full text-left min-w-[550px]">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-5 py-3 font-semibold">Doctor</th>
                    <th className="px-5 py-3 font-semibold">Date & Time</th>
                    <th className="px-5 py-3 font-semibold">Reason</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.map(apt => (
                    <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <User size={13} />
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            Dr. {apt.doctorId?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <br />
                        <span className="text-xs text-slate-400">{apt.time}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 max-w-[150px]">
                        <span className="truncate block">{apt.notes || apt.type || '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            disabled={cancellingId === apt._id}
                            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ml-auto"
                          >
                            <XCircle size={13} />
                            {cancellingId === apt._id ? '...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;