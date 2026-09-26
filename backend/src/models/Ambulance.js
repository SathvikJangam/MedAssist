import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  vehicleType: { type: String, enum: ['Basic', 'AdvancedLifeSupport'], default: 'Basic' },
  
  // Crew Relationships
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Role must be AmbulanceDriver
  assignedNurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Role must be Nurse
  
  // Audit trail: Which office staff made this assignment?
  assignedByOfficeStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  
  // Dispatch details
  dispatchLocation: { type: String, default: '' }, // Address/location for the mission
  dispatchNotes: { type: String, default: '' },
  
  status: { type: String, enum: ['Available', 'Dispatched', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

export default mongoose.model('Ambulance', ambulanceSchema);