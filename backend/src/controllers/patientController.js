import Patient from '../models/Patient.js';
import User from '../models/User.js';

// @desc    Get all patients (with search by name or phone)
// @route   GET /api/patients
// @access  Private (Admin, Receptionist, Doctor, Nurse)
export const getAllPatients = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let patientQuery = {};

    // If a search keyword is provided (e.g., ?keyword=John or ?keyword=98765)
    if (keyword) {
      // 1. Find all base Users matching the name or phone
      const matchingUsers = await User.find({
        role: 'Patient',
        $or: [
          { name: { $regex: keyword, $options: 'i' } }, // 'i' makes it case-insensitive
          { phone: { $regex: keyword, $options: 'i' } }
        ]
      }).select('_id');

      // Extract just the user IDs
      const userIds = matchingUsers.map(user => user._id);

      // 2. Filter patients to only those linked to the matching users
      patientQuery = { userId: { $in: userIds } };
    }

    // Fetch patients and "populate" the user details into the response
    const patients = await Patient.find(patientQuery)
      .populate('userId', 'name email phone countryCode isActive')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single patient by Patient ID
// @route   GET /api/patients/:id
// @access  Private (Admin, Receptionist, Doctor, Nurse)
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('userId', 'name email phone countryCode isActive');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Patient Profile
// @route   PUT /api/patients/:id
// @access  Private (Admin, Receptionist)
export const updatePatientProfile = async (req, res) => {
  try {
    const { name, phone, dob, bloodGroup, type, condition, medicalHistory } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // 1. Update the base User document (Name, Phone)
    const user = await User.findById(patient.userId);
    if (user) {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      await user.save();
    }

    // 2. Update the Patient document (Medical details)
    patient.dob = dob || patient.dob;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;
    patient.type = type || patient.type;
    patient.condition = condition || patient.condition;
    
    // If medical history is provided, append or replace (here we replace for simplicity)
    if (medicalHistory) {
      patient.medicalHistory = medicalHistory;
    }

    const updatedPatient = await patient.save();

    res.status(200).json({
      message: 'Patient updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};