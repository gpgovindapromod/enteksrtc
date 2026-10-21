import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../database/models/User.js';
import Depot from '../database/models/Depot.js';
import Trip from '../database/models/Trip.js';

async function resetConductor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'conductor@example.com';
    const password = 'conductor123';
    let conductor = await User.findOne({ email });

    const depot = await Depot.findOne({ isActive: true });

    if (!conductor) {
      conductor = new User({
        firstName: 'Suresh',
        lastName: 'Gopi',
        fullName: 'Suresh Gopi (Conductor)',
        email,
        phone: '+919876543220',
        employeeId: 'KSRTC-CND-1001',
        password,
        role: 'CONDUCTOR',
        depotId: depot?._id,
        isVerified: true,
        isActive: true
      });
      await conductor.save();
      console.log(`Created conductor user: ${email} / ${password}`);
    } else {
      conductor.role = 'CONDUCTOR';
      conductor.password = password;
      conductor.isActive = true;
      conductor.isVerified = true;
      conductor.depotId = conductor.depotId || depot?._id;
      await conductor.save();
      console.log(`Reset conductor user: ${email} / ${password}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error resetting conductor:', err);
    process.exit(1);
  }
}

resetConductor();
