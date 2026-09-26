import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, FileText, Activity } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const PatientProfile = () => {
  const { id } = useParams(); // Get patient ID from URL
  const navigate = useNavigate();

  // Fetch the patient's EMR history! (We built this API earlier)
  const { data: records, isLoading, error } = useFetch(`/clinical/records?patientId=${id}`);

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading Patient Profile...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error loading data.</div>;

  const safeRecords = records || [];
  const latestRecord = safeRecords[0]; // Assuming sorted by newest

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface border border-border rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            {latestRecord?.patientId?.name || 'Patient Profile'}
          </h2>
          <p className="text-text-muted mt-1">Comprehensive Medical History & EMR</p>
        </div>
      </div>

      {safeRecords.length === 0 ? (
        <div className="p-10 text-center border border-dashed rounded-xl">No EMR history found for this patient.</div>
      ) : (
        <div className="space-y-6">
          {safeRecords.map((record) => (
            <div key={record._id} className="bg-surface-card rounded-xl border border-border shadow-sm p-6">
              <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                    <Activity size={18} className="text-primary"/> {record.clinicalDiagnosis}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    Date: {new Date(record.createdAt).toLocaleDateString()} • Attending: {record.doctorId?.name}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="font-semibold text-text-main text-sm">Raw Observations:</span>
                <p className="text-sm text-text-muted mt-1">{record.observations}</p>
              </div>

              <div className="bg-primary-light/30 border border-primary/10 rounded-lg p-4 text-sm text-text-main mb-4">
                <span className="font-semibold text-primary block mb-1">Gemini AI Clinical Summary:</span>
                {record.aiGeneratedSummary}
              </div>
              
              {record.prescriptions?.length > 0 && (
                <div>
                  <span className="font-semibold text-text-main text-sm flex items-center gap-1 mb-2">
                    <FileText size={16} className="text-primary"/> Prescriptions
                  </span>
                  <ul className="list-disc list-inside text-sm text-text-muted space-y-1">
                    {record.prescriptions.map((rx, idx) => (
                      <li key={idx}>{rx.medicine} - {rx.dosage} ({rx.duration})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientProfile;