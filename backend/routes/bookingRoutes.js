import express from 'express';
import {
  checkout,
  verifyPaymentHandler,
  handleWebhook,
  cleanupExpiredHolds,
  reconcilePayment,
} from '../controllers/booking/bookingController.js';
import {
  getUserBookings,
  getBooking,
  getBookingAudits,
} from '../controllers/booking/views/bookingViewController.js';
import { cancelBooking } from '../controllers/booking/bookingCancellationController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/webhook', handleWebhook);

router.use(protect);

router.post('/checkout', checkout);
router.post('/verify-payment', verifyPaymentHandler);
router.get('/my-bookings', getUserBookings);
router.get('/:bookingId', getBooking);
router.post('/:bookingId/cancel', cancelBooking);
router.post('/:bookingId/reconcile', reconcilePayment);
router.get('/:bookingId/audit', requireRole('ADMIN'), getBookingAudits);
router.post('/admin/cleanup-holds', cleanupExpiredHolds);

export default router;
