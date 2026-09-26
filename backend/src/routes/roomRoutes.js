import express from 'express';
import { getRooms, addRoom } from '../controllers/roomController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ClinicAdmin', 'Receptionist'));

router.get('/', getRooms);
router.post('/', authorize('ClinicAdmin'), addRoom);

export default router;