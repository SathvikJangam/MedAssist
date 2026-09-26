import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ArrowLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const StaffManagement = () => {
  const [view, setView] = useState('list'); // 'list', 'pending', or 'onboard'
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/staff');
      setStaffList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, [view]);

  const approvedStaff = staffList.filter(s => s.isApproved);
  const pendingStaff = staffList.filter(s => !s.isApproved);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/staff/${id}/approve`);
      fetchStaff(); // Refresh the list seamlessly
    } catch (error) {
      alert("Failed to approve staff.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Staff Management</h2>
          <div className="flex gap-4 mt-3">
            <button onClick={() => setView('list')} className={`pb-2 font-medium ${view === 'list' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}>Active Directory</button>
            <button onClick={() => setView('pending')} className={`pb-2 font-medium flex items-center gap-1 ${view === 'pending' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}>
              Pending Approvals {pendingStaff.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingStaff.length}</span>}
            </button>
          </div>
        </div>
        {view !== 'onboard' && (
          <button onClick={() => setView('onboard')} className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-hover flex items-center gap-2">
            <UserPlus size={18} /> Add Staff Direct
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="bg-surface-card rounded-xl border border-border shadow-card overflow-hidden">
          {/* Render Active Staff Table Here (Same as before, map over approvedStaff) */}
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/50 text-xs uppercase text-text-muted border-b border-border">
                <th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedStaff.map(staff => (
                <tr key={staff._id} className="border-b border-border hover:bg-surface/30">
                  <td className="px-6 py-4 font-bold">{staff.name}</td>
                  <td className="px-6 py-4">{staff.role}</td>
                  <td className="px-6 py-4"><span className="bg-success-light text-success px-2 py-1 rounded text-xs font-bold">Approved & Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'pending' && (
        <div className="bg-surface-card rounded-xl border border-border shadow-card overflow-hidden p-6">
          {pendingStaff.length === 0 ? (
             <div className="text-center text-text-muted py-10"><CheckCircle2 size={40} className="mx-auto mb-3 opacity-50"/> No pending approvals.</div>
          ) : (
            <div className="space-y-4">
              {pendingStaff.map(staff => (
                <div key={staff._id} className="flex justify-between items-center bg-yellow-50/50 border border-yellow-200 p-4 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg">{staff.name}</h3>
                    <p className="text-sm text-text-muted">Requested Role: <strong className="text-text-main">{staff.role}</strong> • {staff.email}</p>
                  </div>
                  <button onClick={() => handleApprove(staff._id)} className="bg-success text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Approve Account
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onboard Form omitted for brevity, but make sure onSubmit does NOT use window.location.reload(). Just call setView('list') and fetchStaff() */}
    </div>
  );
};

export default StaffManagement;