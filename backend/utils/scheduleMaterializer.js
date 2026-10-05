import Trip from '../database/models/Trip.js';
import TripStop from '../database/models/TripStop.js';
import RecurringSchedule from '../database/models/RecurringSchedule.js';
import mongoose from 'mongoose';

/**
 * Ensures Trips exist for the given date by materializing them from active RecurringSchedules.
 * Safe to call concurrently (catches duplicate keys if uniqueness is enforced on route+bus+date).
 */
export const materializeTripsForDate = async (targetDate) => {
  const queryDate = new Date(targetDate);
  const dayOfWeek = queryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  // 1. Find all active schedules operating on this day of the week
  const activeSchedules = await RecurringSchedule.find({
    isActive: true,
    operatingDays: dayOfWeek
  });

  if (activeSchedules.length === 0) return;

  // 2. Find existing trips for this date (to avoid duplicates)
  const existingTrips = await Trip.find({
    departureDate: { $gte: startOfDay, $lte: endOfDay }
  }).select('routeId busId departureDate');
  
  // Create a signature to identify existing trips (routeId_busId_HH:mm)
  const existingSignatures = new Set(existingTrips.map(t => {
    const hh = String(t.departureDate.getHours()).padStart(2, '0');
    const mm = String(t.departureDate.getMinutes()).padStart(2, '0');
    return `${t.routeId}_${t.busId}_${hh}:${mm}`;
  }));

  // 3. Generate missing trips
  const tripsToInsert = [];
  const schedulesToProcess = [];

  for (const schedule of activeSchedules) {
    const signature = `${schedule.routeId}_${schedule.busId}_${schedule.departureTime}`;
    
    if (!existingSignatures.has(signature)) {
      // Need to materialize this trip!
      const [hh, mm] = schedule.departureTime.split(':').map(Number);
      const tripDepartureDate = new Date(startOfDay);
      tripDepartureDate.setHours(hh, mm, 0, 0);

      // Calculate trip arrival date (departure + last stop offset)
      let tripArrivalDate = new Date(tripDepartureDate);
      if (schedule.stops.length > 0) {
        const lastStop = schedule.stops[schedule.stops.length - 1];
        tripArrivalDate = new Date(tripDepartureDate.getTime() + (lastStop.offsetMinutes * 60000));
      }

      const tripId = new mongoose.Types.ObjectId();
      tripsToInsert.push({
        _id: tripId,
        busId: schedule.busId,
        routeId: schedule.routeId,
        departureDate: tripDepartureDate,
        arrivalDate: tripArrivalDate,
        status: 'SCHEDULED',
        bookingCutoffMinutes: 30
      });

      schedulesToProcess.push({ tripId, schedule, tripDepartureDate });
    }
  }

  if (tripsToInsert.length === 0) return; // Nothing to do

  try {
    await Trip.insertMany(tripsToInsert, { ordered: false });
    
    // 4. Generate the corresponding TripStops
    const tripStopsToInsert = [];
    
    for (const item of schedulesToProcess) {
      for (const stop of item.schedule.stops) {
        // arrival and departure can be offset based on standard template behavior
        const stopTime = new Date(item.tripDepartureDate.getTime() + (stop.offsetMinutes * 60000));
        
        tripStopsToInsert.push({
          tripId: item.tripId,
          routeStopId: stop.routeStopId,
          arrivalTime: stopTime,
          departureTime: stopTime, // Simplify: arrival=departure for generated template. Real updates will tweak this.
          timetableType: 'GENERATED'
        });
      }
    }

    if (tripStopsToInsert.length > 0) {
      await TripStop.insertMany(tripStopsToInsert, { ordered: false });
    }
    
    console.log(`[Materializer] Generated ${tripsToInsert.length} trips for ${startOfDay.toISOString().split('T')[0]}`);
  } catch (error) {
    // Ignore duplicate key errors if a concurrent request already materialized them
    if (error.code !== 11000) {
      console.error('[Materializer] Error materializing trips:', error.message);
    }
  }
};
