import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import User from './database/models/User.js';
import Depot from './database/models/Depot.js';
import Trip from './database/models/Trip.js';

async function restoreConductorsAndDeleteDrivers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Delete all users with role DRIVER
    const drivers = await User.find({ role: 'DRIVER' });
    console.log(`Found ${drivers.length} users with role DRIVER.`);
    const driverIds = drivers.map(d => d._id);
    if (driverIds.length > 0) {
      await Trip.updateMany(
        { driverId: { $in: driverIds } },
        { $unset: { driverId: 1 } }
      );
    }
    const delResult = await User.deleteMany({ role: 'DRIVER' });
    console.log(`Deleted ${delResult.deletedCount} users with role DRIVER.`);

    // 2. Re-create / Ensure Conductors for each active Depot
    const depots = await Depot.find({ isActive: true });
    console.log(`Ensuring conductors exist for ${depots.length} active depots...`);

    let restoredCount = 0;
    for (const depot of depots) {
      const existingConductor = await User.findOne({ depotId: depot._id, role: 'CONDUCTOR' });
      if (!existingConductor) {
        const conductorEmail = `conductor.${depot.depotCode.toLowerCase()}@ksrtc.kerala.gov.in`;
        let user = await User.findOne({ email: conductorEmail });
        if (!user) {
          user = new User({
            firstName: `${depot.depotName}`,
            lastName: 'Conductor',
            fullName: `${depot.depotName} Conductor`,
            email: conductorEmail,
            password: 'user123',
            role: 'CONDUCTOR',
            depotId: depot._id,
            isVerified: true,
            isActive: true
          });
          await user.save();
          restoredCount++;
          console.log(`Provisioned conductor for depot ${depot.depotCode}: ${conductorEmail}`);
        } else {
          user.role = 'CONDUCTOR';
          user.depotId = depot._id;
          user.password = 'user123';
          await user.save();
          restoredCount++;
        }
      }
    }

    // Also restore default conductor demo user conductor@example.com
    const demoConductor = await User.findOne({ email: 'conductor@example.com' });
    if (!demoConductor) {
      const firstDepot = depots[0];
      const conductor = new User({
        firstName: 'Suresh',
        lastName: 'Gopi',
        fullName: 'Suresh Gopi (Conductor)',
        email: 'conductor@example.com',
        password: 'user123',
        role: 'CONDUCTOR',
        depotId: firstDepot?._id,
        isVerified: true,
        isActive: true
      });
      await conductor.save();
      console.log('Restored default demo conductor: conductor@example.com (password: user123)');
    }

    console.log(`Done. Restored ${restoredCount} conductors. All conductors password: user123.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error in restoration/deletion:', err);
    process.exit(1);
  }
}

restoreConductorsAndDeleteDrivers();
