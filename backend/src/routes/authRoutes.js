import express from 'express';
import { registerPatient, registerStaff, loginUser, emergencyRegister, updateUserProfile, getActiveDoctors } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import middlewares

const router = express.Router();

// Public Routes
router.post('/register', registerPatient);
router.post('/login', loginUser);
router.post('/register-staff', registerStaff);
router.put('/profile', protect, updateUserProfile);
router.get('/doctors', protect, getActiveDoctors);

// Protected Routes
router.get('/me', protect, (req, res) => {
  res.status(200).json({ _id: req.user._id, name: req.user.name, role: req.user.role, email: req.user.email });
});

// Profile update
router.post(
  '/emergency-register', 
  protect, 
  authorize('ClinicAdmin', 'Receptionist', 'Doctor'), 
  emergencyRegister
);

// We will also add a logout route while we are here!
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Instantly expire the cookie
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;