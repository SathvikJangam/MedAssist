import React, { useState } from 'react';
import { Users, UserPlus, CheckCircle2, XCircle, Search, ShieldAlert, X, AlertCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: staffList, isLoading, error, setData: setStaffList, refetch } = useFetch('/admin/staff');

  const handleApprove = async (id) => {
    setStaffList(staffList.map(s => s._id === id ? { ...s, isApproved: true } : s));
    try {
      await api.put(`/admin/staff/${id}/approve`);
    } catch (err) {
      setStaffList(staffList);
      alert(err.response?.data?.message || 'Failed to approve staff');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject and delete this registration request?')) {
      setStaffList(staffList.filter(s => s._id !== id));
      try {
        await api.delete(`/admin/staff/${id}/reject`);
      } catch (err) {
        setStaffList(staffList);
        alert(err.response?.data?.message || 'Failed to reject staff');
      }
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-text-muted">Loading Directory...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error loading staff data.</div>;

  const safeStaff = staffList || [];
  
  // Split data into Pending and Active (Ignoring Patients if they somehow slip in)
  const pendingRequests = safeStaff.filter(user => !user.isApproved && user.role !== 'Patient');
  
  // Filter active staff by search term
  const activeStaff = safeStaff.filter(user => 
    user.isApproved && 
    user.role !== 'Patient' &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Staff Management</h2>
          <p className="text-text-muted mt-1">Manage hospital personnel and registration requests.</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search active staff..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary bg-white shadow-sm" 
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 transition-colors flex-shrink-0 shadow-sm"
          >
            <UserPlus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {showAddForm && (
        <AddStaffModal onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); refetch(); }} />
      )}

      {/* --- PENDING APPROVALS BLOCK --- */}
      {pendingRequests.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-4">
            <ShieldAlert size={20} /> Pending Registration Requests ({pendingRequests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm flex flex-col">
                <div className="mb-3">
                  <h4 className="font-bold text-text-main">{req.name}</h4>
                  <p className="text-sm text-text-muted">{req.email} • {req.phone}</p>
                </div>
                <div className="mb-4">
                  <span className="bg-surface px-2 py-1 rounded text-xs font-semibold text-text-main border border-border">
                    Requested Role: <span className="text-primary">{req.role}</span>
                  </span>
                  {req.department && (
                    <span className="ml-2 text-xs text-text-muted">Dept: {req.department}</span>
                  )}
                </div>
                <div className="mt-auto flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => handleApprove(req._id)} className="flex-1 bg-success-light text-success hover:bg-success hover:text-white transition-colors py-1.5 rounded-md text-sm font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button onClick={() => handleReject(req._id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors py-1.5 rounded-md text-sm font-bold flex items-center justify-center gap-1">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ACTIVE DIRECTORY BLOCK --- */}
      <div className="bg-surface-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-border bg-surface/30 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h3 className="font-bold text-lg text-text-main">Active Staff Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/50 text-xs uppercase tracking-wider text-text-muted border-b border-border">
                <th className="px-6 py-4 font-medium">Name & Contact</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {activeStaff.map((user) => (
                <tr key={user._id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-main text-sm">{user.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-primary-light/30 text-primary border border-primary/10">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-success flex items-center justify-end gap-1 text-sm font-medium">
                      <CheckCircle2 size={16} /> Active
                    </span>
                  </td>
                </tr>
              ))}
              {activeStaff.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-text-muted">
                    No active staff found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AddStaffModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '+91',
    role: 'Doctor',
    department: 'General Medicine',
    shiftStart: '09:00',
    shiftEnd: '17:00'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    'Doctor', 'Receptionist', 'LabTechnician', 'Nurse', 
    'AmbulanceDriver', 'OfficeStaff', 'CleaningStaff', 'DressingStaff', 'OTAssistant'
  ];

  const departments = [
    'General Medicine', 'Cardiology', 'Emergency', 'Pediatrics', 
    'Orthopedics', 'Neurology', 'Radiology', 'Pathology', 'Surgery', 'Administration'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/admin/staff', formData);
      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add staff member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface/50">
          <div className="flex items-center gap-2">
            <UserPlus className="text-primary" size={20} />
            <h3 className="font-bold text-text-main text-lg">Add New Hospital Staff</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-text-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="Dr. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="staff@medassist.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Country</label>
              <input
                type="text"
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-center focus:border-primary focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Phone *</label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none bg-white"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none bg-white"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Shift Start</label>
              <input
                type="time"
                value={formData.shiftStart}
                onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Shift End</label>
              <input
                type="time"
                value={formData.shiftEnd}
                onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-text-muted hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;