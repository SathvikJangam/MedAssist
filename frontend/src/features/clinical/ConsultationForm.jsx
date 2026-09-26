import React, { useState, useEffect } from 'react';
import { Stethoscope, FileText, Plus, Trash2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const ConsultationForm = () => {
  // Fetch pending appointments so the doctor can select who they are seeing
  const { data: appointments } = useFetch('/appointments');
  const pendingPatients = appointments?.filter(a => a.status === 'Checked-In' || a.status === 'Scheduled') || [];

  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    clinicalDiagnosis: '',
    observations: ''
  });

  const [prescriptions, setPrescriptions] = useState([
    { medicine: '', dosage: '', duration: '', instructions: '' }
  ]);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePatientSelect = (e) => {
    const selectedAppt = pendingPatients.find(a => a._id === e.target.value);
    setFormData({
      ...formData,
      appointmentId: selectedAppt?._id || '',
      patientId: selectedAppt?.patientId?._id || ''
    });
  };

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '', duration: '', instructions: '' }]);
  };

  const removePrescriptionRow = (index) => {
    const newPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(newPrescriptions);
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index][field] = value;
    setPrescriptions(newPrescriptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) return setStatus({ type: 'error', msg: 'Please select a patient.' });
    
    setIsSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      // Send raw data to the backend -> triggers Gemini AI
      await api.post('/clinical/records', {
        ...formData,
        prescriptions: prescriptions.filter(p => p.medicine !== '') // Remove empty rows
      });
      
      setStatus({ type: 'success', msg: 'Consultation saved! AI Summaries generated successfully.' });
      
      // Reset form
      setFormData({ patientId: '', appointmentId: '', clinicalDiagnosis: '', observations: '' });
      setPrescriptions([{ medicine: '', dosage: '', duration: '', instructions: '' }]);
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Failed to save consultation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-main">Clinical Consultation</h2>
        <p className="text-text-muted mt-1">Record observations and generate AI-powered SOAP notes.</p>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 mb-4 ${status.type === 'success' ? 'bg-success-light text-success border border-success/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-card rounded-xl border border-border shadow-card p-8 space-y-8">
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Patient (Checked-In / Scheduled)</label>
          <select onChange={handlePatientSelect} value={formData.appointmentId} className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-primary">
            <option value="">-- Select Patient --</option>
            {pendingPatients.map(apt => (
              <option key={apt._id} value={apt._id}>
                {apt.patientId?.name} - {apt.time}
              </option>
            ))}
          </select>
        </div>

        {/* Clinical Notes */}
        <div>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4 flex items-center gap-2">
            <Stethoscope size={18} className="text-primary"/> Diagnosis & Observations
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Diagnosis</label>
              <input type="text" required placeholder="e.g., Acute Bronchitis" value={formData.clinicalDiagnosis} onChange={e => setFormData({...formData, clinicalDiagnosis: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Raw Observations (Gemini AI will structure this)</label>
              <textarea required rows="4" placeholder="Type your messy notes here... e.g., pt complains of chest pain x 2 days, bp 140/90, mild wheezing left lung..." value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* e-Prescription (Dynamic Array) */}
        <div>
          <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText size={18} className="text-primary"/> e-Prescription
            </h3>
            <button type="button" onClick={addPrescriptionRow} className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
              <Plus size={16} /> Add Medicine
            </button>
          </div>
          
          <div className="space-y-3">
            {prescriptions.map((p, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input type="text" placeholder="Medicine Name" value={p.medicine} onChange={e => handlePrescriptionChange(index, 'medicine', e.target.value)} className="w-1/3 px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
                <input type="text" placeholder="Dosage (e.g., 1-0-1)" value={p.dosage} onChange={e => handlePrescriptionChange(index, 'dosage', e.target.value)} className="w-1/4 px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
                <input type="text" placeholder="Duration (5 days)" value={p.duration} onChange={e => handlePrescriptionChange(index, 'duration', e.target.value)} className="w-1/4 px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
                <input type="text" placeholder="Instructions" value={p.instructions} onChange={e => handlePrescriptionChange(index, 'instructions', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
                {prescriptions.length > 1 && (
                  <button type="button" onClick={() => removePrescriptionRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button type="submit" disabled={isSubmitting || !formData.patientId} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-hover flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? <span className="animate-pulse">Gemini AI Generating...</span> : <><Save size={18} /> Save & Generate EMR</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;