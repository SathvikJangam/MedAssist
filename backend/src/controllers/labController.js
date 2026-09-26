import LabOrder from '../models/LabOrder.js';

// GET: Smart Fetching for Labs
export const getLabOrders = async (req, res) => {
  try {
    let query = {};
    const { status } = req.query; // Allows frontend to filter like /api/labs?status=Completed

    if (status) query.status = status;

    if (req.user.role === 'Patient') query.patientId = req.user._id;
    else if (req.user.role === 'Doctor') query.doctorId = req.user._id;
    // Lab Tech sees all orders, so no user ID filter for them

    const labs = await LabOrder.find(query)
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(labs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Doctor prescribes a Lab Test (THIS IS THE MISSING FUNCTION)
export const createLabOrder = async (req, res) => {
  try {
    // Force the doctorId to be the logged-in doctor
    const labOrder = await LabOrder.create({ ...req.body, doctorId: req.user._id });
    res.status(201).json(labOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Lab Technician Uploads Result
export const uploadLabResult = async (req, res) => {
  try {
    const { isAbnormal } = req.body;
    
    // Construct the URL to the uploaded file
    let reportUrl = '';
    if (req.file) {
      reportUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updatedLab = await LabOrder.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'Completed', 
        reportUrl,
        isAbnormal: isAbnormal === 'true' || isAbnormal === true,
        processedBy: req.user._id 
      }, 
      { new: true }
    );
    
    res.status(200).json(updatedLab);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};