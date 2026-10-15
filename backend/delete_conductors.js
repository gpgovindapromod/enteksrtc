import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import User from './database/models/User.js';
import Trip from './database/models/Trip.js';

async function deleteConductors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const conductors = await User.find({ role: 'CONDUCTOR' });
    console.log(`Found ${conductors.length} users with role CONDUCTOR.`);

    const conductorIds = conductors.map(c => c._id);

    // Unassign conductor references in trips so there are no broken links
    if (conductorIds.length > 0) {
      const tripUpdateResult = await Trip.updateMany(
        { conductorId: { $in: conductorIds } },
        { $unset: { conductorId: 1 } }
      );
      console.log(`Unassigned conductors from ${tripUpdateResult.modifiedCount} trips.`);
    }

    const deleteResult = await User.deleteMany({ role: 'CONDUCTOR' });
    console.log(`Deleted ${deleteResult.deletedCount} users with role CONDUCTOR.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting conductors:', err);
    process.exit(1);
  }
}

deleteConductors();
