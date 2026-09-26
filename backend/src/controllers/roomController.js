import Room from '../models/Room.js';

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('beds.patientId', 'name');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, block, floor, pricePerDay, numberOfBeds } = req.body;
    
    // Auto-generate the beds array based on the requested number
    const generatedBeds = Array.from({ length: numberOfBeds }, (_, i) => ({
      bedNumber: i + 1,
      isOccupied: false
    }));

    const newRoom = await Room.create({
      roomNumber, roomType, block, floor, pricePerDay, beds: generatedBeds
    });

    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};