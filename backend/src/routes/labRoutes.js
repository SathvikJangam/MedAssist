import express from 'express';
import { getLabOrders, createLabOrder, uploadLabResult } from '../controllers/labController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
const router = express.Router();

router.use(protect);

// Everyone can view labs (Filtered automatically by role)
router.get('/', getLabOrders);

// Only Doctors can order a test
router.post('/', authorize('Doctor'), createLabOrder);

// Only Lab Technicians can process and upload the results
router.put('/:id/upload', authorize('LabTechnician', 'ClinicAdmin'), upload.single('reportFile'), uploadLabResult);

export default router;