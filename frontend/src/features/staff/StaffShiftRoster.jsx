import React, { useState } from 'react';
import {
  Users, Clock, Plus, Edit2, AlertCircle, Truck,
  Navigation, UserCheck, CheckCircle2, X, MapPin, FileText, Phone
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const StaffShiftRoster = () => {
  const { data: staff, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useFetch('/admin/staff');
  const { data: fleet, isLoading: fleetLoading, error: fleetError, refetch: refetchFleet } = useFetch('/ambulances');

  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' | 'staff'
  const [assigningVehicle, setAssigningVehicle] = useState(null);
  const [dispatchingVehicle, setDispatchingVehicle] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  const safeStaff = staff || [];
  const safeFleet = fleet || [];

  // Filter for operational roles
  const drivers = safeStaff.filter(u => u.role === 'AmbulanceDriver' && u.isApproved);
  const nurses = safeStaff.filter(u => u.role === 'Nurse' && u.isApproved);
  const operationalStaff = safeStaff.filter(u => ['AmbulanceDriver', 'Nurse', 'OfficeStaff'].includes(u.role) && u.isApproved);

  // Helper: Find vehicle assigned to a driver or nurse
  const getAssignedVehicle = (userId) => {
    return safeFleet.find(v => v.driverId?._id === userId || v.assignedNurseId?._id === userId);
  };

  if (staffLoading || fleetLoading) {
    return (
      <div className="space-y-4 max-w-7xl pb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (staffError || fleetError) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
        <AlertCircle size={18} /> Error loading operational data. Please check network.
      </div>
    );
  }

  const availableVehicles = safeFleet.filter(v => v.status === 'Available');
  const dispatchedVehicles = safeFleet.filter(v => v.status === 'Dispatched');

  return (
    <div className="space-y-6 max-w-7xl pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Operational Roster & Fleet Dispatch</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Assign ambulances to drivers & EMT nurses, manage emergency dispatches, and schedule duty shifts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'fleet'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck size={14} /> Ambulance Crew & Dispatch ({safeFleet.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} /> Staff Duty Roster ({operationalStaff.length})
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-1">Total Ambulances</p>
          <p className="text-2xl font-extrabold text-slate-800">{safeFleet.length}</p>
          <p className="text-xs text-green-600 font-semibold mt-1">{availableVehicles.length} Ready for dispatch</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-1">Active Missions</p>
          <p className="text-2xl font-extrabold text-blue-600">{dispatchedVehicles.length}</p>
          <p className="text-xs text-blue-500 font-semibold mt-1">En route to patients</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-1">Approved Drivers</p>
          <p className="text-2xl font-extrabold text-slate-800">{drivers.length}</p>
          <p className="text-xs text-slate-400 mt-1">Licensed vehicle operators</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-1">EMT Nurses</p>
          <p className="text-2xl font-extrabold text-slate-800">{nurses.length}</p>
          <p className="text-xs text-slate-400 mt-1">Emergency transit medics</p>
        </div>
      </div>

      {/* TAB 1: FLEET & CREW DISPATCH */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeFleet.map((vehicle) => {
            const hasFullCrew = Boolean(vehicle.driverId && vehicle.assignedNurseId);
            const isDispatched = vehicle.status === 'Dispatched';

            return (
              <div
                key={vehicle._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800">{vehicle.vehicleNumber}</h3>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block mt-1">
                        {vehicle.vehicleType === 'AdvancedLifeSupport' ? '🚑 ALS ICU Unit' : '🚐 Basic Life Unit'}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      vehicle.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-200' :
                      vehicle.status === 'Dispatched' ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>

                  {/* Crew Assignment Box */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2 mb-4">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Crew</span>
                      <button
                        onClick={() => setAssigningVehicle(vehicle)}
                        className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-1"
                      >
                        <UserCheck size={13} /> {vehicle.driverId ? 'Change Crew' : 'Assign Crew'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Driver:</span>
                      <span className={`font-bold ${vehicle.driverId ? 'text-slate-800' : 'text-amber-600 italic'}`}>
                        {vehicle.driverId ? vehicle.driverId.name : '⚠️ None Assigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">EMT Nurse:</span>
                      <span className={`font-bold ${vehicle.assignedNurseId ? 'text-slate-800' : 'text-amber-600 italic'}`}>
                        {vehicle.assignedNurseId ? vehicle.assignedNurseId.name : '⚠️ None Assigned'}
                      </span>
                    </div>
                  </div>

                  {/* Active Mission Destination Info */}
                  {isDispatched && vehicle.dispatchLocation && (
                    <div className="bg-red-50/60 rounded-xl p-3 border border-red-100 mb-4 text-xs space-y-1">
                      <p className="font-bold text-red-800 flex items-center gap-1.5">
                        <MapPin size={13} className="text-red-600" /> Destination:
                      </p>
                      <p className="text-slate-800 pl-4 font-medium">{vehicle.dispatchLocation}</p>
                      {vehicle.dispatchNotes && (
                        <p className="text-slate-500 pl-4 italic">"{vehicle.dispatchNotes}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Dispatch / Return Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2 mt-auto">
                  {vehicle.status === 'Available' ? (
                    <button
                      onClick={() => setDispatchingVehicle(vehicle)}
                      disabled={!hasFullCrew}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Navigation size={14} /> Dispatch to Patient
                    </button>
                  ) : isDispatched ? (
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/ambulances/${vehicle._id}/status`, { status: 'Available' });
                          refetchFleet();
                        } catch (err) {
                          alert('Failed to update status');
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <CheckCircle2 size={14} /> Mark Mission Completed
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/ambulances/${vehicle._id}/status`, { status: 'Available' });
                          refetchFleet();
                        } catch (err) {
                          alert('Failed to update status');
                        }
                      }}
                      className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    >
                      Mark Available
                    </button>
                  )}

                  {!hasFullCrew && vehicle.status === 'Available' && (
                    <p className="text-[11px] text-amber-600 text-center font-medium">
                      Driver and Nurse must be assigned before dispatch
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {safeFleet.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <Truck size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-slate-600">No ambulances registered yet</p>
              <p className="text-xs mt-1">Please register ambulances in the fleet module.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OPERATIONAL STAFF SHIFT ROSTER */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold">Staff Member</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Shift Hours</th>
                  <th className="px-6 py-4 font-semibold">Assigned Ambulance</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operationalStaff.map((user) => {
                  const assignedVehicle = getAssignedVehicle(user._id);

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{user.email} • {user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/15">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-primary" />
                          {user.shiftStart || '09:00'} – {user.shiftEnd || '17:00'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {assignedVehicle ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Truck size={13} /> {assignedVehicle.vehicleNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          user.isActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {user.isActive ? 'On Duty' : 'Off Duty'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditingStaff(user)}
                          className="text-xs text-slate-600 hover:text-primary hover:bg-primary/10 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit Shift
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ASSIGN CREW TO VEHICLE */}
      {assigningVehicle && (
        <AssignCrewModal
          vehicle={assigningVehicle}
          drivers={drivers}
          nurses={nurses}
          onClose={() => setAssigningVehicle(null)}
          onSuccess={() => {
            setAssigningVehicle(null);
            refetchFleet();
            refetchStaff();
          }}
        />
      )}

      {/* MODAL 2: DISPATCH TO PATIENT */}
      {dispatchingVehicle && (
        <DispatchPatientModal
          vehicle={dispatchingVehicle}
          onClose={() => setDispatchingVehicle(null)}
          onSuccess={() => {
            setDispatchingVehicle(null);
            refetchFleet();
          }}
        />
      )}

      {/* MODAL 3: EDIT STAFF SHIFT */}
      {editingStaff && (
        <EditShiftModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSuccess={() => {
            setEditingStaff(null);
            refetchStaff();
          }}
        />
      )}
    </div>
  );
};

const AssignCrewModal = ({ vehicle, drivers, nurses, onClose, onSuccess }) => {
  const [driverId, setDriverId] = useState(vehicle.driverId?._id || '');
  const [assignedNurseId, setAssignedNurseId] = useState(vehicle.assignedNurseId?._id || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.put(`/ambulances/${vehicle._id}/crew`, {
        driverId: driverId || null,
        assignedNurseId: assignedNurseId || null
      });
      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to assign crew.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Truck className="text-primary" size={20} />
            <h3 className="font-bold text-slate-800 text-lg">Assign Ambulance Crew</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <p className="font-bold text-slate-700">Vehicle: {vehicle.vehicleNumber}</p>
            <p className="text-slate-500 mt-0.5">
              Type: {vehicle.vehicleType === 'AdvancedLifeSupport' ? 'ALS ICU Unit' : 'Basic Unit'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Driver *</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50"
            >
              <option value="">— Select Driver —</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.phone}) • Shift: {d.shiftStart}-{d.shiftEnd}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select EMT Nurse *</label>
            <select
              value={assignedNurseId}
              onChange={(e) => setAssignedNurseId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50"
            >
              <option value="">— Select Nurse —</option>
              {nurses.map(n => (
                <option key={n._id} value={n._id}>
                  {n.name} ({n.phone}) • Shift: {n.shiftStart}-{n.shiftEnd}
                </option>
              ))}
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
              {loading ? 'Saving...' : 'Save Crew Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DispatchPatientModal = ({ vehicle, onClose, onSuccess }) => {
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!vehicle.driverId || !vehicle.assignedNurseId) {
      setErrorMsg('Cannot dispatch: Both Driver and Nurse must be assigned to this ambulance.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      await api.put(`/ambulances/${vehicle._id}/status`, {
        status: 'Dispatched',
        dispatchLocation: location,
        dispatchNotes: notes
      });
      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch ambulance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-200 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
          <div className="flex items-center gap-2">
            <Navigation className="text-red-600" size={20} />
            <h3 className="font-extrabold text-red-900 text-lg">Dispatch to Patient</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-red-100 text-red-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleDispatch} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
            <p className="font-bold text-slate-800">Vehicle: {vehicle.vehicleNumber}</p>
            <p className="text-slate-600">Driver: <strong>{vehicle.driverId?.name}</strong></p>
            <p className="text-slate-600">EMT Nurse: <strong>{vehicle.assignedNurseId?.name}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Patient Pickup Location / Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flat 402, Green Valley Apartments, Banjara Hills"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-slate-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">This destination will be forwarded directly to the driver's GPS map.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Dispatch Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Patient has chest pain, unconscious, oxygen support requested..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-slate-50 resize-none"
            />
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
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Navigation size={15} />
              {loading ? 'Dispatching...' : 'Dispatch Vehicle Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditShiftModal = ({ staff, onClose, onSuccess }) => {
  const [shiftStart, setShiftStart] = useState(staff.shiftStart || '09:00');
  const [shiftEnd, setShiftEnd] = useState(staff.shiftEnd || '17:00');
  const [isActive, setIsActive] = useState(staff.isActive !== undefined ? staff.isActive : true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.put(`/admin/staff/${staff._id}/shift`, {
        shiftStart,
        shiftEnd,
        isActive
      });
      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update shift.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="text-primary" size={20} />
            <h3 className="font-bold text-slate-800 text-base">Edit Shift Hours</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={15} />
              {errorMsg}
            </div>
          )}

          <div>
            <p className="text-sm font-bold text-slate-800">{staff.name}</p>
            <p className="text-xs text-primary font-semibold">{staff.role}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Start Time</label>
              <input
                type="time"
                required
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">End Time</label>
              <input
                type="time"
                required
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Staff Active / On Duty</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffShiftRoster;