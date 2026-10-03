import express from 'express';
import {
  checkout,
  verifyPaymentHandler,
  handleWebhook,
  getUserBookings,
  cancelBooking,
  getBooking,
} from '../controllers/booking/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Webhook (payment provider → backend, no JWT auth, signature verified inside) ──
// Must be BEFORE express.json() body parsing if raw body needed — handled via rawBody middleware
router.post('/webhook', handleWebhook);

// ── All other routes require JWT ──────────────────────────────────────────────
router.use(protect);

// Checkout: create seat hold + payment order
router.post('/checkout', checkout);

// Verify payment (frontend calls after provider redirects back)
router.post('/verify-payment', verifyPaymentHandler);

// My bookings list
router.get('/my-bookings', getUserBookings);

// Single booking (for confirmation page)
router.get('/:bookingId', getBooking);

// Cancel
router.post('/:bookingId/cancel', cancelBooking);

export default router;
