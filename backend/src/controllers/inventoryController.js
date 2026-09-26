import Inventory from '../models/Inventory.js';

export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ stock: 1 }); // Lowest stock first
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addInventoryItem = async (req, res) => {
  try {
    const newItem = await Inventory.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const item = await Inventory.findByIdAndUpdate(
      req.params.id, 
      { stock }, 
      { new: true }
    );
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};