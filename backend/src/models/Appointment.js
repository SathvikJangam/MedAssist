import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "10:00"
  department: { type: String, default: 'General' }, // Auto-populated from doctor's department
  type: { type: String, default: 'Consultation' }, // Consultation, Follow-up, Emergency
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Scheduled', 'Checked-In', 'In-Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);