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
                dashboardData = await getStationMasterDashboard(userId);
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

const getStationMasterDashboard = async (userId) => {
    // 1. Get the Station Master's user record to find their depotId
    const stationMaster = await User.findById(userId).populate('depotId');
    if (!stationMaster || !stationMaster.depotId) {
        return {
            activePlatforms: 0,
            arrivingBuses: 0,
            departingBuses: 0,
            alerts: [{ message: "No depot assigned to your account. Please contact Admin." }],
            upcomingDepartures: [],
            recentArrivals: []
        };
    }

    const depot = stationMaster.depotId;
    
    // 2. Find routes where this depot is either the source or destination
    // For a real transit app, you'd match by stop ID. Assuming Depot and Stop are related or we just mock the trips for now if we don't have exact Stop matches.
    // Let's do a simple count of all trips for today to simulate activity since we might not have Stops seeded exactly matching Depots yet.
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayTrips = await Trip.find({
        departureDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate({ path: 'routeId', populate: ['sourceStop', 'destinationStop'] })
      .populate('busId')
      .limit(20)
      .lean();

    // Since our database might not have perfectly correlated Depot -> Stop data yet, 
    // we will simulate arriving/departing by just splitting the available trips 
    // to give the dashboard a realistic feel until full GPS/routing is implemented.
    const departures = todayTrips.filter((t, i) => i % 2 === 0);
    const arrivals = todayTrips.filter((t, i) => i % 2 !== 0);

    return {
        depotName: depot.depotName,
        activePlatforms: depot.totalPlatforms || 0,
        arrivingBuses: arrivals.length,
        departingBuses: departures.length,
        alerts: [
            { message: `System online. Managing ${depot.depotName} (Code: ${depot.depotCode}).` },
            { message: "Routine maintenance scheduled for Platform 2 at 14:00." }
        ],
        upcomingDepartures: departures.slice(0, 5).map(t => ({
            id: t._id,
            time: t.departureDate,
            route: `${t.routeId?.sourceStop?.name || 'Unknown'} to ${t.routeId?.destinationStop?.name || 'Unknown'}`,
            bus: t.busId?.registrationNumber || 'Pending',
            status: t.status
        })),
        recentArrivals: arrivals.slice(0, 5).map(t => ({
            id: t._id,
            time: t.arrivalDate || t.departureDate,
            route: `${t.routeId?.sourceStop?.name || 'Unknown'} to ${t.routeId?.destinationStop?.name || 'Unknown'}`,
            bus: t.busId?.registrationNumber || 'Pending',
            status: t.status
        }))
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
