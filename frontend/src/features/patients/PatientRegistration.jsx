import React, { useState } from 'react';
import { UserPlus, Save, AlertCircle, Droplets, Phone, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: 'Patient123', role: 'Patient'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      // Create the patient via the secure backend route
      await api.post('/auth/register', formData);
      setStatus({ type: 'success', msg: `Patient ${formData.name} successfully registered!` });
      e.target.reset();
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Registration failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Register Walk-in Patient</h2>
          <p className="text-text-muted mt-1">Create a comprehensive medical profile for walk-in patients.</p>
        </div>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 mb-4 ${status.type === 'success' ? 'bg-success-light text-success border border-success/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-card rounded-xl border border-border shadow-card p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-primary"/> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" name="name" required onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Droplets size={14} className="text-red-500"/> Blood Group</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary bg-white">
                <option value="O+">O+</option><option value="A+">A+</option><option value="B+">B+</option><option value="AB+">AB+</option><option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4 flex items-center gap-2">
            <Phone size={18} className="text-primary"/> Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="tel" name="phone" required onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input type="email" name="email" required onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
            <AlertCircle size={16} /> Password defaults to "Patient123"
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-hover flex items-center gap-2 transition-colors disabled:opacity-70">
            <Save size={18} /> {isSubmitting ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;