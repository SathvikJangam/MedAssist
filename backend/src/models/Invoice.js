import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'Consultation', 'Lab Test', 'Surgery'
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Cancelled'], 
    default: 'Pending' 
  },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);