import Booking from '../../../database/models/Booking.js';
import BookingSeat from '../../../database/models/BookingSeat.js';

// ─── GET MY BOOKINGS ──────────────────────────────────────────────────────────

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const bookings = await Booking.find({ passengerId: userId })
      .populate({ path: 'tripId', populate: { path: 'busId routeId' } })
      .populate('boardingStop droppingStop')
      .sort({ createdAt: -1 });

    const results = [];
    for (const b of bookings) {
      const seats = await BookingSeat.find({ bookingId: b._id });
      results.push({ ...b.toObject(), seats });
    }

    return res.json({ success: true, bookings: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE BOOKING (for confirmation screen + recovery) ──────────────────

export const getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id || req.user._id;

    // IDOR: only the booking owner can view
    const booking = await Booking.findOne({ _id: bookingId, passengerId: userId })
      .populate({ path: 'tripId', populate: { path: 'busId routeId' } })
      .populate('boardingStop droppingStop');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const seats = await BookingSeat.find({ bookingId: booking._id });
    return res.json({ success: true, booking: { ...booking.toObject(), seats } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN AUDIT HISTORY ─────────────────────────────────────────────────────

export const getBookingAudits = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { default: BookingAudit } = await import('../../../database/models/BookingAudit.js');
    const audits = await BookingAudit.find({ bookingId }).sort({ createdAt: 1 }).populate('userId', 'name email');
    return res.json({ success: true, audits });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
