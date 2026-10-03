import mongoose from 'mongoose';
import Depot from 'file:///C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/database/models/Depot.js';
import Bus from 'file:///C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/database/models/Bus.js';
import Route from 'file:///C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/database/models/Route.js';
import RouteStop from 'file:///C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/database/models/RouteStop.js';
import Stop from 'file:///C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/database/models/Stop.js';
import Trip from 'file:///C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/database/models/Trip.js';
import TripStop from 'file:///C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/database/models/TripStop.js';

async function validateData() {
  await mongoose.connect('mongodb://localhost:27017/enteksrtc');
  
  let report = {
    depots: await Depot.countDocuments(),
    buses: await Bus.countDocuments(),
    routes: await Route.countDocuments(),
    stops: await Stop.countDocuments(),
    trips: await Trip.countDocuments(),
    tripStops: await TripStop.countDocuments(),
    brokenBusRefs: 0,
    brokenRouteRefs: 0,
    brokenStopRefs: 0,
    brokenTripStopRefs: 0,
    invalidRouteSequences: 0,
    invalidDistances: 0,
    invalidSchedules: 0,
    duplicateTrips: 0,
    overlappingBusTrips: 0,
    routesWithMultipleBuses: 0,
    busTypesFound: new Set(),
    serviceTypesFound: new Set()
  };

  const buses = await Bus.find().lean();
  const routes = await Route.find().lean();
  const trips = await Trip.find().lean();
  
  buses.forEach(b => {
    report.busTypesFound.add(b.busType);
  });

  for (const trip of trips) {
    const tripBus = buses.find(b => b._id.toString() === trip.busId.toString());
    if (!tripBus) report.brokenBusRefs++;
    else report.serviceTypesFound.add(tripBus.busType || tripBus.category);
    
    const tripRoute = routes.find(r => r._id.toString() === trip.routeId.toString());
    if (!tripRoute) report.brokenRouteRefs++;
  }

  // Validate Routes
  for (const route of routes) {
    const rStops = await RouteStop.find({ routeId: route._id }).sort({ sequence: 1 }).lean();
    let prevSeq = -1;
    let prevDist = -1;
    let seqOk = true;
    let distOk = true;
    for (const rs of rStops) {
      if (rs.sequence <= prevSeq) seqOk = false;
      if (rs.distanceFromSource < prevDist) distOk = false;
      prevSeq = rs.sequence;
      prevDist = rs.distanceFromSource || 0;
      const stop = await Stop.findById(rs.stopId);
      if (!stop) report.brokenStopRefs++;
    }
    if (!seqOk) report.invalidRouteSequences++;
    if (!distOk) report.invalidDistances++;
    
    const routeTrips = trips.filter(t => t.routeId.toString() === route._id.toString());
    const uniqueBuses = new Set(routeTrips.map(t => t.busId.toString()));
    if (uniqueBuses.size > 1) {
      report.routesWithMultipleBuses++;
    }
  }

  // Schedules validation
  for (const trip of trips) {
    if (new Date(trip.arrivalDate) < new Date(trip.departureDate)) {
      report.invalidSchedules++;
    }
    const tStops = await TripStop.find({ tripId: trip._id }).lean();
    for (const ts of tStops) {
      const rs = await RouteStop.findById(ts.routeStopId);
      if (!rs) report.brokenTripStopRefs++;
    }
  }

  report.busTypesFound = Array.from(report.busTypesFound);
  report.serviceTypesFound = Array.from(report.serviceTypesFound);
  console.log(JSON.stringify(report, null, 2));
  
  await mongoose.disconnect();
}

validateData().catch(console.error);
