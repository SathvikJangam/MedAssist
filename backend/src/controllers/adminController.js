import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Staff from '../models/Staff.js';

// @desc    Add a new staff member (Doctor, Nurse, OfficeStaff, etc.)
// @route   POST /api/admin/staff
// @access  Private (ClinicAdmin only)

// @desc    Get all hospital staff (excludes patients)
// @route   GET /api/admin/staff
// @access  Private (ClinicAdmin only)
export const getAllStaff = async (req, res) => {
  try {
    // Find all users where role is NOT 'Patient'
    // Exclude passwords from the result
    const staffMembers = await User.find({ role: { $ne: 'Patient' } }).select('-password');
    
    // Note: If you want to include their specific profiles (Doctor/Staff data), 
    // you would do an aggregation or separate queries. For a dashboard list, base user data is usually enough.
    
    res.status(200).json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all staff (Approved and Pending)
export const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: 'Patient' } }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Staff directly from Admin Dashboard (Fixing the logout bug!)
export const addStaff = async (req, res) => {
  try {
    // Admin creates staff -> They are automatically approved
    const user = await User.create({ ...req.body, isApproved: true });
    // NO generateToken() HERE! This fixes the logout bug.
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.status(200).json({ message: 'Staff approved successfully', staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.status(200).json({ message: 'Staff request rejected and removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStaffShift = async (req, res) => {
  try {
    const { shiftStart, shiftEnd, isActive } = req.body;
    const updateData = {};
    if (shiftStart !== undefined) updateData.shiftStart = shiftStart;
    if (shiftEnd !== undefined) updateData.shiftEnd = shiftEnd;
    if (isActive !== undefined) updateData.isActive = isActive;

    const staff = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.status(200).json({ message: 'Staff shift updated successfully', staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};