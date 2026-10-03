import Trip from '../../database/models/Trip.js';
import TripStop from '../../database/models/TripStop.js';
import RouteStop from '../../database/models/RouteStop.js';
import Stop from '../../database/models/Stop.js';
import Booking from '../../database/models/Booking.js';
import BookingSeat from '../../database/models/BookingSeat.js';
import BusLayout from '../../database/models/BusLayout.js';
import { calculateFare } from '../../utils/fareUtils.js';

export const searchTrips = async (req, res) => {
  try {
    console.time('Total Search Time');
    const { from, to, date, limit = 50, page = 1 } = req.query;
    if (!from || !to || !date) {
      return res.status(400).json({ success: false, message: 'from, to, and date are required' });
    }

    console.time('Stop Validation');
    const fromStop = await Stop.findOne({ stopName: new RegExp(`^${from}$`, 'i') }).lean();
    const toStop = await Stop.findOne({ stopName: new RegExp(`^${to}$`, 'i') }).lean();

    if (!fromStop || !toStop) {
      console.log('Search Error - Invalid Stops:');
      console.log(`Requested from: "${from}", to: "${to}"`);
      console.log(`Found fromStop: ${fromStop ? fromStop.stopName : 'NULL'}`);
      console.log(`Found toStop: ${toStop ? toStop.stopName : 'NULL'}`);
      console.timeEnd('Stop Validation');
      console.timeEnd('Total Search Time');
      return res.status(404).json({ success: false, message: 'Invalid stops' });
    }
    
    if (fromStop._id.toString() === toStop._id.toString()) {
      console.timeEnd('Stop Validation');
      console.timeEnd('Total Search Time');
      return res.status(400).json({ success: false, message: 'Source and destination cannot be the same' });
    }
    console.timeEnd('Stop Validation');

    console.time('Route Filtering');
    // Find all routeStops for fromStop and toStop
    const [fromRouteStops, toRouteStops] = await Promise.all([
      RouteStop.find({ stopId: fromStop._id }).lean(),
      RouteStop.find({ stopId: toStop._id }).lean()
    ]);

    // Create a map of routeId -> sequence for fromStops
    const fromRouteMap = new Map();
    fromRouteStops.forEach(rs => {
      fromRouteMap.set(rs.routeId.toString(), rs);
    });

    // Find valid routeIds and build the routeSegmentMap
    const validRouteIds = [];
    const routeSegmentMap = new Map();

    toRouteStops.forEach(toRs => {
      const routeIdStr = toRs.routeId.toString();
      const fromRs = fromRouteMap.get(routeIdStr);

      if (fromRs && fromRs.sequence < toRs.sequence) {
        validRouteIds.push(toRs.routeId);
        routeSegmentMap.set(routeIdStr, {
          routeId: toRs.routeId,
          fromSequence: fromRs.sequence,
          toSequence: toRs.sequence,
          fromDistance: fromRs.distanceFromSource || 0,
          toDistance: toRs.distanceFromSource || 0,
          segmentDistance: (toRs.distanceFromSource || 0) - (fromRs.distanceFromSource || 0)
        });
      }
    });

    console.timeEnd('Route Filtering');

    if (validRouteIds.length === 0) {
      console.timeEnd('Total Search Time');
      return res.json({ success: true, trips: [] });
    }

    console.time('Trip Query');
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const skip = (page - 1) * limit;

    const trips = await Trip.find({
      routeId: { $in: validRouteIds },
      departureDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['SCHEDULED', 'RUNNING'] }
    })
    .skip(skip)
    .limit(Number(limit))
    .populate('busId')
    .populate({ path: 'routeId', populate: { path: 'sourceStop destinationStop' } })
    .lean();
    console.timeEnd('Trip Query');

    if (trips.length === 0) {
      console.timeEnd('Total Search Time');
      return res.json({ success: true, trips: [] });
    }

    const tripIds = trips.map(t => t._id);

    console.time('Batch TripStops & Bookings');
    // Fetch TripStops and Bookings in parallel
    const [tripStops, overlappingBookings] = await Promise.all([
      TripStop.find({ tripId: { $in: tripIds } }).lean(),
      Booking.find({
        tripId: { $in: tripIds },
        bookingStatus: { $ne: 'CANCELLED' }
      }).select('_id tripId boardingSequence droppingSequence').lean()
    ]);

    // Group TripStops by tripId_routeStopId
    const tripStopMap = new Map();
    tripStops.forEach(ts => {
      tripStopMap.set(`${ts.tripId.toString()}_${ts.routeStopId.toString()}`, ts);
    });

    // We only care about bookings that overlap with the specific segment for each trip.
    // However, the segment depends on the trip's route.
    // So we'll filter the overlapping bookings per trip when processing each trip.
    
    // Group bookings by tripId
    const bookingsByTrip = new Map();
    overlappingBookings.forEach(b => {
      const tripIdStr = b.tripId.toString();
      if (!bookingsByTrip.has(tripIdStr)) bookingsByTrip.set(tripIdStr, []);
      bookingsByTrip.get(tripIdStr).push(b);
    });

    const bookingIds = overlappingBookings.map(b => b._id);
    let bookedSeatsByBooking = new Map();

    if (bookingIds.length > 0) {
      const bookedSeatsRecords = await BookingSeat.find({ bookingId: { $in: bookingIds } }).lean();
      bookedSeatsRecords.forEach(seat => {
        const bIdStr = seat.bookingId.toString();
        bookedSeatsByBooking.set(bIdStr, (bookedSeatsByBooking.get(bIdStr) || 0) + 1);
      });
    }
    console.timeEnd('Batch TripStops & Bookings');

    console.time('Result Formatting');
    const validTrips = [];

    for (const trip of trips) {
      const routeIdStr = trip.routeId._id.toString();
      const segmentInfo = routeSegmentMap.get(routeIdStr);
      if (!segmentInfo) continue; // Should not happen since we filtered by validRouteIds

      // Need routeStop IDs to look up tripStops
      // Since we don't have the exact from/to RouteStop _ids in segmentInfo easily (unless we saved them)
      // Let's grab them from fromRouteStops and toRouteStops
      const fromRs = fromRouteStops.find(rs => rs.routeId.toString() === routeIdStr);
      const toRs = toRouteStops.find(rs => rs.routeId.toString() === routeIdStr);

      const fromTripStop = tripStopMap.get(`${trip._id.toString()}_${fromRs._id.toString()}`);
      const toTripStop = tripStopMap.get(`${trip._id.toString()}_${toRs._id.toString()}`);
      
      const serviceCategory = trip.busId.category || trip.busId.busType || 'Ordinary';
      const fare = calculateFare(segmentInfo.segmentDistance, serviceCategory);

      // Compute available seats for this specific segment
      let bookedSeatsCount = 0;
      const tripBookings = bookingsByTrip.get(trip._id.toString()) || [];
      
      tripBookings.forEach(booking => {
        // Overlap condition: booking.boarding < requested.dropping AND booking.dropping > requested.boarding
        if (booking.boardingSequence < segmentInfo.toSequence && booking.droppingSequence > segmentInfo.fromSequence) {
          bookedSeatsCount += (bookedSeatsByBooking.get(booking._id.toString()) || 0);
        }
      });

      const totalSeats = trip.busId.capacity || 40;
      const availableSeats = Math.max(0, totalSeats - bookedSeatsCount);

      validTrips.push({
        tripId: trip._id,
        bus: {
          busId: trip.busId._id,
          busNumber: trip.busId.busNumber,
          registrationNumber: trip.busId.registrationNumber,
          busType: trip.busId.busType,
          category: trip.busId.category || trip.busId.busType || 'Ordinary',
          serviceType: serviceCategory,
          totalSeats,
          availableSeats,
          amenities: trip.busId.amenities || [],
          depot: trip.busId.depotId || null
        },
        routeId: trip.routeId._id,
        route: trip.routeId,
        boardingPoint: {
          stop: fromStop,
          sequence: segmentInfo.fromSequence,
          time: fromTripStop?.departureTime || trip.departureDate
        },
        droppingPoint: {
          stop: toStop,
          sequence: segmentInfo.toSequence,
          time: toTripStop?.arrivalTime || trip.arrivalDate
        },
        segmentDistance: segmentInfo.segmentDistance,
        fare: fare
      });
    }
    console.timeEnd('Result Formatting');

    console.timeEnd('Total Search Time');
    res.json({ success: true, trips: validTrips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSeatAvailability = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { boardingSequence, droppingSequence } = req.query;

    if (!boardingSequence || !droppingSequence) {
      return res.status(400).json({ success: false, message: 'boardingSequence and droppingSequence required' });
    }

    const trip = await Trip.findById(tripId).populate('busId');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Fetch the bus layout seats
    const layout = await BusLayout.findOne({ busId: trip.busId._id });
    const allSeats = layout ? layout.seats : Array.from({length: trip.busId.capacity}, (_, i) => ({ seatNumber: `${i+1}`, isAvailable: true }));

    // Find all overlapping bookings for this trip
    // Overlap condition: booking.boarding < requested.dropping AND booking.dropping > requested.boarding
    const overlappingBookings = await Booking.find({
      tripId,
      bookingStatus: { $ne: 'CANCELLED' },
      boardingSequence: { $lt: Number(droppingSequence) },
      droppingSequence: { $gt: Number(boardingSequence) }
    });

    const bookingIds = overlappingBookings.map(b => b._id);
    const bookedSeatsRecords = await BookingSeat.find({ bookingId: { $in: bookingIds } });
    const bookedSeatNumbers = bookedSeatsRecords.map(s => s.seatNo);

    const seatMap = allSeats.map(seat => ({
      seatNumber: seat.seatNumber || seat.seatNo,
      isAvailable: !bookedSeatNumbers.includes(seat.seatNumber || seat.seatNo),
      type: seat.type || 'SEATER'
    }));

    res.json({ success: true, seats: seatMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
