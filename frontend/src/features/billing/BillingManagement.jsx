import React, { useState } from 'react';
import { CreditCard, FileText, IndianRupee, Plus, Search, CheckCircle2, Clock, Printer, X, AlertCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const BillingManagement = () => {
  const { data: invoices, isLoading, error, setData: setInvoices, refetch } = useFetch('/billing/invoices');
  const { data: patients } = useFetch('/patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  const processPayment = async (id) => {
    try {
      // Optimistic UI update
      setInvoices(invoices.map(inv => inv._id === id ? { ...inv, status: 'Paid', paidAt: new Date().toISOString() } : inv));
      // Database update
      await api.put(`/billing/invoices/${id}/pay`);
    } catch (err) {
      alert('Payment processing failed: ' + (err.response?.data?.message || err.message));
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl pb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
        <AlertCircle size={18} /> Error loading billing data: {error}
      </div>
    );
  }

  const safeInvoices = invoices || [];
  const pendingCount = safeInvoices.filter(i => i.status === 'Pending').length;
  const paidCount = safeInvoices.filter(i => i.status === 'Paid').length;
  const revenue = safeInvoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const filteredInvoices = safeInvoices.filter(inv => {
    const matchesSearch = !searchTerm || 
      inv.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientId?.phone?.includes(searchTerm) ||
      inv.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Billing & Invoices</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage patient invoicing, fee settlements, and official payment receipts.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus size={18} /> Generate Invoice
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-green-50 text-green-700 rounded-xl">
            <IndianRupee size={26} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">₹{revenue.toLocaleString()}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Total Revenue Collected</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={26} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{pendingCount}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Pending Settlement</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <CreditCard size={26} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{paidCount}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Paid Invoices</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, type, or invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['All', 'Pending', 'Paid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Invoice ID</th>
                <th className="px-6 py-4 font-semibold">Patient & Contact</th>
                <th className="px-6 py-4 font-semibold">Service Type</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary text-xs">
                    #{inv._id.substring(inv._id.length - 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{inv.patientId?.name || 'Walk-in Patient'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{inv.patientId?.phone || inv.patientId?.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {inv.type || 'Consultation'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-slate-800 text-sm">₹{inv.amount?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      inv.status === 'Paid'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {inv.status === 'Pending' ? (
                      <button
                        onClick={() => processPayment(inv._id)}
                        className="text-xs bg-primary text-white font-bold px-3.5 py-1.5 rounded-lg hover:bg-primary-hover shadow-sm transition-colors"
                      >
                        Process Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => setReceiptInvoice(inv)}
                        className="text-xs text-slate-700 hover:text-primary hover:bg-primary/10 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Printer size={13} /> View Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No invoices matching the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <CreateInvoiceModal
          patients={patients || []}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); refetch(); }}
        />
      )}

      {/* VIEW RECEIPT MODAL */}
      {receiptInvoice && (
        <ReceiptModal
          invoice={receiptInvoice}
          onClose={() => setReceiptInvoice(null)}
        />
      )}
    </div>
  );
};

const CreateInvoiceModal = ({ patients, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patientId: patients[0]?._id || '',
    type: 'Consultation',
    amount: '',
    status: 'Pending'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const types = [
    'Consultation',
    'Lab Test & Diagnostics',
    'Emergency Care & Resuscitation',
    'Pharmacy Prescription',
    'Surgical Procedure',
    'Room / Bed Charge',
    'Ambulance Transit'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      setErrorMsg('Please select a valid patient.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/billing/invoices', {
        ...formData,
        amount: Number(formData.amount)
      });
      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CreditCard className="text-primary" size={20} />
            <h3 className="font-bold text-slate-800 text-lg">Generate Invoice</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Patient *</label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50"
            >
              <option value="">— Select Patient —</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.phone || p.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Service / Bill Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50"
            >
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 1500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Payment Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid Immediately</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceiptModal = ({ invoice, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            <h3 className="font-bold text-slate-800 text-lg">Hospital Payment Receipt</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4" id="printable-receipt">
          <div className="text-center pb-4 border-b border-slate-100">
            <h4 className="font-extrabold text-xl text-slate-900">MedAssist Hospital</h4>
            <p className="text-xs text-slate-500">Super Specialty Medical Center</p>
            <p className="text-xs text-slate-400 mt-0.5">Receipt #{invoice._id.substring(invoice._id.length - 8).toUpperCase()}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-800">{invoice.patientId?.name || 'Walk-in Patient'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact:</span>
              <span className="text-slate-700">{invoice.patientId?.phone || invoice.patientId?.email || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Service:</span>
              <span className="font-semibold text-slate-800">{invoice.type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-green-600">PAID</span>
            </div>
            {invoice.paidAt && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Paid On:</span>
                <span className="text-slate-700">{new Date(invoice.paidAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center mt-4">
            <span className="font-bold text-slate-700">Total Amount Settled</span>
            <span className="text-2xl font-extrabold text-green-700">₹{invoice.amount?.toLocaleString()}</span>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;