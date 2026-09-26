import React, { useState } from 'react';
import { Building, BedDouble, Plus, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';

const FacilitiesManagement = () => {
  const [view, setView] = useState('grid');
  
  // Real-time fetch
  const { data: rooms, isLoading, error, refetch } = useFetch('/rooms');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            {view === 'grid' ? 'Facilities & Ward Allocation' : 'Add New Room / Ward'}
          </h2>
          <p className="text-text-muted mt-1">
            {view === 'grid' 
              ? 'Monitor bed availability across all hospital blocks.' 
              : 'Configure a new room and generate its beds.'}
          </p>
        </div>
        {view === 'grid' ? (
          <button onClick={() => setView('add')} className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-hover flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Configure New Room
          </button>
        ) : (
          <button onClick={() => { setView('grid'); refetch(); }} className="bg-surface text-text-main border border-border px-4 py-2.5 rounded-lg font-medium hover:bg-primary-light flex items-center gap-2">
            <ArrowLeft size={18} /> Back to Facilities
          </button>
        )}
      </div>

      {view === 'grid' ? (
        <RoomGrid rooms={rooms} isLoading={isLoading} error={error} />
      ) : (
        <AddRoomForm onSuccess={() => { setView('grid'); refetch(); }} />
      )}
    </div>
  );
};

const RoomGrid = ({ rooms, isLoading, error }) => {
  if (isLoading) return <div className="p-10 text-center animate-pulse text-text-muted">Loading Ward Data...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  const safeRooms = rooms || [];
  
  // Dynamic Calculations
  const totalBeds = safeRooms.reduce((acc, room) => acc + room.beds.length, 0);
  const occupiedBeds = safeRooms.reduce((acc, room) => acc + room.beds.filter(b => b.isOccupied).length, 0);
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface-card p-5 rounded-xl border border-border shadow-card flex items-center gap-4">
          <div className="p-3 bg-primary-light text-primary rounded-lg"><Building size={24} /></div>
          <div><h3 className="text-2xl font-bold">{safeRooms.length}</h3><p className="text-sm font-medium text-text-muted">Total Rooms</p></div>
        </div>
        <div className="bg-surface-card p-5 rounded-xl border border-border shadow-card flex items-center gap-4">
          <div className="p-3 bg-success-light text-success rounded-lg"><CheckCircle2 size={24} /></div>
          <div><h3 className="text-2xl font-bold">{availableBeds}</h3><p className="text-sm font-medium text-text-muted">Available Beds</p></div>
        </div>
        <div className="bg-surface-card p-5 rounded-xl border border-border shadow-card flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><BedDouble size={24} /></div>
          <div><h3 className="text-2xl font-bold">{occupiedBeds}</h3><p className="text-sm font-medium text-text-muted">Occupied Beds</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeRooms.map((room) => {
          const rOccupied = room.beds.filter(b => b.isOccupied).length;
          const rTotal = room.beds.length;
          const isFull = rOccupied === rTotal;

          return (
            <div key={room._id} className={`bg-surface-card rounded-xl border shadow-card p-5 flex flex-col justify-between transition-all ${isFull ? 'border-red-200' : 'border-border'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-text-main">Room {room.roomNumber}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-surface px-2 py-0.5 rounded text-text-muted border">
                      {room.roomType.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-muted">{room.block} • Floor {room.floor}</p>
                </div>
                {isFull && <span className="bg-red-50 text-red-600 text-[10px] font-bold uppercase px-2 py-1 rounded">Full</span>}
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-text-main mb-2">Bed Status ({rTotal - rOccupied} Available)</p>
                <div className="flex flex-wrap gap-2">
                  {room.beds.map((bed) => (
                    <div 
                      key={bed._id} 
                      title={bed.isOccupied ? 'Occupied' : 'Available'}
                      className={`h-8 w-8 rounded flex items-center justify-center text-xs font-bold ${
                        bed.isOccupied ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-success-light text-success border border-success/30'
                      }`}
                    >
                      {bed.bedNumber}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center mt-auto">
                <span className="text-sm font-medium text-text-main flex items-center gap-1">
                  ₹{room.pricePerDay} <span className="text-text-muted font-normal text-xs">/ day</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddRoomForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    block: '', floor: '', roomNumber: '', roomType: 'NormalWard', pricePerDay: '', numberOfBeds: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/rooms', formData);
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border shadow-card p-8 max-w-3xl">
      <h3 className="text-lg font-semibold text-text-main mb-6 border-b border-border pb-2">Room Configuration</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium mb-1">Block / Wing</label><input type="text" required onChange={e => setFormData({...formData, block: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Floor</label><input type="text" required onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Room Number</label><input type="text" required onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Room Type</label>
            <select required onChange={e => setFormData({...formData, roomType: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-primary">
              <option value="NormalWard">Normal Ward</option><option value="ICU">Intensive Care Unit (ICU)</option><option value="SpecialRoom">Special Room</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Beds to Generate</label><input type="number" min="1" max="50" required onChange={e => setFormData({...formData, numberOfBeds: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Price Per Day (₹)</label><input type="number" required onChange={e => setFormData({...formData, pricePerDay: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary" /></div>
        </div>
        <div className="flex justify-end border-t border-border pt-6 mt-4">
          <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
            {isSubmitting ? 'Generating...' : 'Save & Generate Beds'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacilitiesManagement;