import React, { useState } from 'react';
import { Calendar as CalIcon, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const MasterCalendar = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: appointments, isLoading, error, setData } = useFetch('/appointments');

  const handleCheckIn = async (id) => {
    try {
      setData(appointments.map(apt => apt._id === id ? { ...apt, status: 'Checked-In' } : apt));
      await api.put(`/appointments/${id}/status`, { status: 'Checked-In' });
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (isLoading) return <div className="p-10 text-center text-text-muted animate-pulse">Loading Schedule...</div>;
  if (error) return <div className="p-10 text-center text-red-500 flex items-center justify-center gap-2"><AlertCircle /> Error: {error}</div>;

  const filteredSchedule = (appointments || []).filter(apt => {
    const aptDate = new Date(apt.date).toISOString().split('T')[0];
    return aptDate === date && apt.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Master Schedule</h2>
          <p className="text-text-muted mt-1">Manage all clinic appointments globally.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-primary" />
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-text-muted" />
            <input type="text" placeholder="Search Patient..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/50 text-xs uppercase tracking-wider text-text-muted border-b border-border">
                <th className="px-6 py-4">Time</th><th className="px-6 py-4">Patient Details</th>
                <th className="px-6 py-4">Assigned Doctor</th><th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filteredSchedule.map((apt) => (
                <tr key={apt._id} className="hover:bg-surface/30">
                  <td className="px-6 py-4 font-bold text-sm flex items-center gap-2"><Clock size={14} className="text-primary"/> {apt.time}</td>
                  <td className="px-6 py-4"><div className="font-bold text-sm">{apt.patientId?.name}</div><div className="text-xs text-text-muted">{apt.patientId?.phone}</div></td>
                  <td className="px-6 py-4"><div className="font-medium text-sm">{apt.doctorId?.name}</div><div className="text-xs text-text-muted">{apt.department}</div></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${apt.status === 'Checked-In' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{apt.status}</span></td>
                  <td className="px-6 py-4 text-right">
                    {apt.status === 'Scheduled' && (
                      <button onClick={() => handleCheckIn(apt._id)} className="text-sm bg-primary-light text-primary font-medium px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white flex items-center gap-1 ml-auto">
                        <CheckCircle2 size={14}/> Check In
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSchedule.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-text-muted">No appointments found for this date.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterCalendar;