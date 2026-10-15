import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import User from './database/models/User.js';

async function updateFrontOfficePasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Depot = (await import('./database/models/Depot.js')).default;
    const depots = await Depot.find({ isActive: true });
    console.log(`Found ${depots.length} active depots.`);

    // 1. Update existing FRONT_OFFICE and DRIVER users
    const existingUsers = await User.find({ role: { $in: ['FRONT_OFFICE', 'DRIVER'] } });
    for (const u of existingUsers) {
      u.role = 'FRONT_OFFICE';
      u.password = 'user123';
      await u.save();
      console.log(`Updated existing user: ${u.email}`);
    }

    // 2. Ensure each depot has at least one FRONT_OFFICE staff
    for (const depot of depots) {
      let staff = await User.findOne({ depotId: depot._id, role: 'FRONT_OFFICE' });
      if (!staff) {
        const email = `fo.${depot.depotCode.toLowerCase()}@ksrtc.kerala.gov.in`;
        staff = await User.findOne({ email });
        if (!staff) {
          staff = new User({
            firstName: `${depot.depotName}`,
            lastName: 'Front Office',
            fullName: `${depot.depotName} Front Office Staff`,
            email: email,
            password: 'user123',
            role: 'FRONT_OFFICE',
            depotId: depot._id,
            isVerified: true,
            isActive: true
          });
          await staff.save();
          console.log(`Created new Front Office staff for depot ${depot.depotCode}: ${email}`);
        } else {
          staff.depotId = depot._id;
          staff.role = 'FRONT_OFFICE';
          staff.password = 'user123';
          await staff.save();
          console.log(`Assigned existing email ${email} to depot ${depot.depotCode}`);
        }
      } else {
        staff.password = 'user123';
        await staff.save();
      }
    }

    console.log('All depots verified. All front office passwords set to user123.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  }
}

updateFrontOfficePasswords();
