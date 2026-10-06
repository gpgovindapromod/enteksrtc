const mongoose = require('mongoose');
const Booking = require('./database/models/Booking');
const BookingSeat = require('./database/models/BookingSeat');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI).then(async () => {
   const bookings = await Booking.find({ bookingStatus: 'PENDING' }).sort({ createdAt: -1 }).limit(1);
   if (bookings.length === 0) { console.log('No bookings'); process.exit(0); }
   
   const tripId = bookings[0].tripId;
   const overlappingBookings = await Booking.find({ tripId });
   const bookingIds = overlappingBookings.map(b => b._id);
   const bookedSeatsRecords = await BookingSeat.find({ bookingId: { $in: bookingIds } });
   
   console.log('overlappingBookings:', overlappingBookings.length);
   console.log('bookedSeatsRecords:', bookedSeatsRecords.length);
   
   // Simulating tripController.js logic
   let allFalseCount = 0;
   for (let i = 1; i <= 40; i++) {
       const seatNo = String(i);
       const bookingIdsForSeat = bookedSeatsRecords.filter(s => s.seatNo === seatNo).map(s => String(s.bookingId));
       let isAvailable = true;
       for (const booking of overlappingBookings) {
          if (bookingIdsForSeat.includes(String(booking._id))) {
             isAvailable = false;
             break;
          }
       }
       if (!isAvailable) allFalseCount++;
   }
   console.log('Seats marked as NOT available:', allFalseCount);
   process.exit(0);
}).catch(console.error);
