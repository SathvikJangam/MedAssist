import express from 'express';
import { addStaff, getAllStaff, approveStaff, rejectStaff, updateStaffShift } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET staff — available to Admin, Receptionist, OfficeStaff (for doctor roster, crew assignment, etc.)
router.get('/staff', authorize('ClinicAdmin', 'Receptionist', 'OfficeStaff'), getAllStaff);

// Mutation routes
router.post('/staff', authorize('ClinicAdmin'), addStaff);
router.put('/staff/:id/approve', authorize('ClinicAdmin'), approveStaff);
router.delete('/staff/:id/reject', authorize('ClinicAdmin'), rejectStaff);
router.put('/staff/:id/shift', authorize('ClinicAdmin', 'OfficeStaff'), updateStaffShift);

export default router;