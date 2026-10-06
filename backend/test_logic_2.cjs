import express from 'express';
import mongoose from 'mongoose';
import Trip from './database/models/Trip.js';
import Booking from './database/models/Booking.js';
import BookingSeat from './database/models/BookingSeat.js';
import BusLayout from './database/models/BusLayout.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI).then(async () => {
    try {
        const trip = await Trip.findOne().populate('busId');
        if (!trip) { console.log('No trip'); process.exit(0); }
        
        const tripId = trip._id;
        console.log('Testing trip:', tripId);
        
        const layout = await BusLayout.findOne({ busId: trip.busId._id });
        const allSeats = layout ? layout.seats : Array.from({length: trip.busId.capacity}, (_, i) => ({ seatNumber: `${i+1}`, isAvailable: true }));
        
        const overlappingBookings = await Booking.find({ tripId });
        const bookingIds = overlappingBookings.map(b => b._id);
        const bookedSeatsRecords = await BookingSeat.find({ bookingId: { $in: bookingIds } });
        
        const seatMap = allSeats.map(seat => {
          const seatNo = seat.seatNumber || seat.seatNo;
          const bookingIdsForSeat = bookedSeatsRecords.filter(s => s.seatNo === seatNo).map(s => String(s.bookingId));
          let status = 'AVAILABLE';
          let isAvailable = true;

          for (const booking of overlappingBookings) {
            if (bookingIdsForSeat.includes(String(booking._id))) {
              isAvailable = false;
              if (booking.isBlock) {
                 status = 'BLOCKED';
              } else if (booking.bookingStatus === 'PENDING') {
                 status = 'HELD';
              } else {
                 status = 'BOOKED';
              }
              break;
            }
          }

          return {
            seatNumber: seatNo,
            isAvailable,
            status,
            type: seat.type || 'SEATER'
          };
        });
        
        console.log(seatMap.slice(0, 3));
        console.log("Total seats:", seatMap.length);
        console.log("Occupied seats:", seatMap.filter(s => !s.isAvailable).length);
        
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
