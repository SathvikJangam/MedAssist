import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, ArrowLeft, CheckCircle2, 
  AlertCircle, Navigation, Wrench, User, Activity, X, MapPin, UserPlus
} from 'lucide-react';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const AmbulanceManagement = () => {
  const [view, setView] = useState('grid');
  const [fleet, setFleet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningVehicle, setAssigningVehicle] = useState(null);
  const [dispatchingVehicle, setDispatchingVehicle] = useState(null);

  const { data: staff } = useFetch('/admin/staff');
  const drivers = (staff || []).filter(s => s.role === 'AmbulanceDriver' && s.isApproved);
  const nurses = (staff || []).filter(s => s.role === 'Nurse' && s.isApproved);

  // Fetch Fleet from MongoDB
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

  useEffect(() => {
    if (view === 'grid') fetchFleet();
  }, [view]);

  return (
    <div className="space-y-6 max-w-7xl pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            {view === 'grid' ? 'Ambulance Fleet Management' : 'Register New Ambulance'}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {view === 'grid' 
              ? 'Track vehicle status, crew assignments (Driver & Nurse), and patient dispatch locations.' 
              : 'Add a new vehicle to the hospital fleet.'}
          </p>
        </div>
        {view === 'grid' ? (
          <button 
            onClick={() => setView('add')}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus size={18} /> Register Vehicle
          </button>
        ) : (
          <button 
            onClick={() => setView('grid')}
            className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={18} /> Back to Fleet
          </button>
        )}
      </div>

      {view === 'grid' ? (
        <FleetGrid
          fleet={fleet}
          setFleet={setFleet}
          isLoading={isLoading}
          onAssignCrew={(v) => setAssigningVehicle(v)}
          onDispatch={(v) => setDispatchingVehicle(v)}
          fetchFleet={fetchFleet}
        />
      ) : (
        <AddAmbulanceForm onSuccess={() => setView('grid')} />
      )}

      {/* ASSIGN CREW MODAL */}
      {assigningVehicle && (
        <AssignCrewModal
          vehicle={assigningVehicle}
          drivers={drivers}
          nurses={nurses}
          onClose={() => setAssigningVehicle(null)}
          onSuccess={() => {
            setAssigningVehicle(null);
            fetchFleet();
          }}
        />
      )}

      {/* DISPATCH TO PATIENT MODAL */}
      {dispatchingVehicle && (
        <DispatchPatientModal
          vehicle={dispatchingVehicle}
          drivers={drivers}
          nurses={nurses}
          onClose={() => setDispatchingVehicle(null)}
          onSuccess={() => {
            setDispatchingVehicle(null);
            fetchFleet();
          }}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Visual Fleet Grid ---
const FleetGrid = ({ fleet, setFleet, isLoading, onAssignCrew, onDispatch, fetchFleet }) => {
  
  const updateStatus = async (id, newStatus) => {
    try {
      setFleet(fleet.map(v => v._id === id ? { ...v, status: newStatus } : v));
      await api.put(`/ambulances/${id}/status`, { status: newStatus });
      fetchFleet();
    } catch (error) {
      alert('Failed to update status');
      fetchFleet();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (fleet.length === 0) {
    return (
      <div className="text-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
        <Truck size={48} className="mx-auto mb-3 opacity-20" />
        <p className="font-semibold text-slate-600">No ambulances registered yet</p>
        <p className="text-xs mt-1">Click "Register Vehicle" to add an ambulance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl"><Truck size={24} /></div>
          <div><h3 className="text-2xl font-extrabold text-slate-800">{fleet.length}</h3><p className="text-xs font-semibold text-slate-500">Total Fleet</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl"><CheckCircle2 size={24} /></div>
          <div><h3 className="text-2xl font-extrabold text-slate-800">{fleet.filter(f=>f.status==='Available').length}</h3><p className="text-xs font-semibold text-slate-500">Available</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl"><Navigation size={24} /></div>
          <div><h3 className="text-2xl font-extrabold text-blue-600">{fleet.filter(f=>f.status==='Dispatched').length}</h3><p className="text-xs font-semibold text-slate-500">Dispatched</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Wrench size={24} /></div>
          <div><h3 className="text-2xl font-extrabold text-slate-800">{fleet.filter(f=>f.status==='Maintenance').length}</h3><p className="text-xs font-semibold text-slate-500">Maintenance</p></div>
        </div>
      </div>

      {/* Ambulance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fleet.map((vehicle) => {
          const hasDriver = Boolean(vehicle.driverId);
          const hasNurse = Boolean(vehicle.assignedNurseId);
          const hasFullCrew = hasDriver && hasNurse;

          return (
            <div key={vehicle._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 flex items-center gap-1 w-max mb-1.5">
                      {vehicle.vehicleType === 'AdvancedLifeSupport' ? <><Activity size={10} className="text-red-500" /> ALS ICU Unit</> : 'Basic Unit'}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800">{vehicle.vehicleNumber}</h3>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                    vehicle.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-200' :
                    vehicle.status === 'Dispatched' ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>

                {/* Assigned Crew Block */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-4 space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Crew</p>
                    <button
                      onClick={() => onAssignCrew(vehicle)}
                      className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-1"
                    >
                      <UserPlus size={12} /> {hasDriver ? 'Change' : 'Assign'}
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Driver:</span>
                      <span className={`font-bold ${hasDriver ? 'text-slate-800' : 'text-amber-600 italic'}`}>
                        {vehicle.driverId?.name || '⚠️ Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">EMT Nurse:</span>
                      <span className={`font-bold ${hasNurse ? 'text-slate-800' : 'text-amber-600 italic'}`}>
                        {vehicle.assignedNurseId?.name || '⚠️ Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Location (if active) */}
                {vehicle.status === 'Dispatched' && vehicle.dispatchLocation && (
                  <div className="bg-red-50/60 rounded-xl p-3 border border-red-100 mb-4 text-xs space-y-1">
                    <p className="font-bold text-red-800 flex items-center gap-1">
                      <MapPin size={12} className="text-red-600" /> Patient Destination:
                    </p>
                    <p className="text-slate-800 pl-4 font-medium">{vehicle.dispatchLocation}</p>
                    {vehicle.dispatchNotes && (
                      <p className="text-slate-500 pl-4 italic">"{vehicle.dispatchNotes}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="border-t border-slate-100 pt-3 flex gap-2 mt-auto">
                {vehicle.status === 'Available' && (
                  <button
                    onClick={() => onDispatch(vehicle)}
                    className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Navigation size={13} /> Dispatch to Patient
                  </button>
                )}
                {vehicle.status === 'Dispatched' && (
                  <button
                    onClick={() => updateStatus(vehicle._id, 'Available')}
                    className="flex-1 bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Complete Mission
                  </button>
                )}
                {vehicle.status !== 'Maintenance' && (
                  <button
                    onClick={() => updateStatus(vehicle._id, 'Maintenance')}
                    title="Send for Maintenance"
                    className="px-3 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 rounded-xl transition-colors"
                  >
                    <Wrench size={15} />
                  </button>
                )}
                {vehicle.status === 'Maintenance' && (
                  <button
                    onClick={() => updateStatus(vehicle._id, 'Available')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    Mark Available
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MODAL: Assign Crew ---
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
            <p className="font-bold text-slate-800">Vehicle: {vehicle.vehicleNumber}</p>
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

// --- MODAL: Dispatch with Driver & Nurse to Patient ---
const DispatchPatientModal = ({ vehicle, drivers, nurses, onClose, onSuccess }) => {
  const [driverId, setDriverId] = useState(vehicle.driverId?._id || (drivers[0]?._id || ''));
  const [assignedNurseId, setAssignedNurseId] = useState(vehicle.assignedNurseId?._id || (nurses[0]?._id || ''));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!driverId || !assignedNurseId) {
      setErrorMsg('Both Driver and Nurse must be assigned to dispatch this ambulance to a patient.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Ensure crew is assigned
      await api.put(`/ambulances/${vehicle._id}/crew`, {
        driverId,
        assignedNurseId
      });

      // 2. Dispatch with patient pickup location
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
          <div className="flex items-center gap-2 text-red-900">
            <Navigation className="text-red-600" size={20} />
            <h3 className="font-extrabold text-lg">Dispatch to Patient</h3>
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

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <p className="font-bold text-slate-800">Dispatching Ambulance: {vehicle.vehicleNumber}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Allocated Driver *</label>
              <select
                required
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-red-500 focus:outline-none bg-slate-50"
              >
                <option value="">— Select Driver —</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Allocated Nurse *</label>
              <select
                required
                value={assignedNurseId}
                onChange={(e) => setAssignedNurseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-red-500 focus:outline-none bg-slate-50"
              >
                <option value="">— Select Nurse —</option>
                {nurses.map(n => (
                  <option key={n._id} value={n._id}>{n.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Patient Pickup Location / Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 45 Green Avenue, Jubilee Hills, Hyderabad"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dispatch Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Elderly patient, cardiac history, oxygen required..."
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
              {loading ? 'Dispatching...' : 'Dispatch Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Add Ambulance Form ---
const AddAmbulanceForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ vehicleNumber: '', vehicleType: 'Basic' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/ambulances', formData);
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add ambulance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
      <h3 className="text-lg font-bold mb-6 border-b border-slate-100 pb-3 text-slate-800">Vehicle Registration</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle License Plate *</label>
            <input
              type="text"
              name="vehicleNumber"
              required
              placeholder="e.g. AP-09-AB-1234"
              onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl uppercase outline-none focus:border-primary bg-slate-50 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Class *</label>
            <select
              name="vehicleType"
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-primary text-sm font-medium"
            >
              <option value="Basic">Basic Life Support Unit</option>
              <option value="AdvancedLifeSupport">Advanced Life Support (ALS ICU)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm shadow-sm"
          >
            {isSubmitting ? 'Registering...' : 'Register Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmbulanceManagement;