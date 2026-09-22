import Booking from '../../database/models/Booking.js';
import User from '../../database/models/User.js';
import Bus from '../../database/models/Bus.js';

export const getAdminDashboardData = async (req, res, next) => {
    try {
        // 1. Total Users
        const totalUsers = await User.countDocuments();

        // 2. Active Fleet
        const activeBuses = await Bus.countDocuments({ status: 'ACTIVE' });

        // 3. Total Revenue (Sum of totalFare for CONFIRMED/PAID bookings)
        const revenueAggregation = await Booking.aggregate([
            { $match: { bookingStatus: 'CONFIRMED' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalFare' } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        // 4. Total Bookings
        const totalBookings = await Booking.countDocuments({ bookingStatus: 'CONFIRMED' });

        // 5. Recent Bookings (Last 5)
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('passengerId', 'fullName email phone')
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'routeId', populate: ['sourceStop', 'destinationStop'] },
                    { path: 'busId' }
                ]
            });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeBuses,
                totalRevenue,
                totalBookings,
                recentBookings
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAdminDashboardData
};
