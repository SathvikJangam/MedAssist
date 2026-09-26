import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, User, Mail, Phone, Lock, Briefcase, Building, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const STAFF_ROLES = [
  { value: 'Doctor', label: 'Doctor / Physician' },
  { value: 'Nurse', label: 'Nurse' },
  { value: 'Receptionist', label: 'Receptionist' },
  { value: 'LabTechnician', label: 'Lab Technician' },
  { value: 'OfficeStaff', label: 'Office Staff' },
  { value: 'AmbulanceDriver', label: 'Ambulance Driver' },
];

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [tab, setTab] = useState('Patient');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'Doctor', department: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setStatus({ type: '', msg: '' });
    setFormData({ name: '', email: '', phone: '', password: '', role: 'Doctor', department: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setIsLoading(true);

    try {
      if (tab === 'Patient') {
        const res = await api.post('/auth/register', { ...formData, role: 'Patient' });
        setUser(res.data);
        navigate('/patient-dashboard');
      } else {
        const res = await api.post('/auth/register-staff', formData);
        setStatus({
          type: 'success',
          msg: res.data.message || 'Registration submitted! Please wait for Admin approval.'
        });
        setFormData({ name: '', email: '', phone: '', password: '', role: 'Doctor', department: '' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">MedAssist</span>
        </div>

        <div className="z-10 space-y-5">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Join the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              MedAssist Network
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Patients get instant access. Healthcare staff join pending admin approval to maintain clinical security standards.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-slate-300">
              <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span>Patients are approved immediately and can start booking right away.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-300">
              <CheckCircle2 size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Staff accounts require Admin verification for access control.</span>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs z-10">© 2026 MedAssist Enterprise.</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-4">

          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-primary">MedAssist</span>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h2>
            <p className="text-slate-500 mt-1.5 text-sm">Register to access your personalized portal.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl">
            {['Patient', 'Staff'].map((t) => (
              <button
                key={t}
                type="button"
                id={`register-tab-${t.toLowerCase()}`}
                onClick={() => handleTabSwitch(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === t
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'Patient' ? '🏥 Patient' : '👨‍⚕️ Hospital Staff'}
              </button>
            ))}
          </div>

          {/* Status Message */}
          {status.msg && (
            <div className={`p-4 rounded-xl mb-5 text-sm flex items-start gap-3 ${
              status.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {status.type === 'error' ? <AlertCircle size={18} className="flex-shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className={labelClass}>Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-400" />
                </div>
                <input id="reg-name" type="text" name="name" required placeholder="Dr. John Smith" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input id="reg-email" type="email" name="email" required placeholder="name@hospital.com" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone size={16} className="text-slate-400" />
                </div>
                <input id="reg-phone" type="tel" name="phone" required placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Staff-Only Fields */}
            {tab === 'Staff' && (
              <>
                <div>
                  <label className={labelClass}>Role / Position</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Briefcase size={16} className="text-slate-400" />
                    </div>
                    <select id="reg-role" name="role" required value={formData.role} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 transition-all appearance-none"
                    >
                      {STAFF_ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Department <span className="font-normal text-slate-400">(optional)</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building size={16} className="text-slate-400" />
                    </div>
                    <input id="reg-department" type="text" name="department" placeholder="e.g., Cardiology, Radiology" value={formData.department} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input id="reg-password" type="password" name="password" required placeholder="Minimum 6 characters" value={formData.password} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
              ) : (
                <>{tab === 'Patient' ? '🏥 Register & Access Portal' : '📋 Submit for Admin Approval'}<ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/" className="text-primary font-semibold hover:underline">Sign in here</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;