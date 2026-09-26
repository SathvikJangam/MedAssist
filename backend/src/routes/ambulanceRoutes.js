import express from 'express';
import { addAmbulance, getAmbulances, updateAmbulanceStatus, assignCrew, getDriverMission, completeMission } from '../controllers/ambulanceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Admin fleet management
router.post('/', authorize('ClinicAdmin'), addAmbulance);
router.get('/', authorize('ClinicAdmin', 'Receptionist', 'OfficeStaff'), getAmbulances);
router.put('/:id/status', authorize('ClinicAdmin', 'OfficeStaff'), updateAmbulanceStatus);
router.put('/:id/crew', authorize('ClinicAdmin', 'OfficeStaff'), assignCrew);

// Driver-specific routes
router.get('/my-mission', authorize('AmbulanceDriver'), getDriverMission);
router.put('/complete-mission', authorize('AmbulanceDriver'), completeMission);

export default router;