import Ambulance from '../models/Ambulance.js';

// Add new ambulance
export const addAmbulance = async (req, res) => {
  try {
    const ambulance = await Ambulance.create(req.body);
    res.status(201).json(ambulance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all ambulances (for admin/office staff)
export const getAmbulances = async (req, res) => {
  try {
    const fleet = await Ambulance.find()
      .populate('driverId', 'name phone')
      .populate('assignedNurseId', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json(fleet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get the ambulance assigned to the logged-in driver
export const getDriverMission = async (req, res) => {
  try {
    const ambulance = await Ambulance.findOne({ driverId: req.user._id })
      .populate('driverId', 'name phone')
      .populate('assignedNurseId', 'name phone');

    if (!ambulance) {
      return res.status(200).json(null); // No ambulance assigned
    }
    res.status(200).json(ambulance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ambulance status (dispatch / complete / maintenance)
export const updateAmbulanceStatus = async (req, res) => {
  try {
    const { status, dispatchLocation, dispatchNotes } = req.body;
    const updateData = { status };

    if (status === 'Dispatched') {
      updateData.dispatchLocation = dispatchLocation || '';
      updateData.dispatchNotes = dispatchNotes || '';
    }

    if (status === 'Available') {
      // Clear dispatch info when mission is completed
      updateData.dispatchLocation = '';
      updateData.dispatchNotes = '';
    }

    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('driverId', 'name phone').populate('assignedNurseId', 'name phone');

    res.status(200).json(ambulance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Driver completes the mission — marks vehicle available
export const completeMission = async (req, res) => {
  try {
    const ambulance = await Ambulance.findOne({ driverId: req.user._id, status: 'Dispatched' });
    if (!ambulance) {
      return res.status(404).json({ message: 'No active mission found for your vehicle.' });
    }

    ambulance.status = 'Available';
    ambulance.dispatchLocation = '';
    ambulance.dispatchNotes = '';
    await ambulance.save();

    res.status(200).json({ message: 'Mission completed. Vehicle is now available.', ambulance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign crew to ambulance
export const assignCrew = async (req, res) => {
  try {
    const { driverId, assignedNurseId } = req.body;
    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id, 
      { driverId: driverId || null, assignedNurseId: assignedNurseId || null }, 
      { new: true }
    ).populate('driverId', 'name phone').populate('assignedNurseId', 'name phone');
    
    res.status(200).json(ambulance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};