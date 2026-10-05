import mongoose from 'mongoose';

const recurringScheduleSchema = new mongoose.Schema(
  {
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    
    // Operating days: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    operatingDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    
    // Departure time for the FIRST stop in HH:mm format (e.g., "06:30")
    departureTime: { type: String, required: true },
    
    // Pre-calculated or actual offset minutes from departureTime for each RouteStop
    // e.g., [{ routeStopId: "...", offsetMinutes: 0 }, { routeStopId: "...", offsetMinutes: 45 }]
    stops: [
      {
        routeStopId: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteStop', required: true },
        offsetMinutes: { type: Number, required: true }
      }
    ],

    isActive: { type: Boolean, default: true },
    
    // Reference for admin tracking
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('RecurringSchedule', recurringScheduleSchema);
