import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Exact Date and Time for the shift's start and end
  startTime: { type: Date, required: true }, 
  endTime: { type: Date, required: true },   
  
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin or Superintendent who set this
  isAvailable: { type: Boolean, default: true },
  notes: { type: String } // e.g., "On call for Emergency Ward"
}, { timestamps: true });

export default mongoose.model('Shift', shiftSchema);