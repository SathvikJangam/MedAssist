import express from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus, getDoctorPatients } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require login

// Everyone can view appointments (Filtered automatically by the controller)
router.get('/', getAppointments); 

// Patients, Receptionists, and Admins can book
router.post('/', authorize('Patient', 'Receptionist', 'ClinicAdmin'), createAppointment);

// Only Receptionists and Doctors can update the status
router.put('/:id/status', authorize('Receptionist', 'Doctor', 'ClinicAdmin'), updateAppointmentStatus);

router.get('/doctor-patients', authorize('Doctor', 'ClinicAdmin'), getDoctorPatients);

export default router;