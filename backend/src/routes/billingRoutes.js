import express from 'express';
import { getInvoices, generateInvoice, payInvoice } from '../controllers/billingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ClinicAdmin', 'Receptionist'));

router.get('/invoices', getInvoices);
router.post('/invoices', generateInvoice);
router.put('/invoices/:id/pay', payInvoice);

export default router;