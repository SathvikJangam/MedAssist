import React, { useState } from 'react';
import { Search, User, Activity, FileText, Calendar, ChevronRight, Phone, Mail, Stethoscope, Droplets } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { useNavigate } from 'react-router-dom';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: patients, isLoading, error } = useFetch('/appointments/doctor-patients');

  if (isLoading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading patient records...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load patients: {error}</div>;

  const safePatients = patients || [];
  const filteredPatients = safePatients.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-7xl pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">My Patients Directory</h2>
          <p className="text-slate-500 mt-1 text-sm">Patients who have visited or booked appointments with your clinic.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const initials = (patient.name || 'P')
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={patient._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base truncate">{patient.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: #{patient._id.substring(patient._id.length - 6).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 mb-4 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={13} className="text-slate-400" />
                    <span>{patient.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <Mail size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  {patient.bloodGroup && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Droplets size={13} className="text-red-500" />
                      <span className="font-semibold">Blood Group: {patient.bloodGroup}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                <button
                  onClick={() => navigate('/doctor-dashboard/consultation')}
                  className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Stethoscope size={14} /> New Consultation
                </button>
                <button
                  onClick={() => navigate('/doctor-dashboard/records')}
                  className="flex-1 bg-slate-100 text-slate-700 text-xs font-semibold py-2 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText size={14} /> EMR History
                </button>
              </div>
            </div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <User size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-slate-600">No patients found</p>
            <p className="text-xs mt-1">Patients will appear here once they book appointments or consult with you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;