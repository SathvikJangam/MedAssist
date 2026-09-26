import React, { useState } from 'react';
import { User, Lock, Save, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const ProfileSettings = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setStatus({ type: 'error', msg: 'Passwords do not match' });
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        ...(formData.password && { password: formData.password })
      });
      
      setUser(data); // Update global state
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setFormData({ ...formData, password: '', confirmPassword: '' }); // Clear passwords
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Update failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-main">Account Settings</h2>
        <p className="text-text-muted mt-1">Manage your profile details and security.</p>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-success-light text-success border border-success/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          <CheckCircle2 size={18} /> {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-card rounded-xl border border-border shadow-card p-8 space-y-6">
        
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4 flex items-center gap-2">
            <User size={18} className="text-primary"/> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email (Cannot be changed)</label>
              <input type="email" value={user?.email} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">System Role</label>
              <input type="text" value={user?.role} disabled className="w-full px-3 py-2 border rounded-lg bg-primary-light text-primary font-bold cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4 flex items-center gap-2 mt-4">
            <Lock size={18} className="text-primary"/> Change Password
          </h3>
          <p className="text-xs text-text-muted mb-4">Leave blank if you do not wish to change your password.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-hover flex items-center gap-2">
            <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;