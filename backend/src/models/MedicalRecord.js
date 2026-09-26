import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  
  clinicalDiagnosis: { type: String, required: true },
  observations: { type: String, required: true }, // Doctor's raw, messy notes
  
  // AI Generated Fields
  aiGeneratedSummary: { type: String }, // Structured for Doctors
  patientFriendlySummary: { type: String }, // Simplified for Patients
  
  prescriptions: [{
    medicine: String,
    dosage: String,
    duration: String,
    instructions: String
  }]
}, { timestamps: true });

export default mongoose.model('MedicalRecord', medicalRecordSchema);