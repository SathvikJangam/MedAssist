import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String },
  type: { type: String, enum: ['InPatient', 'OutPatient'], default: 'OutPatient' },
  condition: { type: String, enum: ['Diagnosis', 'Treatment', 'Emergency'], required: true },
  medicalHistory: [{ type: String }] // E.g., ["Diabetes", "Hypertension"]
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);