import Trip from '../../database/models/Trip.js';
import TripStop from '../../database/models/TripStop.js';
import RouteStop from '../../database/models/RouteStop.js';
import { auditBooking } from '../../utils/auditUtils.js';

export const getTripTimetable = async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const trip = await Trip.findById(tripId).populate('routeId');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Fetch TripStops and populate routeStop to get the sequence and stop details
    const tripStops = await TripStop.find({ tripId }).populate({
      path: 'routeStopId',
      populate: { path: 'stopId' }
    });

    // Sort chronologically by sequence
    tripStops.sort((a, b) => a.routeStopId.sequence - b.routeStopId.sequence);

    res.json({ success: true, tripStops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTripTimetable = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { timetable } = req.body; // Array of { tripStopId, arrivalTime, departureTime }

    if (!Array.isArray(timetable)) {
      return res.status(400).json({ success: false, message: 'Timetable must be an array' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Fetch existing
    const tripStops = await TripStop.find({ tripId }).populate('routeStopId');
    const tripStopMap = new Map();
    tripStops.forEach(ts => tripStopMap.set(ts._id.toString(), ts));

    // We will validate chronologically.
    // 1. Sort the input by the existing sequence just to validate order easily.
    const updatesToApply = [];
    
    for (const item of timetable) {
      const { tripStopId, arrivalTime, departureTime } = item;
      const ts = tripStopMap.get(tripStopId);
      if (!ts) continue;

      const newArrival = arrivalTime ? new Date(arrivalTime) : ts.arrivalTime;
      const newDeparture = departureTime ? new Date(departureTime) : ts.departureTime;

      if (newArrival > newDeparture) {
        return res.status(400).json({ 
          success: false, 
          message: `Arrival time cannot be after departure time for stop ${ts.routeStopId.sequence}` 
        });
      }

      updatesToApply.push({
        ts,
        newArrival,
        newDeparture
      });
    }

    updatesToApply.sort((a, b) => a.ts.routeStopId.sequence - b.ts.routeStopId.sequence);

    // Validate chronological progression between stops
    for (let i = 0; i < updatesToApply.length - 1; i++) {
      const current = updatesToApply[i];
      const next = updatesToApply[i + 1];

      if (current.newDeparture > next.newArrival) {
        return res.status(400).json({ 
          success: false, 
          message: `Departure time at sequence ${current.ts.routeStopId.sequence} (${current.newDeparture}) is after arrival at sequence ${next.ts.routeStopId.sequence} (${next.newArrival})`
        });
      }
    }

    // Apply updates
    for (const update of updatesToApply) {
      update.ts.arrivalTime = update.newArrival;
      update.ts.departureTime = update.newDeparture;
      update.ts.timetableType = 'ACTUAL'; // Upgraded to actual via manual admin override
      await update.ts.save();
    }

    // Adjust trip departureDate / arrivalDate to match the bounds if needed
    if (updatesToApply.length > 0) {
      trip.departureDate = updatesToApply[0].newDeparture; // First stop departure
      trip.arrivalDate = updatesToApply[updatesToApply.length - 1].newArrival; // Last stop arrival
      await trip.save();
    }

    await auditBooking({
      bookingId: trip._id, // Pseudo ID for trip-level audit
      bookingNumber: 'TRIP-' + trip._id,
      userId: req.user.id || req.user._id,
      eventType: 'ADMIN_ACTION',
      previousBookingStatus: 'N/A',
      newBookingStatus: 'N/A',
      previousPaymentStatus: 'N/A',
      newPaymentStatus: 'N/A',
      source: 'ADMIN',
      reason: 'Admin updated actual timetable'
    });

    res.json({ success: true, message: 'Timetable updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
