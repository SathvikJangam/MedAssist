import express from 'express';
import { getInventory, addInventoryItem, updateStock } from '../controllers/inventoryController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ClinicAdmin', 'LabTechnician'));

router.get('/', getInventory);
router.post('/', addInventoryItem);
router.put('/:id', updateStock);

export default router;