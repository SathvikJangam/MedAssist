import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  FlaskConical, UploadCloud, Clock, CheckCircle2,
  AlertCircle, FileText, Activity, Search, X, Settings, User, LayoutDashboard
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import ProfileSettings from '../auth/ProfileSettings';
import CompletedTests from '../lab/CompletedTests';
import LabInventory from '../lab/LabInventory';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const labLinks = [
  { name: 'Pending Orders', path: '/lab-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Completed Tests', path: '/lab-dashboard/completed', icon: CheckCircle2 },
  { name: 'Inventory & Supplies', path: '/lab-dashboard/inventory', icon: FlaskConical },
  { name: 'Profile Settings', path: '/lab-dashboard/settings', icon: Settings },
];

const PriorityBadge = ({ priority }) => {
  const map = {
    'Emergency': 'bg-red-50 text-red-700 border-red-200',
    'Urgent': 'bg-orange-50 text-orange-700 border-orange-200',
    'Routine': 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wide ${map[priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {priority}
    </span>
  );
};

const LabOverview = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [techNotes, setTechNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: labOrders, isLoading, error, refetch } = useFetch('/lab');

  const pendingOrders = (labOrders || []).filter(o => o.status === 'Pending');
  const urgentCount = pendingOrders.filter(o => o.priority === 'Emergency' || o.priority === 'Urgent').length;
  const completedToday = (labOrders || []).filter(o => o.status === 'Completed').length;

  const filteredOrders = pendingOrders.filter(o => {
    const q = searchQuery.toLowerCase();
    return !q || o.patientId?.name?.toLowerCase().includes(q) || o.testName?.toLowerCase().includes(q);
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !uploadFile) return;
    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('reportFile', uploadFile);
      form.append('notes', techNotes);
      await api.put(`/lab/${selectedOrder._id}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg(`Report for ${selectedOrder.patientId?.name} uploaded successfully!`);
      setSelectedOrder(null);
      setUploadFile(null);
      setTechNotes('');
      refetch();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Laboratory Worklist</h2>
        <p className="text-slate-500 mt-1 text-sm">Process pending test orders and upload results to patient records.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Orders', value: isLoading ? '...' : pendingOrders.length, icon: Clock, bg: 'bg-primary/10', color: 'text-primary' },
          { label: 'Urgent / Emergency', value: isLoading ? '...' : urgentCount, icon: AlertCircle, bg: urgentCount > 0 ? 'bg-red-50' : 'bg-slate-50', color: urgentCount > 0 ? 'text-red-600' : 'text-slate-400' },
          { label: 'Completed', value: isLoading ? '...' : completedToday, icon: CheckCircle2, bg: 'bg-green-50', color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon size={22} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Order List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: '500px' }}>
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={17} className="text-primary" /> Active Worklist
            </h3>
            <div className="relative w-52">
              <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                placeholder="Search patient or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4">
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  <AlertCircle size={18} /> {error}
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <FlaskConical size={40} className="mb-3 opacity-20" />
                <p className="text-sm">{searchQuery ? 'No matches found.' : 'No pending orders.'}</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-5 py-3 font-semibold">Test Required</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className={`hover:bg-slate-50/80 transition-colors ${selectedOrder?._id === order._id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{order.patientId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Dr. {order.doctorId?.name || 'Unassigned'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 text-sm">{order.testName}</p>
                        <p className="text-xs text-slate-400">{order.testCategory || 'Lab'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={order.priority || 'Routine'} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => { setSelectedOrder(order); setUploadFile(null); setTechNotes(''); }}
                          className={`text-sm px-4 py-1.5 rounded-xl font-semibold transition-all border ${
                            selectedOrder?._id === order._id
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary shadow-sm'
                          }`}
                        >
                          {selectedOrder?._id === order._id ? 'Selected ✓' : 'Process'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Upload Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud size={17} className="text-primary" /> Result Uploader
            </h3>
          </div>

          <div className="flex-1 p-5">
            {!selectedOrder ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 min-h-[300px]">
                <FileText size={48} className="mb-4 opacity-20" strokeWidth={1} />
                <p className="font-medium text-slate-600 text-sm">No order selected</p>
                <p className="text-xs mt-1">Select an order from the worklist to upload results.</p>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="flex flex-col h-full space-y-4">

                {/* Selected Order Summary */}
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/15">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Selected Order</span>
                    <button type="button" onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800">{selectedOrder.patientId?.name}</h4>
                  <p className="text-sm text-slate-500">Test: <span className="font-medium text-slate-700">{selectedOrder.testName}</span></p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Report (PDF or Image)</label>
                  <div className="border-2 border-dashed border-primary/20 rounded-xl bg-slate-50 hover:bg-primary/5 transition-colors p-6 flex flex-col items-center justify-center min-h-[140px] relative cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    {!uploadFile ? (
                      <>
                        <UploadCloud size={30} className="text-primary/60 mb-2" />
                        <span className="text-sm font-medium text-primary">Click or drag file here</span>
                        <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — Max 10MB</span>
                      </>
                    ) : (
                      <div className="text-center">
                        <FileText size={30} className="text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{uploadFile.name}</p>
                        <span className="text-xs text-green-600 font-semibold">✓ Ready to upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technician Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Technician Notes <span className="font-normal text-slate-400">(optional)</span></label>
                  <textarea
                    value={techNotes}
                    onChange={(e) => setTechNotes(e.target.value)}
                    placeholder="e.g., Sample was slightly hemolyzed..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none h-20 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !uploadFile}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                >
                  {isSubmitting ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Uploading...</>
                  ) : (
                    <><UploadCloud size={17} /> Submit Final Report</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const LabTechnicianDashboard = () => (
  <DashboardLayout navLinks={labLinks} title="Laboratory Operations">
    <Routes>
      <Route path="/" element={<LabOverview />} />
      <Route path="/completed" element={<CompletedTests />} />
      <Route path="/inventory" element={<LabInventory />} />
      <Route path="/settings" element={<ProfileSettings />} />
    </Routes>
  </DashboardLayout>
);

export default LabTechnicianDashboard;