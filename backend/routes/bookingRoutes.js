import express from 'express';
import {
  checkout,
  verifyPaymentHandler,
  handleWebhook,
  getUserBookings,
  cancelBooking,
  getBooking,
  cleanupExpiredHolds,
} from '../controllers/booking/bookingController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Webhook (payment provider → backend, no JWT, signature verified inside) ──
// IMPORTANT: Must be registered BEFORE express.json() parses the body,
// but in app.js we use the verify hook to preserve rawBody, so this is safe.
router.post('/webhook', handleWebhook);

// ── All other routes require JWT ──────────────────────────────────────────────
router.use(protect);

// Checkout: create seat hold + payment order (returns Razorpay keyId for frontend)
router.post('/checkout', checkout);

// Verify payment: frontend relays Razorpay response; backend verifies signature
router.post('/verify-payment', verifyPaymentHandler);

// My bookings list
router.get('/my-bookings', getUserBookings);

// Single booking (for confirmation page and recovery)
router.get('/:bookingId', getBooking);

// Cancel
router.post('/:bookingId/cancel', cancelBooking);

// Cleanup expired holds (admin/internal use — triggers manual cleanup)
// Protected to admin role in production; acceptable in TEST MODE for any authenticated user
router.post('/admin/cleanup-holds', cleanupExpiredHolds);

export default router;
