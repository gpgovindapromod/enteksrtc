import Trip from '../../database/models/Trip.js';
import Booking from '../../database/models/Booking.js';
import BookingSeat from '../../database/models/BookingSeat.js';
import BusLayout from '../../database/models/BusLayout.js';
import { auditBooking } from '../../utils/auditUtils.js';
import crypto from 'crypto';

/**
 * Get Trip Inventory - Admin View
 */
export const getTripInventory = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId).populate('busId routeId');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // 1. Fetch layout / total seats
    const layout = await BusLayout.findOne({ busId: trip.busId._id });
    const allSeats = layout ? layout.seats : Array.from({length: trip.busId.capacity}, (_, i) => ({ seatNumber: `${i+1}` }));
    
    // 2. Fetch all active bookings for this trip
    const activeBookings = await Booking.find({
      tripId,
      bookingStatus: { $ne: 'CANCELLED' }
    }).populate('passengerId', 'name email').lean();

    const bookingIds = activeBookings.map(b => b._id);
    const bookedSeats = await BookingSeat.find({ bookingId: { $in: bookingIds } }).lean();

    // Group seats by booking
    const seatsByBooking = new Map();
    bookedSeats.forEach(bs => {
      const bId = bs.bookingId.toString();
      if (!seatsByBooking.has(bId)) seatsByBooking.set(bId, []);
      seatsByBooking.get(bId).push(bs.seatNo);
    });

    // 3. Calculate Overall Stats
    let totalHeld = 0;
    let totalBooked = 0;
    
    const detailedBookings = activeBookings.map(b => {
      const seats = seatsByBooking.get(b._id.toString()) || [];
      if (b.bookingStatus === 'PENDING' && !b.isBlock) {
        totalHeld += seats.length;
      } else {
        totalBooked += seats.length;
      }
      return {
        ...b,
        seats
      };
    });

    res.json({
      success: true,
      trip: {
        _id: trip._id,
        status: trip.status,
        bus: trip.busId,
        route: trip.routeId,
        departureDate: trip.departureDate,
        totalSeats: trip.busId.capacity,
        availableSeats: Math.max(0, trip.busId.capacity - (totalHeld + totalBooked)),
        totalHeld,
        totalBooked,
        occupancyPercentage: (((totalHeld + totalBooked) / trip.busId.capacity) * 100).toFixed(1)
      },
      seats: allSeats,
      bookings: detailedBookings
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Block a seat (Admin Override)
 */
export const blockSeat = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { seatNo, reason = 'Admin Block' } = req.body;
    
    if (!seatNo) return res.status(400).json({ success: false, message: 'seatNo is required' });

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Ensure not already blocked or booked on the entire segment
    const existingOverlaps = await Booking.find({
      tripId,
      bookingStatus: { $ne: 'CANCELLED' }
    });
    
    const overlappingIds = existingOverlaps.map(b => b._id);
    const overlappingSeats = await BookingSeat.find({ bookingId: { $in: overlappingIds }, seatNo });
    
    // We could do a stricter sequence overlap check here, but admin blocks usually span the whole route.
    // So if it's booked at all, we might warn them, but for now let's just create it. 
    // Wait, let's block only if it's not already booked anywhere on the route, to be safe.
    if (overlappingSeats.length > 0) {
      return res.status(400).json({ success: false, message: `Seat ${seatNo} is currently booked or held on this trip.` });
    }

    const blockBooking = new Booking({
      bookingNumber: 'BLK-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      passengerId: req.user.id || req.user._id,
      tripId: trip._id,
      boardingSequence: 0,
      droppingSequence: 9999,
      farePaise: 0,
      totalFare: 0,
      isBlock: true,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'NOT_APPLICABLE'
    });

    await blockBooking.save();

    await BookingSeat.create({
      bookingId: blockBooking._id,
      seatNo,
      passengerName: 'Admin Block',
      age: 0,
      gender: 'Other'
    });

    await auditBooking({
      bookingId: blockBooking._id,
      bookingNumber: blockBooking.bookingNumber,
      userId: req.user.id || req.user._id,
      eventType: 'ADMIN_ACTION',
      previousBookingStatus: null,
      newBookingStatus: 'CONFIRMED',
      previousPaymentStatus: null,
      newPaymentStatus: 'NOT_APPLICABLE',
      source: 'ADMIN',
      reason: `Seat ${seatNo} blocked: ${reason}`
    });

    res.json({ success: true, message: `Seat ${seatNo} blocked successfully`, booking: blockBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Unblock a seat (Admin Override)
 */
export const unblockSeat = async (req, res) => {
  try {
    const { blockBookingId } = req.params;

    const blockBooking = await Booking.findOne({ _id: blockBookingId, isBlock: true });
    if (!blockBooking) return res.status(404).json({ success: false, message: 'Block not found' });

    blockBooking.bookingStatus = 'CANCELLED';
    await blockBooking.save();

    await auditBooking({
      bookingId: blockBooking._id,
      bookingNumber: blockBooking.bookingNumber,
      userId: req.user.id || req.user._id,
      eventType: 'ADMIN_ACTION',
      previousBookingStatus: 'CONFIRMED',
      newBookingStatus: 'CANCELLED',
      previousPaymentStatus: 'NOT_APPLICABLE',
      newPaymentStatus: 'NOT_APPLICABLE',
      source: 'ADMIN',
      reason: 'Admin unblocked seat'
    });

    res.json({ success: true, message: 'Seat unblocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
