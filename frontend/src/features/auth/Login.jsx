import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      // STRICT ROLE-BASED ROUTING
      switch (result.role) {
        case 'ClinicAdmin':
          navigate('/admin-dashboard');
          break;
        case 'Doctor':
          navigate('/doctor-dashboard');
          break;
        case 'Patient':
          navigate('/patient-dashboard');
          break;
        case 'Receptionist':
          navigate('/reception-dashboard');
          break;
        case 'LabTechnician':
          navigate('/lab-dashboard');
          break;
        case 'OfficeStaff':
          navigate('/office-dashboard');
          break;
        case 'AmbulanceDriver':
          navigate('/driver-dashboard');
          break;
        default:
          navigate('/patient-dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">MedAssist</span>
        </div>

        {/* Hero Text */}
        <div className="z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-blue-200 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            All Systems Operational
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
            Enterprise<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              Hospital Portal
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            A unified command center for doctors, administrators, staff, and patients. 
            Secure. Intelligent. Real-time.
          </p>

          {/* Feature List */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {['Role-Based Access', 'Real-Time Data', 'AI Clinical Notes', 'Lab Integration', 'Fleet Dispatch', 'Bed Management'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-4 h-4 bg-primary/30 border border-primary/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs z-10">© 2026 MedAssist Enterprise. All rights reserved.</p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-primary">MedAssist</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2 text-sm">Sign in to your portal account to continue.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={17} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 transition-all"
                  placeholder="name@hospital.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={17} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="login-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-slate-50 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={17} />
                  Secure Sign In
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Secure TLS
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              24/7 Support
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;