import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../database/models/User.js';
import Depot from '../database/models/Depot.js';
import Trip from '../database/models/Trip.js';
import Booking from '../database/models/Booking.js';
import BookingSeat from '../database/models/BookingSeat.js';
import Bus from '../database/models/Bus.js';
import Route from '../database/models/Route.js';
import Stop from '../database/models/Stop.js';
import BusLayout from '../database/models/BusLayout.js';

async function setupTestConductor() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Find or create default Depot
    let depot = await Depot.findOne({ isActive: true });
    if (!depot) {
      depot = await Depot.findOne();
    }

    // 2. Setup Driver for duty pairing
    let driver = await User.findOne({ email: 'driver.sample@ksrtc.kerala.gov.in' });
    if (!driver) {
      driver = new User({
        firstName: 'Rajesh',
        lastName: 'Kumar',
        fullName: 'Rajesh Kumar (Driver)',
        email: 'driver.sample@ksrtc.kerala.gov.in',
        phone: '+919447123456',
        employeeId: 'KSRTC-DRV-104',
        password: 'user123',
        role: 'DRIVER',
        depotId: depot?._id,
        isVerified: true,
        isActive: true
      });
      await driver.save();
      console.log('Created sample driver: Rajesh Kumar (KSRTC-DRV-104)');
    }

    // 3. Setup Conductor user account
    const conductorEmail = 'conductor@example.com';
    let conductor = await User.findOne({ email: conductorEmail });
    const conductorPasswordPlain = 'conductor123';

    if (!conductor) {
      conductor = new User({
        firstName: 'Suresh',
        lastName: 'Gopi',
        fullName: 'Suresh Gopi (Conductor)',
        email: conductorEmail,
        phone: '+919876543220',
        employeeId: 'KSRTC-CND-1001',
        password: conductorPasswordPlain,
        role: 'CONDUCTOR',
        depotId: depot?._id,
        isVerified: true,
        isActive: true
      });
      await conductor.save();
      console.log(`Created new conductor account: ${conductorEmail}`);
    } else {
      conductor.role = 'CONDUCTOR';
      conductor.firstName = 'Suresh';
      conductor.lastName = 'Gopi';
      conductor.fullName = 'Suresh Gopi (Conductor)';
      conductor.phone = conductor.phone || '+919876543220';
      conductor.employeeId = conductor.employeeId || 'KSRTC-CND-1001';
      conductor.depotId = depot?._id;
      conductor.isVerified = true;
      conductor.isActive = true;
      conductor.password = conductorPasswordPlain;
      await conductor.save();
      console.log(`Updated conductor account: ${conductorEmail}`);
    }

    // 4. Assign an active duty trip with confirmed passenger bookings to this conductor
    // Look for trip 6ac35b0f366668792e22a070 which already has 9 confirmed bookings and booking seats
    let mainTrip = await Trip.findById('6ac35b0f366668792e22a070');
    const now = new Date();
    const departure = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes from now
    const arrival = new Date(departure.getTime() + 3.5 * 3600 * 1000); // 3.5 hours later

    if (mainTrip) {
      mainTrip.conductorId = conductor._id;
      mainTrip.driverId = driver._id;
      mainTrip.status = 'BOARDING';
      mainTrip.departureDate = departure;
      mainTrip.arrivalDate = arrival;
      await mainTrip.save();
      console.log(`Assigned active trip ${mainTrip._id} (BOARDING) to conductor ${conductorEmail}`);
    } else {
      // Find any trip with bookings or create one
      const anyTrip = await Trip.findOne({ status: { $ne: 'CANCELLED' } });
      if (anyTrip) {
        anyTrip.conductorId = conductor._id;
        anyTrip.driverId = driver._id;
        anyTrip.status = 'BOARDING';
        anyTrip.departureDate = departure;
        anyTrip.arrivalDate = arrival;
        await anyTrip.save();
        console.log(`Assigned trip ${anyTrip._id} to conductor ${conductorEmail}`);
      }
    }

    // 5. Also assign 2 upcoming scheduled trips in the future for "Upcoming Duties" view
    const upcomingTrips = await Trip.find({
      _id: { $ne: mainTrip?._id },
      status: { $ne: 'CANCELLED' },
      departureDate: { $gt: departure }
    }).limit(2);

    for (const ut of upcomingTrips) {
      ut.conductorId = conductor._id;
      ut.driverId = driver._id;
      await ut.save();
      console.log(`Assigned upcoming trip ${ut._id} to conductor`);
    }

    console.log('\n--- SUCCESS ---');
    console.log(`Conductor Email:    ${conductorEmail}`);
    console.log(`Conductor Password: ${conductorPasswordPlain}`);
    console.log(`Role:               CONDUCTOR`);
    console.log(`Assigned Bus/Trip:  Active duty trip (BOARDING) + 2 upcoming duties`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error in setupTestConductor:', err);
    process.exit(1);
  }
}

setupTestConductor();
