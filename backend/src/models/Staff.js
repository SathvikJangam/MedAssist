import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String },
  
  // Because Office Staff roles are specific and entered at runtime by Admin:
  customDesignation: { type: String }, // e.g., "Ambulance Dispatcher", "Inventory Manager"
  
  // Can store certifications for OT Assistants or Nurses
  qualifications: [{ type: String }] 
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);