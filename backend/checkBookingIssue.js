import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Booking from './database/models/Booking.js';
import BookingSeat from './database/models/BookingSeat.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const bookings = await Booking.find({ bookingStatus: 'CONFIRMED' }).limit(1);
  if (!bookings.length) {
    console.log("No confirmed bookings");
    process.exit(0);
  }
  const b = bookings[0];
  console.log("Booking found:", b._id, "Trip:", b.tripId);
  const seats = await BookingSeat.find({ bookingId: b._id });
  console.log("Seats:", seats);
  process.exit(0);
}
check();
