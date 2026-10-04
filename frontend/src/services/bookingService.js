/**
 * Frontend Booking Service
 * -------------------------
 * All calls go through the apiClient which injects the JWT automatically.
 *
 * Flow (Razorpay):
 *   1. checkout()        → POST /bookings/checkout
 *      Returns: { bookingId, bookingNumber, holdExpiresAt, payment: { orderId, amount, currency, gateway, keyId } }
 *      The keyId is the PUBLIC Razorpay key_id only. The secret is never returned.
 *
 *   2. verifyPayment()   → POST /bookings/verify-payment
 *      Frontend sends back: { bookingId, orderId, paymentId, signature }
 *      Backend verifies HMAC-SHA256 signature and confirms (or rejects) the booking.
 *
 *   3. getMyBookings()   → GET /bookings/my-bookings
 *   4. getBooking()      → GET /bookings/:bookingId
 *   5. cancelBooking()   → POST /bookings/:bookingId/cancel
 *
 * Security notes:
 *   - Payment amount is NEVER sent from the frontend. The backend calculates it.
 *   - The frontend only relays back the provider-returned paymentId + signature.
 *   - JWT is injected automatically by apiClient interceptor.
 *   - RAZORPAY_KEY_SECRET is never exposed here.
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
 * Fetch a single booking (used for confirmation screen and payment recovery).
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

/**
 * Dynamically loads the Razorpay Checkout script.
 * Returns a Promise that resolves when Razorpay is available on window.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout script'));
    document.head.appendChild(script);
  });
};

/**
 * Opens the Razorpay Checkout modal and returns a Promise that resolves with
 * { paymentId, orderId, signature } on success, or rejects on failure/cancellation.
 *
 * Security:
 *   - Amount is NOT passed from the frontend — it is already on the Razorpay order.
 *   - keyId is the PUBLIC Razorpay key_id returned from the backend checkout response.
 *   - The secret key is NEVER present in frontend code.
 *
 * @param {{
 *   keyId: string,
 *   orderId: string,
 *   amount: number,      // paise — for display only (Razorpay reads from order server-side)
 *   currency: string,
 *   bookingNumber: string,
 *   userEmail?: string,
 *   userName?: string,
 *   userPhone?: string,
 * }} options
 * @returns {Promise<{ paymentId: string, orderId: string, signature: string }>}
 */
export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    const {
      keyId,
      orderId,
      amount,
      currency = 'INR',
      bookingNumber,
      userEmail = '',
      userName = '',
      userPhone = '',
    } = options;

    if (!keyId) {
      reject(new Error('Razorpay key_id missing. Check backend configuration.'));
      return;
    }
    if (!orderId) {
      reject(new Error('Razorpay orderId missing'));
      return;
    }
    if (!window.Razorpay) {
      reject(new Error('Razorpay Checkout script not loaded'));
      return;
    }

    const rzp = new window.Razorpay({
      key: keyId,              // PUBLIC key only — secret NEVER here
      order_id: orderId,
      name: 'Ente KSRTC',
      description: `Booking ${bookingNumber || ''}`,
      image: '/ksrtc-logo.png',
      currency,
      // amount is NOT passed here — Razorpay reads it from the server-created order.
      // Passing amount here would create a new order; we want to use the existing one.
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      theme: { color: '#1a56db' },
      modal: {
        ondismiss: () => {
          reject(new Error('PAYMENT_CANCELLED'));
        },
      },
      handler: (response) => {
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
    });

    rzp.on('payment.failed', (response) => {
      reject(new Error(
        response?.error?.description || response?.error?.reason || 'PAYMENT_FAILED'
      ));
    });

    rzp.open();
  });
};
