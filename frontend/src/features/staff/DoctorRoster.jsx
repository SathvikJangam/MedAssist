import React from 'react';
import { DoorOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const DoctorRoster = () => {
  // Fetching all staff, then filtering out only Doctors on the frontend (or use a dedicated query parameter)
  const { data: staff, isLoading, error } = useFetch('/admin/staff');

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading roster...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  const safeStaff = staff || [];
  const doctors = safeStaff.filter(user => user.role === 'Doctor' && user.isActive);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-main">Today's Doctor Roster</h2>
        <p className="text-text-muted mt-1">Live directory of active doctors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-surface-card rounded-xl border border-border shadow-card p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg uppercase">
                  {doc.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-text-main">{doc.name}</h3>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{doc.pgSpecialization || 'General'}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface/50 rounded-lg p-3 space-y-2 mb-4 border border-border">
              <div className="flex items-center gap-2 text-sm text-text-main">
                <DoorOpen size={14} className="text-primary"/> <span className="font-medium">Designation: {doc.designation || 'Consultant'}</span>
              </div>
            </div>

            <div className={`text-center py-1.5 rounded-lg text-sm font-bold border ${
              doc.isApproved ? 'bg-success-light text-success border-success/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {doc.isApproved ? 'Active' : 'Pending Approval'}
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full text-center p-10 text-text-muted border-2 border-dashed border-border rounded-xl">
            No doctors found in the active directory.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRoster;