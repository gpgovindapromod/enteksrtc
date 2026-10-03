/**
 * Frontend Booking Service
 * -------------------------
 * All calls go through the apiClient which injects the JWT automatically.
 *
 * Flow:
 *   1. checkout()        → POST /bookings/checkout
 *      Returns: { bookingId, bookingNumber, holdExpiresAt, payment: { orderId, amount, currency, gateway } }
 *
 *   2. verifyPayment()   → POST /bookings/verify-payment
 *      Frontend sends back: { bookingId, orderId, paymentId, signature }
 *      Backend verifies and confirms (or rejects) the booking.
 *
 *   3. getMyBookings()   → GET /bookings/my-bookings
 *   4. getBooking()      → GET /bookings/:bookingId
 *   5. cancelBooking()   → POST /bookings/:bookingId/cancel
 *
 * Security notes:
 *   - Payment amount is NEVER sent from the frontend. The backend calculates it.
 *   - The frontend only relays back the provider-returned paymentId + signature.
 *   - JWT is injected automatically by apiClient interceptor.
 */

import apiClient from './apiClient';

/**
 * Step 1: Create a seat hold and payment order on the server.
 * @param {{ tripId, boardingStopId, droppingStopId, seats }} bookingData
 */
export const checkout = async (bookingData) => {
  try {
    const response = await apiClient.post('/api/bookings/checkout', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Step 2: After user completes payment on the provider's widget,
 * send the provider tokens back to the backend for server-side verification.
 * @param {{ bookingId, orderId, paymentId, signature }} verifyData
 */
export const verifyPayment = async (verifyData) => {
  try {
    const response = await apiClient.post('/api/bookings/verify-payment', verifyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Fetch all bookings for the authenticated user.
 */
export const getMyBookings = async () => {
  try {
    const response = await apiClient.get('/api/bookings/my-bookings');
    return response.data.bookings;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Fetch a single booking (used for confirmation screen).
 * @param {string} bookingId
 */
export const getBooking = async (bookingId) => {
  try {
    const response = await apiClient.get(`/api/bookings/${bookingId}`);
    return response.data.booking;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Cancel a booking owned by the authenticated user.
 * @param {string} bookingId  - MongoDB _id of the booking
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await apiClient.post(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
