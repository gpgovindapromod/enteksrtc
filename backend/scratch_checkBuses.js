import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enteksrtc').then(async () => {
  const Bus = (await import('./database/models/Bus.js')).default;
  const Depot = (await import('./database/models/Depot.js')).default;
  
  const unassignedCount = await Bus.countDocuments({ depotId: { $exists: false } });
  const total = await Bus.countDocuments();
  console.log('Unassigned buses:', unassignedCount, '/', total);
  
  if (unassignedCount > 0) {
      console.log('Assigning random depots to unassigned buses...');
      const depots = await Depot.find();
      const unassignedBuses = await Bus.find({ depotId: { $exists: false } });
      
      for (const bus of unassignedBuses) {
          const randomDepot = depots[Math.floor(Math.random() * depots.length)];
          bus.depotId = randomDepot._id;
          await bus.save();
      }
      console.log('Done assigning.');
  }
  
  process.exit(0);
}).catch(console.error);
