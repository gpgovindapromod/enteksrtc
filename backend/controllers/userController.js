import Booking from '../database/models/Booking.js';
import Trip from '../database/models/Trip.js';
import Route from '../database/models/Route.js';
import Bus from '../database/models/Bus.js';
import Stop from '../database/models/Stop.js';
import User from '../database/models/User.js';

export const getUserDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Fetch all bookings for the user
        const bookings = await Booking.find({ passengerId: userId })
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'busId', model: 'Bus' },
                    { 
                        path: 'routeId', 
                        model: 'Route',
                        populate: [
                            { path: 'sourceStop', model: 'Stop' },
                            { path: 'destinationStop', model: 'Stop' }
                        ]
                    }
                ]
            })
            .populate('boardingStop')
            .populate('droppingStop')
            .sort({ createdAt: -1 });

        const now = new Date();
        const upcomingTrips = [];
        const recentTrips = [];
        
        let totalTrips = 0;
        let totalSpent = 0;
        
        bookings.forEach(booking => {
            if (booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'COMPLETED') {
                totalTrips++;
                totalSpent += booking.totalFare || 0;
                
                if (booking.tripId && booking.tripId.departureDate) {
                    const tripDate = new Date(booking.tripId.departureDate);
                    if (tripDate >= now) {
                        upcomingTrips.push(booking);
                    } else {
                        recentTrips.push(booking);
                    }
                }
            }
        });

        const loyaltyPoints = Math.floor(totalSpent * 0.1);
        const travelCredits = 0; // Mocked for now

        res.status(200).json({
            success: true,
            data: {
                totalTrips,
                loyaltyPoints,
                travelCredits,
                upcomingTrips: upcomingTrips.slice(0, 5),
                recentTrips: recentTrips.slice(0, 5)
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getUserDashboardData
};
