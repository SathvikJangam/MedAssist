import React from 'react';
import { Stethoscope, Clock, Building2, AlertCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const DoctorRoster = () => {
  const { data: staff, isLoading, error } = useFetch('/admin/staff');

  const doctors = (staff || []).filter(s => s.role === 'Doctor' && s.isApproved);

  const getInitials = (name) => {
    return (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getShiftStatus = (doctor) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (!doctor.shiftStart || !doctor.shiftEnd) return 'Unknown';
    if (currentTime >= doctor.shiftStart && currentTime <= doctor.shiftEnd) return 'On Duty';
    return 'Off Duty';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
        <AlertCircle size={18} /> Error loading roster: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl pb-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Today's Doctor Roster</h2>
        <p className="text-slate-500 mt-1 text-sm">Live duty status of all active medical staff.</p>
      </div>

      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <Stethoscope size={40} className="mb-3 opacity-20" />
          <p className="text-sm">No doctors on record yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => {
            const status = getShiftStatus(doc);
            const isOnDuty = status === 'On Duty';

            return (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base flex-shrink-0">
                      {getInitials(doc.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-snug">Dr. {doc.name}</h3>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                        {doc.department || 'General'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border flex-shrink-0 ${
                    isOnDuty
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {status}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Clock size={14} className="text-primary flex-shrink-0" />
                    <span>
                      {doc.shiftStart || '09:00'} – {doc.shiftEnd || '17:00'}
                    </span>
                  </div>
                  {doc.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{doc.email}</span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 text-center py-1.5 rounded-xl text-xs font-bold border ${
                  isOnDuty
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {isOnDuty ? '✓ Currently Available for Bookings' : '○ Outside Shift Hours'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorRoster;