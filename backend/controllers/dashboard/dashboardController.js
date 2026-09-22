import Booking from '../../database/models/Booking.js';
import Trip from '../../database/models/Trip.js';
import Route from '../../database/models/Route.js';
import Bus from '../../database/models/Bus.js';
import Stop from '../../database/models/Stop.js';
import User from '../../database/models/User.js';
import Depot from '../../database/models/Depot.js';
import { normalizeRole } from '../../utils/roleUtils.js';

export const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const role = normalizeRole(req.user.role);

        let dashboardData = {};

        switch (role) {
            case 'admin':
                dashboardData = await getAdminDashboard(userId);
                break;
            case 'passenger':
                dashboardData = await getPassengerDashboard(userId);
                break;
            case 'stationMaster':
                dashboardData = getStationMasterDashboard(userId);
                break;
            case 'conductor':
                dashboardData = getConductorDashboard(userId);
                break;
            case 'support':
                dashboardData = getSupportDashboard(userId);
                break;
            default:
                return res.status(403).json({ success: false, message: "Unrecognized role for dashboard access." });
        }

        return res.status(200).json({
            success: true,
            role,
            data: dashboardData
        });
    } catch (error) {
        next(error);
    }
};

const getAdminDashboard = async (req, res) => {
    // 1. Total Users
    const totalUsers = await User.countDocuments();
    // 2. Active Fleet
    const activeBuses = await Bus.countDocuments({ status: 'ACTIVE' });
    // 3. Total Revenue
    const revenueAggregation = await Booking.aggregate([
        { $match: { bookingStatus: 'CONFIRMED' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalFare' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    
    // 4. Recent Bookings
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

    // 6. Stations (Depots)
    const totalStations = await Depot.countDocuments();
    const stations = await Depot.find().lean();
    
    // 7. Station Masters (Assigned to Depots)
    const stationMasters = await User.find({ role: 'STATION_MASTER' }).select('fullName email phone depotId isActive').lean();
    
    const stationsData = stations.map(station => {
        const assignedMasters = stationMasters.filter(sm => String(sm.depotId) === String(station._id));
        return {
            ...station,
            stationMasters: assignedMasters
        };
    });

    return { totalUsers, activeBuses, totalRevenue, recentBookings, totalStations, stationsData };
};

const getPassengerDashboard = async (userId) => {
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
    const travelCredits = 0;

    return {
        totalTrips,
        loyaltyPoints,
        travelCredits,
        upcomingTrips: upcomingTrips.slice(0, 5),
        recentTrips: recentTrips.slice(0, 5)
    };
};

const getStationMasterDashboard = (userId) => {
    return {
        activePlatforms: 12,
        arrivingBuses: 4,
        departingBuses: 2,
        stationAlerts: ["Platform 3 maintenance", "Heavy rain delay on Route 4A"]
    };
};

const getConductorDashboard = (userId) => {
    return {
        assignedBus: "KL-15-7890",
        assignedRoute: "Trivandrum - Ernakulam",
        passengersOnboard: 34,
        totalSeats: 45,
        upcomingStops: ["Kollam", "Alappuzha"]
    };
};

const getSupportDashboard = (userId) => {
    return {
        openTickets: 42,
        resolvedToday: 15,
        urgentComplaints: 3,
        recentActivity: ["Refund processed #1029", "Password reset for user #991"]
    };
};

export default { getDashboardData };
