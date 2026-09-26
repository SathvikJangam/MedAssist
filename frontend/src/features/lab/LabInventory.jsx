import React, { useState } from 'react';
import { Package, AlertCircle, Plus, Edit2, X, Save, ArrowLeft } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const LabInventory = () => {
  const { data: inventory, isLoading, error, setData: setInventory, refetch } = useFetch('/inventory');
  const [view, setView] = useState('grid'); // 'grid' | 'add'
  const [editingItem, setEditingItem] = useState(null);
  const [editStock, setEditStock] = useState('');

  const handleStockUpdate = async (itemId) => {
    const newStock = parseInt(editStock, 10);
    if (isNaN(newStock) || newStock < 0) return alert('Enter a valid stock number.');

    // Optimistic update
    setInventory(inventory.map(item => item._id === itemId ? { ...item, stock: newStock } : item));
    setEditingItem(null);

    try {
      await api.put(`/inventory/${itemId}`, { stock: newStock });
    } catch (err) {
      alert('Failed to update stock.');
      refetch();
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-100" />
      ))}
    </div>
  );
  if (error) return <div className="p-10 text-center text-red-500 flex items-center justify-center gap-2"><AlertCircle size={18} /> Error: {error}</div>;

  if (view === 'add') {
    return <AddInventoryForm onSuccess={() => { setView('grid'); refetch(); }} onCancel={() => setView('grid')} />;
  }

  const safeInventory = inventory || [];
  const lowStockItems = safeInventory.filter(item => item.stock <= item.threshold);

  return (
    <div className="space-y-6 max-w-7xl pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Inventory & Supplies</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage laboratory consumables, reagents, and equipment stock.</p>
        </div>
        <button
          onClick={() => setView('add')}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={22} />
          <div>
            <h3 className="font-bold text-red-800 text-sm">Action Required: Low Stock Items</h3>
            <p className="text-xs text-red-700 mt-1">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's are' : ' is'} running below minimum threshold. Please restock immediately.
            </p>
          </div>
        </div>
      )}

      {safeInventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <Package size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">No inventory items yet.</p>
          <p className="text-xs mt-1">Click "Add New Item" to start tracking supplies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {safeInventory.map((item) => {
            const isCritical = item.stock === 0;
            const isLowStock = item.stock <= item.threshold && item.stock > 0;
            const isEditing = editingItem === item._id;
            
            return (
              <div key={item._id} className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${isCritical ? 'border-red-200' : isLowStock ? 'border-amber-200' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Package size={20} />
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                    isCritical ? 'bg-red-100 text-red-700' : 
                    isLowStock ? 'bg-amber-100 text-amber-700' : 
                    'bg-green-50 text-green-700'
                  }`}>
                    {isCritical ? 'Critical' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editStock}
                        onChange={e => setEditStock(e.target.value)}
                        className="w-20 px-2 py-1 border border-primary rounded-lg text-sm outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleStockUpdate(item._id)} className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover">
                        <Save size={14} />
                      </button>
                      <button onClick={() => setEditingItem(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-2xl font-extrabold text-slate-800">{item.stock}</span>
                        <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                      </div>
                      <button
                        onClick={() => { setEditingItem(item._id); setEditStock(String(item.stock)); }}
                        className="text-slate-400 hover:text-primary transition-colors p-1.5 hover:bg-primary/10 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Sub-component: Add Inventory Form ---
const AddInventoryForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', category: 'Consumables', stock: '', unit: 'pcs', threshold: '20'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/inventory', {
        ...formData,
        stock: parseInt(formData.stock, 10),
        threshold: parseInt(formData.threshold, 10)
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Add Inventory Item</h2>
          <p className="text-slate-500 text-sm mt-0.5">Register a new supply to the lab stock tracker.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g., Blood Collection Tubes" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50 appearance-none">
              <option>Vials</option>
              <option>Reagents</option>
              <option>Consumables</option>
              <option>Kits</option>
              <option>Equipment</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Stock *</label>
            <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} placeholder="e.g., 100" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit *</label>
            <input type="text" name="unit" required value={formData.unit} onChange={handleChange} placeholder="e.g., pcs, kits, boxes" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Low-Stock Alert At</label>
            <input type="number" name="threshold" min="0" value={formData.threshold} onChange={handleChange} placeholder="20" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary bg-slate-50" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-60 flex items-center gap-2 transition-colors">
            <Package size={16} /> {isSubmitting ? 'Adding...' : 'Add to Inventory'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabInventory;