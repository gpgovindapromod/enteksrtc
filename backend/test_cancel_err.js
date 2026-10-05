import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Booking from './database/models/Booking.js';
import Trip from './database/models/Trip.js';
import { evaluateCancellation } from './utils/cancellationPolicy.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const booking = await Booking.findById('6ac36b079015691ac22469ca').populate('tripId');
    if (!booking) {
      console.log('Booking not found');
      process.exit(1);
    }
    
    console.log('Booking found:', { 
      status: booking.bookingStatus, 
      paymentStatus: booking.paymentStatus,
      farePaise: booking.farePaise,
      totalFare: booking.totalFare
    });
    
    if (booking.paymentStatus === 'PAID') {
      const policy = evaluateCancellation(booking, booking.tripId);
      console.log('Policy:', policy);
      
      booking.cancellationFeePaise = policy.cancellationFeePaise;
      booking.refundAmountPaise = policy.refundAmountPaise;
      
      booking.bookingStatus = 'CANCELLED';
      booking.holdExpiresAt = null;
      booking.paymentStatus = 'REFUND_REQUESTED';
      
      console.log('Attempting to save booking...');
      await booking.save();
      console.log('Booking saved successfully!');
    } else {
      console.log('Booking is not PAID');
    }
  } catch (error) {
    console.error('Error during cancellation simulation:', error);
  } finally {
    mongoose.disconnect();
  }
}

test();
