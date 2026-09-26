import React, { useState } from 'react';
import { FlaskConical, Download, Clock, AlertCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const DoctorLabs = () => {
  const [activeTab, setActiveTab] = useState('completed');
  const { data: labOrders, isLoading, error } = useFetch('/lab');

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading diagnostic reports...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  const safeOrders = labOrders || [];
  const filteredLabs = safeOrders.filter(lab => 
    activeTab === 'completed' ? lab.status === 'Completed' : lab.status === 'Pending'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Diagnostic Reports</h2>
          <p className="text-text-muted mt-1">Review lab results and imaging for your patients.</p>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex border-b border-border bg-surface/30">
          <button onClick={() => setActiveTab('completed')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'completed' ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-main'}`}>
            Completed Reports
          </button>
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-main'}`}>
            Pending Results
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface/50 text-xs uppercase tracking-wider text-text-muted border-b border-border">
              <th className="px-6 py-4 font-medium">Test & Date</th>
              <th className="px-6 py-4 font-medium">Patient Name</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {filteredLabs.map(lab => (
              <tr key={lab._id} className="hover:bg-surface/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-text-main text-sm flex items-center gap-2">
                    <FlaskConical size={16} className="text-primary"/> {lab.testName}
                    {lab.isAbnormal && <AlertCircle size={14} className="text-red-500" title="Abnormal Result" />}
                  </div>
                  <div className="text-xs text-text-muted mt-1">{new Date(lab.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-text-main">{lab.patientId?.name || 'Unknown Patient'}</td>
                <td className="px-6 py-4 text-right">
                  {lab.status === 'Completed' ? (
                    <a href={lab.reportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary-light px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-primary/20">
                      <Download size={16} /> View Result
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                      <Clock size={14} /> Processing
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredLabs.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-text-muted">No {activeTab} lab reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorLabs;