/**
 * useAppLogic
 * -----------
 * Coordinates the complete booking payment flow:
 *
 *   handleCheckout(selectedBusObj)
 *     1. Calls POST /bookings/checkout   → seat hold + payment order created
 *     2a. [SIMULATED] Auto-succeeds for dev/testing
 *     2b. [RAZORPAY]  Opens Razorpay Checkout widget; waits for user
 *     3. Calls POST /bookings/verify-payment  → backend verifies + confirms
 *     4. Updates Zustand store with confirmed booking from backend
 *
 * Security:
 *   - Payment amount is NEVER sent from the frontend.
 *   - Only orderId/paymentId/signature are relayed back to backend for verification.
 *   - Booking status comes from the backend response, not a frontend flag.
 *   - RAZORPAY_KEY_SECRET is never in frontend code.
 *
 * UX states handled:
 *   - Payment success
 *   - Payment failed
 *   - Payment cancelled (modal dismissed)
 *   - Network error after payment (recovery via My Bookings)
 *   - Webhook races (backend idempotency handles this)
 *   - Hold expired
 */

import { useState, useEffect, useCallback } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import {
  checkout as apiCheckout,
  verifyPayment as apiVerifyPayment,
  cancelBooking as apiCancelBooking,
  getMyBookings,
  loadRazorpayScript,
  openRazorpayCheckout,
} from '../services/bookingService';

// ── Simulated payment (SIMULATED gateway only) ────────────────────────────────
// In dev mode with PAYMENT_PROVIDER=SIMULATED: instantly "pays" by forwarding
// the orderId back. The backend SIMULATED provider accepts any non-empty paymentId.
const runSimulatedPayment = async (orderData) => {
  const { orderId } = orderData;
  const simulatedPaymentId = `SIM_PAY_${Date.now()}`;
  const simulatedSignature = `SIM_SIG_${orderId}`;
  return { paymentId: simulatedPaymentId, signature: simulatedSignature };
};

// ─────────────────────────────────────────────────────────────────────────────

