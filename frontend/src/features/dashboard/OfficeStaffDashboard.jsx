import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Truck, Users, UserPlus, CheckCircle2, Navigation, AlertCircle,
  LayoutDashboard, Settings, MapPin, FileText, X
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ProfileSettings from '../auth/ProfileSettings';
import StaffShiftRoster from '../staff/StaffShiftRoster';

const officeLinks = [
  { name: 'Dispatch Center', path: '/office-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Shift Roster', path: '/office-dashboard/roster', icon: Users },
  { name: 'My Profile', path: '/office-dashboard/settings', icon: Settings },
];

const DispatchCenter = () => {
  const [fleet, setFleet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningVehicle, setAssigningVehicle] = useState(null);
  const [dispatchingVehicle, setDispatchingVehicle] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({ location: '', notes: '' });

  const { data: allStaff } = useFetch('/admin/staff');

  const drivers = allStaff?.filter(staff => staff.role === 'AmbulanceDriver' && staff.isApproved) || [];
  const nurses = allStaff?.filter(staff => staff.role === 'Nurse' && staff.isApproved) || [];

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/ambulances');
      setFleet(data);
    } catch (error) {
      console.error('Failed to fetch fleet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCrew = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const driverId = formData.get('driverId');
    const nurseId = formData.get('nurseId');

    try {
      const { data } = await api.put(`/ambulances/${assigningVehicle._id}/crew`, {
        driverId: driverId || null,
        assignedNurseId: nurseId || null
      });
      setFleet(fleet.map(v => v._id === data._id ? data : v));
      setAssigningVehicle(null);
    } catch (error) {
      alert('Failed to assign crew.');
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchingVehicle.driverId) {
      alert('Cannot dispatch: No driver assigned. Please assign a crew first.');
      return;
    }
    try {
      const { data } = await api.put(`/ambulances/${dispatchingVehicle._id}/status`, {
        status: 'Dispatched',
        dispatchLocation: dispatchForm.location,
        dispatchNotes: dispatchForm.notes
      });
      setFleet(fleet.map(v => v._id === data._id ? data : v));
      setDispatchingVehicle(null);
      setDispatchForm({ location: '', notes: '' });
    } catch (error) {
      alert('Failed to dispatch vehicle.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/ambulances/${id}/status`, { status: newStatus });
      setFleet(fleet.map(v => v._id === data._id ? data : v));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />
      ))}
    </div>
  );

  const availableCount = fleet.filter(v => v.status === 'Available').length;
  const dispatchedCount = fleet.filter(v => v.status === 'Dispatched').length;

  return (
    <div className="space-y-6 relative max-w-7xl pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Dispatch & Crew Center</h2>
        <p className="text-slate-500 mt-1 text-sm">Assign personnel to vehicles and manage emergency deployments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Fleet', value: fleet.length, bg: 'bg-slate-50', color: 'text-slate-700' },
          { label: 'Available', value: availableCount, bg: 'bg-green-50', color: 'text-green-700' },
          { label: 'Dispatched', value: dispatchedCount, bg: 'bg-blue-50', color: 'text-blue-700' },
          { label: 'Maintenance', value: fleet.filter(v => v.status === 'Maintenance').length, bg: 'bg-red-50', color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fleet.map((vehicle) => (
          <div key={vehicle._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{vehicle.vehicleNumber}</h3>
                <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 mt-1 inline-block">
                  {vehicle.vehicleType === 'AdvancedLifeSupport' ? '🚑 ALS ICU Unit' : '🚐 Basic Unit'}
                </span>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                vehicle.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-200' :
                vehicle.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {vehicle.status}
              </span>
            </div>

            {/* Crew Details */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Crew</p>
                <button
                  onClick={() => setAssigningVehicle(vehicle)}
                  className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1"
                >
                  <UserPlus size={12} /> Edit
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Driver:</span>
                  <span className={`font-semibold ${!vehicle.driverId ? 'text-red-500 italic text-xs' : 'text-slate-800'}`}>
                    {vehicle.driverId?.name || 'Not Assigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Nurse:</span>
                  <span className={`font-semibold ${!vehicle.assignedNurseId ? 'text-red-500 italic text-xs' : 'text-slate-800'}`}>
                    {vehicle.assignedNurseId?.name || 'Not Assigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dispatch Location (if dispatched) */}
            {vehicle.status === 'Dispatched' && vehicle.dispatchLocation && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 mb-4 flex items-start gap-2">
                <MapPin size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Destination</p>
                  <p className="text-sm font-medium text-slate-800">{vehicle.dispatchLocation}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-slate-100 pt-3 mt-auto">
              {vehicle.status === 'Available' ? (
                <button
                  onClick={() => { setDispatchingVehicle(vehicle); setDispatchForm({ location: '', notes: '' }); }}
                  disabled={!vehicle.driverId}
                  className="w-full bg-primary text-white text-sm font-bold py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-colors"
                >
                  <Navigation size={15} /> Dispatch Vehicle
                </button>
              ) : vehicle.status === 'Dispatched' ? (
                <button onClick={() => updateStatus(vehicle._id, 'Available')} className="w-full bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-green-700 flex justify-center items-center gap-2 transition-colors">
                  <CheckCircle2 size={15} /> Complete Mission
                </button>
              ) : (
                <button onClick={() => updateStatus(vehicle._id, 'Available')} className="w-full bg-slate-100 text-slate-700 text-sm font-medium py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                  Mark Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ======= MODAL: Assign Crew ======= */}
      {assigningVehicle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">Assign Crew</h3>
              <button onClick={() => setAssigningVehicle(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-5">Select personnel for <strong className="text-slate-800">{assigningVehicle.vehicleNumber}</strong></p>

            <form onSubmit={handleAssignCrew} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Driver</label>
                <select name="driverId" defaultValue={assigningVehicle.driverId?._id || ""} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-primary text-sm">
                  <option value="">— No Driver —</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select EMT Nurse</label>
                <select name="nurseId" defaultValue={assigningVehicle.assignedNurseId?._id || ""} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-primary text-sm">
                  <option value="">— No Nurse —</option>
                  {nurses.map(n => <option key={n._id} value={n._id}>{n.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-3 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAssigningVehicle(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-200 text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary-hover text-sm transition-colors">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======= MODAL: Dispatch with Location ======= */}
      {dispatchingVehicle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Navigation size={18} className="text-primary" /> Dispatch Vehicle
              </h3>
              <button onClick={() => setDispatchingVehicle(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Dispatching <strong className="text-slate-800">{dispatchingVehicle.vehicleNumber}</strong>
              {dispatchingVehicle.driverId?.name && <> • Driver: <strong>{dispatchingVehicle.driverId.name}</strong></>}
            </p>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <MapPin size={14} className="inline mr-1" /> Dispatch Location *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchForm.location}
                  onChange={e => setDispatchForm({ ...dispatchForm, location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50"
                  placeholder="e.g., 123 MG Road, Sector 5, Hyderabad"
                />
                <p className="text-xs text-slate-400 mt-1">This address will be sent to the driver's Google Maps.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <FileText size={14} className="inline mr-1" /> Dispatch Notes
                </label>
                <textarea
                  value={dispatchForm.notes}
                  onChange={e => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50 resize-none h-20"
                  placeholder="e.g., Patient is elderly, needs stretcher..."
                />
              </div>

              <div className="flex gap-3 pt-3 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setDispatchingVehicle(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-200 text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 text-sm transition-colors flex items-center justify-center gap-2">
                  <Navigation size={15} /> Dispatch Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const OfficeStaffDashboard = () => {
  return (
    <DashboardLayout navLinks={officeLinks} title="Operations & Dispatch">
      <Routes>
        <Route path="/" element={<DispatchCenter />} />
        <Route path="/roster" element={<StaffShiftRoster />} />
        <Route path="/settings" element={<ProfileSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OfficeStaffDashboard;