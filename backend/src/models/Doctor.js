import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pgSpecialization: { type: String, required: true }, 
  superSpecialtyCategory: { type: String }, 
  licenseNumber: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  
  // New Fields based on your requirements:
  designation: { type: String, required: true }, // e.g., "CSS", "Asst CSS", "Junior Resident"
  isSuperintendent: { type: Boolean, default: false } // Only ClinicAdmin can toggle this to true
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);