export function useAppLogic() {
  const navigate = useNavigate();

  const {
    origin, setOrigin,
    destination, setDestination,
    journeyDate,
    selectedBus, setSelectedBus,
    selectedSeats, setSelectedSeats,
    setIsBookingSuccess,
    addActiveBooking,
    setActiveBookings,
    removeActiveBooking,
    passengerDetails,
    setPassengerDetails,
  } = useBookingStore();
  const { isUserLoggedIn, user } = useAuthStore();

  const [searchError, setSearchError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStep, setPaymentStep] = useState('idle');
  // paymentStep: 'idle' | 'creating_order' | 'awaiting_payment' | 'verifying' | 'confirmed' | 'failed' | 'cancelled'

  // ── Map a backend booking object to the store shape ──────────────────────
  const mapBooking = useCallback((b) => ({
    id: b.bookingNumber || b._id,
    _id: b._id,
    bookingNumber: b.bookingNumber,
    from: b.boardingStop?.stopName || 'Source',
    to: b.droppingStop?.stopName || 'Destination',
    date: b.tripId?.departureDate
      ? new Date(b.tripId.departureDate).toLocaleDateString()
      : 'N/A',
    time: b.tripId?.departureDate
      ? new Date(b.tripId.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A',
    busType: b.tripId?.busId?.busType || b.tripId?.busId?.category || 'Bus',
    busNumber: b.tripId?.busId?.registrationNumber || '',
    routeName: b.tripId?.routeId?.routeName || '',
    seats: b.seats ? b.seats.map((s) => s.seatNo) : [],
    passengers: b.seats || [],
    price: `₹${(b.totalFare || 0).toLocaleString()}`,
    totalFare: b.totalFare,
    distanceKm: b.distanceKm,
    bookingStatus: b.bookingStatus,
    paymentStatus: b.paymentStatus,
    paymentGateway: b.paymentGateway,
    paymentTransactionId: b.paymentTransactionId,
    qrCode: b.bookingNumber || b._id,
  }), []);

  // ── Fetch all bookings from backend ─────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      const resBookings = await getMyBookings();
      setActiveBookings(resBookings.map(mapBooking));
    } catch (e) {
      console.error('fetchBookings error:', e);
    }
  }, [mapBooking, setActiveBookings]);

  useEffect(() => {
    if (isUserLoggedIn) fetchBookings();
  }, [isUserLoggedIn, fetchBookings]);

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearchClick = () => {
    if (!origin || !origin.trim()) { setSearchError('Please enter a departure city.'); return; }
    if (!destination || !destination.trim()) { setSearchError('Please enter a destination city.'); return; }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setSearchError('Origin and destination cannot be the same.'); return;
    }
    if (!journeyDate) { setSearchError('Please select a journey date.'); return; }

    const selectedDate = new Date(journeyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setSearchError('Journey date cannot be in the past.'); return; }

    setSearchError('');
    setSelectedBus(null);
    setSelectedSeats([]);
    setIsBookingSuccess(false);
    navigate(`/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&date=${encodeURIComponent(journeyDate)}`);
  };

  // ── Checkout → Payment → Verify ──────────────────────────────────────────
  const handleCheckout = async (selectedBusObj) => {
    if (selectedSeats.length === 0 || !selectedBusObj) return;
    setCheckoutError('');
    setIsCheckingOut(true);
    setPaymentStep('creating_order');

    let bookingId = null;
    let payment = null;

    try {
      // Step 1: Build seat data
      for (const seatNo of selectedSeats) {
        const details = passengerDetails[seatNo] || {};
        const parsedAge = parseInt(details.age, 10);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
          throw new Error(`Invalid age for seat ${seatNo}. Age must be between 1 and 120.`);
        }
      }

      const seatsData = selectedSeats.map((seatNo) => {
        const details = passengerDetails[seatNo] || {};
        return {
          seatNo,
          passengerName: details.name || '',
          age: parseInt(details.age, 10),
          gender: details.gender || 'Male',
        };
      });

      // Step 2: Create seat hold + payment order on backend
      // Backend returns: { bookingId, bookingNumber, holdExpiresAt, payment: { orderId, amount, currency, gateway, keyId } }
      const checkoutResult = await apiCheckout({
        tripId: selectedBusObj.tripId,
        boardingStopId: selectedBusObj.boardingStopId,
        droppingStopId: selectedBusObj.droppingStopId,
        seats: seatsData,
      });

      if (!checkoutResult.success) {
        throw new Error(checkoutResult.message || 'Checkout failed');
      }

      bookingId = checkoutResult.bookingId;
      payment = checkoutResult.payment;

      setPaymentStep('awaiting_payment');

      // Step 3: Run payment via appropriate provider
      let paymentTokens;

      if (payment.gateway === 'SIMULATED') {
        // Dev/test simulated payment — auto-succeeds instantly
        paymentTokens = await runSimulatedPayment(payment);

      } else if (payment.gateway === 'RAZORPAY') {
        // Load Razorpay script dynamically (idempotent — only loads once)
        await loadRazorpayScript();

        // Open the Razorpay Checkout modal
        // Note: amount is NOT sent from here — backend already locked it in the Razorpay order.
        // keyId is the PUBLIC key returned by the backend — secret is never exposed here.
        paymentTokens = await openRazorpayCheckout({
          keyId: payment.keyId,           // PUBLIC key_id only
          orderId: payment.orderId,
          currency: payment.currency,
          bookingNumber: checkoutResult.bookingNumber,
          userEmail: user?.email || '',
          userName: user?.displayName || user?.name || '',
          userPhone: user?.phone || '',
        });

      } else {
        throw new Error(`Unsupported payment gateway: ${payment.gateway}`);
      }

      setPaymentStep('verifying');

      // Step 4: Backend verifies signature → confirms booking
      // We NEVER send amount — backend already knows it from the booking record.
      const verifyResult = await apiVerifyPayment({
        bookingId,
        orderId: payment.orderId,
        paymentId: paymentTokens.paymentId,
        signature: paymentTokens.signature,
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }

      setPaymentStep('confirmed');

      // Step 5: Update Zustand store with confirmed booking from backend
      const confirmed = verifyResult.booking;
      addActiveBooking({
        ...mapBooking(confirmed),
        from: confirmed.boardingStop?.stopName || origin,
        to: confirmed.droppingStop?.stopName || destination,
        busType: confirmed.tripId?.busId?.busType || selectedBusObj.busType || selectedBusObj.name,
        time: selectedBusObj.departure,
        date: journeyDate,
      });

      setIsBookingSuccess(true);
      // Refresh full list from backend
      await fetchBookings();

    } catch (error) {
      const msg = error?.message || JSON.stringify(error);

      if (msg === 'PAYMENT_CANCELLED') {
        // User dismissed the Razorpay modal — booking is PENDING, seats still held
        setPaymentStep('cancelled');
        setCheckoutError('Payment cancelled. Your seat hold is still active for 15 minutes.');
        alert(
          'Payment cancelled.\n\n' +
          'Your seat hold is still active for 15 minutes.\n' +
          'You can retry from My Bookings if needed.'
        );
      } else if (msg === 'PAYMENT_FAILED' || msg.includes('payment')) {
        setPaymentStep('failed');
        setCheckoutError('Payment failed. Please try again.');
        alert('Payment failed. Please try again or choose a different payment method.');
      } else if (error?.statusCode === 410 || msg.includes('expired')) {
        setPaymentStep('failed');
        setCheckoutError('Your seat hold has expired. Please search and book again.');
        alert('Seat hold expired. Please search again and book.');
      } else {
        setPaymentStep('failed');
        setCheckoutError(msg);
        alert(
          'Booking failed: ' + msg + '\n\n' +
          (bookingId ? 'Check My Bookings to see if your booking was processed.' : '')
        );
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancelBooking = async (bookingId) => {
    try {
      const dbBooking = useBookingStore.getState().activeBookings.find(
        (b) => b.id === bookingId || b._id === bookingId
      );
      if (dbBooking && dbBooking._id) {
        await apiCancelBooking(dbBooking._id);
        await fetchBookings();
      } else {
        removeActiveBooking(bookingId);
      }
      alert('Booking cancelled successfully');
    } catch (error) {
      alert('Cancel failed: ' + (error?.message || JSON.stringify(error)));
    }
  };

  const handleBookRoute = (from, to) => {
    setOrigin(from);
    setDestination(to);
    alert('Please select a journey date and proceed with your search.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    searchError,
    setSearchError,
    checkoutError,
    isCheckingOut,
    paymentStep,
    handleSearchClick,
    handleCheckout,
    handleCancelBooking,
    handleBookRoute,
    fetchBookings,
  };
}
