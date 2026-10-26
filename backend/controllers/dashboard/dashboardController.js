import Booking from '../../database/models/Booking.js';
import Trip from '../../database/models/Trip.js';
import Route from '../../database/models/Route.js';
import Bus from '../../database/models/Bus.js';
import Stop from '../../database/models/Stop.js';
import User from '../../database/models/User.js';
import Depot from '../../database/models/Depot.js';
import BookingSeat from '../../database/models/BookingSeat.js';
import BusLayout from '../../database/models/BusLayout.js';
import { normalizeRole } from '../../utils/roleUtils.js';

export const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const role = normalizeRole(req.user.role);
        const filters = req.query; // Capture query params for advanced filters

        let dashboardData = {};

        switch (role) {
            case 'admin':
                dashboardData = await getAdminDashboard(userId, filters);
                break;
            case 'passenger':
                dashboardData = await getPassengerDashboard(userId);
                break;
            case 'stationMaster':
            case 'frontOffice':
                dashboardData = await getStationMasterDashboard(userId);
                break;
            case 'conductor':
                dashboardData = await getConductorDashboard(userId);
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

const getAdminDashboard = async (userId, filters = {}) => {
    const { startDate, endDate, bookingStatus } = filters;
    
    // Build date match object
    let dateMatch = {};
    if (startDate || endDate) {
        dateMatch.createdAt = {};
        if (startDate) dateMatch.createdAt.$gte = new Date(startDate);
        if (endDate) dateMatch.createdAt.$lte = new Date(endDate);
    }

    const bookingMatch = { ...dateMatch };
    if (bookingStatus) {
        bookingMatch.bookingStatus = bookingStatus;
    }

    // Execute all independent dashboard queries in parallel to eliminate sequential roundtrips
    const [
        totalUsers,
        totalPassengers,
        activeBuses,
        totalBuses,
        totalRoutes,
        totalScheduledTrips,
        bookingAggregation,
        revenueAggregation,
        recentBookings,
        totalStations,
        stations,
        stationMasters,
        trendsAggregation
    ] = await Promise.all([
        User.countDocuments(dateMatch),
        User.countDocuments({ role: 'PASSENGER', ...dateMatch }),
        Bus.countDocuments({ status: 'ACTIVE' }),
        Bus.countDocuments(),
        Route.countDocuments(),
        Trip.countDocuments(dateMatch),
        Booking.aggregate([
            { $match: bookingMatch },
            { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
        ]),
        Booking.aggregate([
            { $match: { paymentStatus: { $in: ['PAID', 'REFUND_REQUESTED', 'REFUNDED'] }, ...dateMatch } },
            { 
                $group: { 
                    _id: null, 
                    totalRevenuePaise: { $sum: { $subtract: [{ $ifNull: ['$farePaise', 0] }, { $ifNull: ['$refundAmountPaise', 0] }] } } 
                } 
            }
        ]),
        Booking.find(bookingMatch)
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('passengerId', 'fullName email phone')
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'routeId', populate: ['sourceStop', 'destinationStop'] },
                    { path: 'busId' }
                ]
            })
            .lean(),
        Depot.countDocuments(),
        Depot.find().lean(),
        User.find({ role: 'STATION_MASTER' }).select('fullName email phone depotId isActive').lean(),
        Booking.aggregate([
            { $match: { ...dateMatch } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    bookingCount: { $sum: 1 },
                    revenuePaise: {
                        $sum: {
                            $cond: [
                                { $in: ["$paymentStatus", ["PAID", "REFUND_REQUESTED", "REFUNDED"]] },
                                { $subtract: [{ $ifNull: ["$farePaise", 0] }, { $ifNull: ["$refundAmountPaise", 0] }] },
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ])
    ]);

    let totalBookings = 0;
    let bookingStatusBreakdown = {};
    bookingAggregation.forEach(status => {
        bookingStatusBreakdown[status._id] = status.count;
        totalBookings += status.count;
    });

    const totalRevenue = revenueAggregation.length > 0 ? (revenueAggregation[0].totalRevenuePaise / 100) : 0;
    
    const stationsData = stations.map(station => {
        const assignedMasters = stationMasters.filter(sm => String(sm.depotId) === String(station._id));
        return {
            ...station,
            stationMasters: assignedMasters
        };
    });

    const chartData = trendsAggregation.map(item => {
        const month = String(item._id.month).padStart(2, '0');
        const day = String(item._id.day).padStart(2, '0');
        return {
            date: `${item._id.year}-${month}-${day}`,
            bookings: item.bookingCount,
            revenue: item.revenuePaise / 100
        };
    });

    return { 
        totalUsers, 
        totalPassengers,
        totalBuses,
        activeBuses,
        totalRoutes,
        totalScheduledTrips,
        totalBookings,
        bookingStatusBreakdown,
        totalRevenue, 
        recentBookings, 
        totalStations, 
        stationsData,
        chartData // Added for Phase 4B Recharts
    };
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
        .sort({ createdAt: -1 })
        .lean();

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

const getConductorDashboard = async (userId) => {
    const now = new Date();
    const trips = await Trip.find({
        conductorId: userId,
        status: { $ne: 'CANCELLED' },
        $or: [
            { departureDate: { $gte: now } },
            { status: { $in: ['BOARDING', 'DEPARTED'] } }
        ]
    })
        .sort({ departureDate: 1 })
        .limit(8)
        .populate({
            path: 'busId',
            populate: { path: 'layoutId', model: 'BusLayout' }
        })
        .populate({
            path: 'routeId',
            populate: [
                { path: 'sourceStop', model: 'Stop' },
                { path: 'destinationStop', model: 'Stop' }
            ]
        })
        .populate('driverId', 'firstName lastName fullName phone employeeId')
        .lean();

    const activeTrip = trips.find(trip => ['BOARDING', 'DEPARTED'].includes(trip.status))
        || trips.find(trip => new Date(trip.departureDate) >= now)
        || trips[0];

    if (!activeTrip) {
        return {
            currentTrip: null,
            upcomingTrips: [],
            seatSummary: { total: 0, occupied: 0, held: 0, available: 0, blocked: 0 },
            seats: [],
            manifest: []
        };
    }

    const activeBookings = await Booking.find({
        tripId: activeTrip._id,
        bookingStatus: { $ne: 'CANCELLED' },
        paymentStatus: { $nin: ['FAILED', 'REFUNDED'] },
        $or: [
            { bookingStatus: 'CONFIRMED' },
            { holdExpiresAt: { $gt: now } }
        ]
    })
        .populate('passengerId', 'firstName lastName fullName phone')
        .populate('boardingStop', 'stopName')
        .populate('droppingStop', 'stopName')
        .lean();

    const bookingIds = activeBookings.map(booking => booking._id);
    const bookingSeats = bookingIds.length
        ? await BookingSeat.find({ bookingId: { $in: bookingIds } }).lean()
        : [];
    const seatsByBooking = new Map();
    bookingSeats.forEach(seat => {
        const bookingId = String(seat.bookingId);
        const seats = seatsByBooking.get(bookingId) || [];
        seats.push(seat);
        seatsByBooking.set(bookingId, seats);
    });

    const layout = activeTrip.busId?.layoutId;
    const totalCapacity = activeTrip.busId?.capacity || layout?.seats?.length || 0;
    const layoutSeats = layout?.seats?.length
        ? layout.seats
        : Array.from({ length: totalCapacity }, (_, index) => ({
            seatNo: String(index + 1),
            row: Math.floor(index / 4) + 1,
            column: (index % 4) + 1,
            type: 'SEATER'
        }));

    const seatState = new Map();
    activeBookings.forEach(booking => {
        const status = booking.isBlock
            ? 'BLOCKED'
            : booking.bookingStatus === 'PENDING'
                ? 'HELD'
                : 'OCCUPIED';
        (seatsByBooking.get(String(booking._id)) || []).forEach(bookingSeat => {
            seatState.set(bookingSeat.seatNo, {
                status,
                bookingId: booking._id,
                passengerName: booking.isBlock
                    ? 'Operational block'
                    : bookingSeat.passengerName || booking.passengerId?.fullName ||
                      [booking.passengerId?.firstName, booking.passengerId?.lastName].filter(Boolean).join(' ') ||
                      'Passenger'
            });
        });
    });

    const seats = layoutSeats.map(seat => {
        const seatNo = seat.seatNo || seat.seatNumber;
        const state = seatState.get(seatNo);
        return {
            seatNo,
            row: seat.row,
            column: seat.column,
            type: seat.type || 'SEATER',
            status: state?.status || 'AVAILABLE',
            bookingId: state?.bookingId || null,
            passengerName: state?.passengerName || null
        };
    });

    const occupied = seats.filter(seat => seat.status === 'OCCUPIED').length;
    const held = seats.filter(seat => seat.status === 'HELD').length;
    const blocked = seats.filter(seat => seat.status === 'BLOCKED').length;
    const routeName = trip => trip.routeId
        ? `${trip.routeId.sourceStop?.stopName || 'Origin'} → ${trip.routeId.destinationStop?.stopName || 'Destination'}`
        : 'Route pending';
    const driverName = activeTrip.driverId
        ? activeTrip.driverId.fullName ||
          [activeTrip.driverId.firstName, activeTrip.driverId.lastName].filter(Boolean).join(' ')
        : 'Driver not assigned';

    return {
        currentTrip: {
            id: activeTrip._id,
            status: activeTrip.status,
            departureDate: activeTrip.departureDate,
            arrivalDate: activeTrip.arrivalDate,
            route: routeName(activeTrip),
            routeNumber: activeTrip.routeId?.routeNumber || null,
            busNumber: activeTrip.busId?.busNumber || null,
            registrationNumber: activeTrip.busId?.registrationNumber || null,
            busType: activeTrip.busId?.busType || null,
            driver: {
                name: driverName,
                phone: activeTrip.driverId?.phone || null,
                employeeId: activeTrip.driverId?.employeeId || null
            }
        },
        upcomingTrips: trips.map(trip => ({
            id: trip._id,
            status: trip.status,
            departureDate: trip.departureDate,
            arrivalDate: trip.arrivalDate,
            route: routeName(trip),
            busNumber: trip.busId?.busNumber || null,
            registrationNumber: trip.busId?.registrationNumber || null,
            driver: trip.driverId
                ? trip.driverId.fullName ||
                  [trip.driverId.firstName, trip.driverId.lastName].filter(Boolean).join(' ')
                : 'Driver not assigned'
        })),
        seatSummary: {
            total: seats.length,
            occupied,
            held,
            blocked,
            available: Math.max(0, seats.length - occupied - held - blocked)
        },
        seats,
        manifest: activeBookings
            .filter(booking => booking.bookingStatus === 'CONFIRMED' && !booking.isBlock)
            .flatMap(booking => (seatsByBooking.get(String(booking._id)) || []).map(seat => ({
                bookingId: booking._id,
                bookingNumber: booking.bookingNumber,
                seatNo: seat.seatNo,
                passengerName: seat.passengerName || booking.passengerId?.fullName ||
                    [booking.passengerId?.firstName, booking.passengerId?.lastName].filter(Boolean).join(' ') ||
                    'Passenger',
                phone: booking.passengerId?.phone || null,
                boardingStop: booking.boardingStop?.stopName || 'Origin',
                droppingStop: booking.droppingStop?.stopName || 'Destination'
            })))
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
