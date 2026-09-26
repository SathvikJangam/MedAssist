import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Vials', 'Reagents', 'Consumables', 'Kits', 'Equipment'],
    required: true 
  },
  stock: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g., 'pcs', 'kits', 'boxes'
  threshold: { type: Number, required: true, default: 20 }, // Minimum stock before alert
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);