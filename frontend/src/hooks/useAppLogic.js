/**
 * useAppLogic
 * -----------
 * Coordinates booking flow through the payment-ready architecture:
 *
 *   handleCheckout(selectedBusObj)
 *     1. Calls POST /bookings/checkout   → seat hold + payment order created
 *     2. Calls the payment provider (SIMULATED in dev) to process payment
 *     3. Calls POST /bookings/verify-payment  → backend verifies + confirms
 *     4. Updates Zustand store with confirmed booking
 *
 * In simulation mode the "payment" step auto-succeeds so the UX is seamless
 * during development. A real provider (Razorpay) would open its SDK widget here.
 *
 * Security:
 *   - Payment amount is NEVER sent from the frontend.
 *   - Only orderId/paymentId/signature are relayed back to backend.
 *   - Booking status comes from the backend response, not a frontend flag.
 */

import { useState, useEffect } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import {
  checkout as apiCheckout,
  verifyPayment as apiVerifyPayment,
  cancelBooking as apiCancelBooking,
  getMyBookings,
} from '../services/bookingService';

// ── Simple simulated payment ──────────────────────────────────────────────────
// In dev mode: instantly "pays" by forwarding the orderId back to verify-payment.
// The backend's SIMULATED provider accepts any non-empty paymentId.
// Replace this function with the real Razorpay SDK call for production.
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
  const { isUserLoggedIn } = useAuthStore();

  const [searchError, setSearchError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ── Map a backend booking object to the store shape ──────────────────────
  const mapBooking = (b) => ({
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
  });

  // ── Fetch all bookings from backend ─────────────────────────────────────
  const fetchBookings = async () => {
    try {
      const resBookings = await getMyBookings();
      setActiveBookings(resBookings.map(mapBooking));
    } catch (e) {
      console.error('fetchBookings error:', e);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) fetchBookings();
  }, [isUserLoggedIn]);

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

    try {
      // Step 1: Build seat data
      const seatsData = selectedSeats.map((seatNo) => {
        const details = passengerDetails[seatNo] || {};
        return {
          seatNo,
          passengerName: details.name || '',
          age: parseInt(details.age) || 0,
          gender: details.gender || 'Male',
        };
      });

      // Step 2: Create seat hold + payment order on backend
      const checkoutResult = await apiCheckout({
        tripId: selectedBusObj.tripId,
        boardingStopId: selectedBusObj.boardingStopId,
        droppingStopId: selectedBusObj.droppingStopId,
        seats: seatsData,
      });

      if (!checkoutResult.success) {
        throw new Error(checkoutResult.message || 'Checkout failed');
      }

      const { bookingId, payment } = checkoutResult;

      // Step 3: Run payment (simulated in dev; replace with real SDK for prod)
      // The provider returns paymentId + signature that we relay to backend.
      // We NEVER send the amount — backend already knows it.
      let paymentTokens;
      if (payment.gateway === 'SIMULATED') {
        paymentTokens = await runSimulatedPayment(payment);
      } else {
        // Production: open Razorpay widget here
        // paymentTokens = await openRazorpayWidget(payment);
        throw new Error('Real payment gateway not yet integrated on frontend.');
      }

      // Step 4: Backend verifies signature → confirms booking
      const verifyResult = await apiVerifyPayment({
        bookingId,
        orderId: payment.orderId,
        paymentId: paymentTokens.paymentId,
        signature: paymentTokens.signature,
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }

      // Step 5: Update Zustand store with confirmed booking from backend
      const confirmed = verifyResult.booking;
      addActiveBooking({
        ...mapBooking(confirmed),
        // Supplement from search context for display
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
      setCheckoutError(msg);
      alert('Booking failed: ' + msg);
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
    handleSearchClick,
    handleCheckout,
    handleCancelBooking,
    handleBookRoute,
    fetchBookings,
  };
}
