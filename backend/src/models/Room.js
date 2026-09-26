import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { 
    type: String, 
    enum: ['NormalWard', 'SpecialRoom', 'ICU', 'GeneralWaiting', 'OperationTheatre'], 
    required: true 
  },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  beds: [{
    bedNumber: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  }]
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);