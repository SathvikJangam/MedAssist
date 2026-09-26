import express from 'express';
import { getAllPatients, getPatientById, updatePatientProfile } from '../controllers/patientController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes in this file require the user to be logged in
router.use(protect);

// GET /api/patients - Doctors, Nurses, Receptionists, Admins can search and view the list
router.get('/', authorize('ClinicAdmin', 'Receptionist', 'Doctor', 'Nurse'), getAllPatients);

// GET /api/patients/:id - Same roles can view a specific profile
router.get('/:id', authorize('ClinicAdmin', 'Receptionist', 'Doctor', 'Nurse'), getPatientById);

// PUT /api/patients/:id - Only Admin and Receptionist can update demographic data
router.put('/:id', authorize('ClinicAdmin', 'Receptionist'), updatePatientProfile);

export default router;