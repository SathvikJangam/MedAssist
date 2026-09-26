import mongoose from 'mongoose';

const labOrderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testName: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Blood, Radiology, Urine
  status: { 
    type: String, 
    enum: ['Pending', 'Completed'], 
    default: 'Pending' 
  },
  reportUrl: { type: String }, // URL from AWS S3 or Local Uploads (Multer)
  isAbnormal: { type: Boolean, default: false }, // For Doctor's Red Alert flag
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Lab Tech ID
}, { timestamps: true });

export default mongoose.model('LabOrder', labOrderSchema);