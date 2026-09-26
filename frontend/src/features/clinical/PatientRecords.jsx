import React, { useState } from 'react';
import { FileText, Stethoscope, Pill, ChevronDown, ChevronUp, Printer, Calendar, User } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useAuthStore from '../../store/useAuthStore';

const PatientRecords = () => {
  const { user } = useAuthStore();
  const { data: records, isLoading, error } = useFetch('/clinical/records');
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) return <div className="p-10 text-center text-slate-400 animate-pulse">Loading Medical Records...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  const safeRecords = records || [];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl pb-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Medical Records (EMR)</h2>
        <p className="text-slate-500 mt-1 text-sm">
          {user?.role === 'Patient'
            ? 'Your complete clinical history, doctor observations, and electronic prescriptions.'
            : 'Patient consultation records, diagnosis notes, and medical prescriptions.'}
        </p>
      </div>

      {safeRecords.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          <FileText size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-slate-600">No medical records on file</p>
          <p className="text-xs mt-1">Records are created following consultations and diagnoses.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {safeRecords.map((record) => {
            const isExpanded = expandedId === record._id;
            const hasPrescriptions = record.prescriptions && record.prescriptions.length > 0;

            return (
              <div
                key={record._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        {record.clinicalDiagnosis || 'Clinical Consultation'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span><Calendar size={12} className="inline mr-1" />{new Date(record.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span><User size={12} className="inline mr-1" />{record.doctorId?.name ? `Dr. ${record.doctorId.name}` : 'Attending Physician'}</span>
                        {record.patientId?.name && user?.role !== 'Patient' && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">Patient: {record.patientId.name}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-slate-200">
                    #{record._id.substring(record._id.length - 8).toUpperCase()}
                  </span>
                </div>

                {/* Summary / Notes */}
                <div className="py-4 space-y-3">
                  {record.patientFriendlySummary && (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-sm text-slate-800 leading-relaxed">
                      <span className="font-bold text-blue-900 block mb-1">Patient Care Summary:</span>
                      {record.patientFriendlySummary}
                    </div>
                  )}

                  {record.aiGeneratedSummary && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900 font-sans block mb-1">Clinical Notes (EMR):</span>
                      {record.aiGeneratedSummary}
                    </div>
                  )}

                  {!record.patientFriendlySummary && !record.aiGeneratedSummary && record.observations && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900 block mb-1">Observations:</span>
                      {record.observations}
                    </div>
                  )}
                </div>

                {/* Prescriptions Section */}
                {hasPrescriptions && (
                  <div className="pt-2">
                    <button
                      onClick={() => toggleExpand(record._id)}
                      className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors"
                    >
                      <Pill size={14} />
                      {isExpanded ? 'Hide E-Prescriptions' : `View E-Prescriptions (${record.prescriptions.length} items)`}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                              <th className="px-4 py-2.5">Medication</th>
                              <th className="px-4 py-2.5">Dosage</th>
                              <th className="px-4 py-2.5">Duration</th>
                              <th className="px-4 py-2.5">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {record.prescriptions.map((p, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-4 py-2.5 font-bold text-slate-800">{p.medicine}</td>
                                <td className="px-4 py-2.5 text-slate-600">{p.dosage || '-'}</td>
                                <td className="px-4 py-2.5 text-slate-600">{p.duration || '-'}</td>
                                <td className="px-4 py-2.5 text-slate-600">{p.instructions || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientRecords;