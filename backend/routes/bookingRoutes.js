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
import rateLimit from 'express-rate-limit';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Max 20 checkout requests per 5 minutes per user/IP
  message: { success: false, message: 'Too many checkout attempts. Please wait a moment before trying again.' }
});

router.post('/webhook', handleWebhook);

router.use(protect);

router.post('/checkout', checkoutLimiter, checkout);
router.post('/verify-payment', verifyPaymentHandler);
router.get('/my-bookings', getUserBookings);
router.get('/:bookingId', getBooking);
router.post('/:bookingId/cancel', cancelBooking);
router.post('/:bookingId/reconcile', reconcilePayment);
router.get('/:bookingId/audit', requireRole('ADMIN'), getBookingAudits);
router.post('/admin/cleanup-holds', cleanupExpiredHolds);

export default router;
