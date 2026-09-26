import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // Assuming you have a token generator

// PATIENT REGISTRATION (Instant Approval & Login)
export const registerPatient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, phone, password, role: 'Patient', isApproved: true });
    
    // Log them in immediately
    const token = generateToken(res, user._id, user.role);
    res.status(201).json({ _id: user._id, name: user.name, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// STAFF/DOCTOR REGISTRATION (Pending Admin Approval)
export const registerStaff = async (req, res) => {
  try {
    const { name, email, phone, password, role, department } = req.body;
    
    // Check if the email is already in the system
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      // RULE 1: If they are in the system but NOT approved, tell them it's pending.
      if (!userExists.isApproved) {
        return res.status(400).json({ 
          message: 'Your registration is already pending Admin approval! Please wait.' 
        });
      }
      // RULE 2: If they are in the system AND approved, tell them to log in.
      return res.status(400).json({ 
        message: 'An active account with this email already exists. Please login.' 
      });
    }

    // RULE 3: If not in the system (new or previously rejected), create a pending account.
    await User.create({ 
      name, email, phone, password, role, department, isApproved: false 
    });
    
    res.status(201).json({ message: 'Registration submitted. Please wait for Clinic Admin approval.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN LOGIC (Blocks unapproved staff)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // THE NEW CHECK: Block unapproved non-patients
      if (user.role !== 'Patient' && !user.isApproved) {
        return res.status(403).json({ message: 'Your account is pending Admin approval.' });
      }

      const token = generateToken(res, user._id, user.role);
      res.status(200).json({ _id: user._id, name: user.name, role: user.role, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Update User Profile (e.g., patient changing phone number)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Emergency Walk-in Registration (By Admin/Receptionist)
export const emergencyRegister = async (req, res) => {
  try {

    const { name, phone, email, password, emergencyContact, bloodGroup } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A patient with this email already exists.' });
    }
    
    const user = await User.create({ 
      name, 
      email, 
      phone, 
      password,
      role: 'Patient', 
      isApproved: true,
      bloodGroup,
      emergencyContact
    });
    
    res.status(201).json({ 
      message: 'Emergency profile created successfully. Family can now log in.',
      patientId: user._id,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: Fetch all active doctors for the booking dropdown
export const getActiveDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', isApproved: true }).select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
