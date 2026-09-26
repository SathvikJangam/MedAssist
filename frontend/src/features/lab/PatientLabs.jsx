import React from 'react';
import useFetch from '../../hooks/useFetch';
import { Activity, FileText } from 'lucide-react';

const PatientLabs = () => {
  const { data: labs, isLoading, error } = useFetch('/lab');

  if (isLoading) return <div className="p-10 text-center animate-pulse text-text-muted">Loading Lab Results...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error loading labs.</div>;

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="p-5 border-b border-border bg-surface/30 flex items-center gap-2">
        <Activity className="text-primary" size={20} />
        <h3 className="font-bold text-lg text-text-main">My Laboratory Orders</h3>
      </div>
      <div className="p-5 overflow-x-auto">
        {labs?.length === 0 ? (
           <div className="text-center py-12 text-text-muted flex flex-col items-center">
             <FileText size={40} className="opacity-20 mb-3"/>
             No lab orders found in your history.
           </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-text-muted border-b border-border">
                <th className="pb-3">Test Name</th>
                <th className="pb-3">Ordered By</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {labs.map(lab => (
                <tr key={lab._id} className="hover:bg-surface/30">
                  <td className="py-4 text-sm font-bold text-text-main">{lab.testName}</td>
                  <td className="py-4 text-sm text-text-muted">Dr. {lab.doctorId?.name || 'Clinic'}</td>
                  <td className="py-4 text-sm text-text-muted">{new Date(lab.orderDate).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      lab.status === 'Completed' ? 'bg-success-light text-success' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {lab.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default PatientLabs;