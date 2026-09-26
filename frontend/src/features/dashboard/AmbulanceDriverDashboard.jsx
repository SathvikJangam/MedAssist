import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Truck, MapPin, Navigation, CheckCircle2, AlertCircle,
  Phone, User, Clock, Settings, LayoutDashboard, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import ProfileSettings from '../auth/ProfileSettings';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const driverLinks = [
  { name: 'My Mission', path: '/driver-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'My Profile', path: '/driver-dashboard/profile', icon: Settings },
];

const DriverMissionPanel = () => {
  const { user } = useAuthStore();
  const { data: ambulance, isLoading, error, refetch } = useFetch('/ambulances/my-mission');
  const [isCompleting, setIsCompleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCompleteMission = async () => {
    if (!window.confirm('Mark this mission as completed? The vehicle will become available for new dispatches.')) return;
    setIsCompleting(true);
    try {
      await api.put('/ambulances/complete-mission');
      setSuccessMsg('Mission completed successfully! Vehicle is now available.');
      refetch();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete mission');
    } finally {
      setIsCompleting(false);
    }
  };

  const openGoogleMaps = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
        <AlertCircle size={18} /> Error loading mission data: {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm animate-in">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck size={18} className="text-blue-300" />
            <span className="text-blue-300 text-sm font-medium">Ambulance Driver Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold">{user?.name || 'Driver'}</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {ambulance?.status === 'Dispatched' ? '🔴 Active Mission — En Route' : '🟢 Standing By — Ready for Dispatch'}
          </p>
        </div>
        <button onClick={refetch} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
          <RefreshCw size={18} className="text-white" />
        </button>
      </div>

      {!ambulance ? (
        /* No ambulance assigned */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <Truck size={56} className="mx-auto mb-4 text-slate-200" strokeWidth={1} />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Vehicle Assigned</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            You are not currently assigned to any ambulance. Please contact the Office Staff or Admin to get assigned to a vehicle.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium border border-amber-200">
            <Clock size={15} /> Awaiting Assignment
          </div>
        </div>
      ) : ambulance.status !== 'Dispatched' ? (
        /* Assigned but not dispatched — standing by */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={22} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-800">Standing By</h3>
              <p className="text-sm text-green-600">Your vehicle is available. Wait for a dispatch order from office staff.</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Assigned Vehicle</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{ambulance.vehicleNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ambulance.vehicleType === 'AdvancedLifeSupport' ? '🚑 ALS ICU Unit' : '🚐 Basic Unit'}
                </p>
              </div>
              <Truck size={36} className="text-slate-300" />
            </div>

            {ambulance.assignedNurseId && (
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <User size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-semibold">EMT Nurse On Board</p>
                  <p className="text-sm font-bold text-slate-800">{ambulance.assignedNurseId.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DISPATCHED — Active Mission */
        <div className="space-y-4">
          {/* Mission Header */}
          <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 bg-red-100/50 border-b border-red-200">
              <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center animate-pulse">
                <Navigation size={22} className="text-red-700" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 text-lg">🚨 Active Mission</h3>
                <p className="text-sm text-red-600">Respond immediately — patient needs emergency care.</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Vehicle Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Vehicle</p>
                  <p className="text-xl font-extrabold text-slate-800">{ambulance.vehicleNumber}</p>
                </div>
                <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                  EN ROUTE
                </span>
              </div>

              {/* Location Card */}
              {ambulance.dispatchLocation && (
                <div className="bg-white rounded-xl border border-red-200 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dispatch Location</p>
                      <p className="text-base font-bold text-slate-800 mt-0.5">{ambulance.dispatchLocation}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openGoogleMaps(ambulance.dispatchLocation)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-colors"
                  >
                    <Navigation size={16} /> Open in Google Maps
                  </button>
                </div>
              )}

              {/* Notes */}
              {ambulance.dispatchNotes && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Dispatch Notes</p>
                  <p className="text-sm text-slate-700">{ambulance.dispatchNotes}</p>
                </div>
              )}

              {/* Nurse Info */}
              {ambulance.assignedNurseId && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <User size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">EMT Nurse</p>
                    <p className="text-sm font-bold text-slate-800">{ambulance.assignedNurseId.name}</p>
                  </div>
                  {ambulance.assignedNurseId.phone && (
                    <a href={`tel:${ambulance.assignedNurseId.phone}`} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Complete Mission Button */}
          <button
            onClick={handleCompleteMission}
            disabled={isCompleting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-green-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCompleting ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Completing...</>
            ) : (
              <><CheckCircle2 size={20} /> Complete Mission — Mark Vehicle Available</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const AmbulanceDriverDashboard = () => (
  <DashboardLayout navLinks={driverLinks} title="Ambulance Operations">
    <Routes>
      <Route path="/" element={<DriverMissionPanel />} />
      <Route path="/profile" element={<ProfileSettings />} />
    </Routes>
  </DashboardLayout>
);

export default AmbulanceDriverDashboard;
