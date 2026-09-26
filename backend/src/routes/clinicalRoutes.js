import express from 'express';
import { getMedicalRecords, createMedicalRecord } from '../controllers/clinicalController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Patients and Doctors can view records
router.get('/records', authorize('Patient', 'Doctor', 'ClinicAdmin'), getMedicalRecords);

// Only Doctors can create medical records
router.post('/records', authorize('Doctor'), createMedicalRecord);

export default router;