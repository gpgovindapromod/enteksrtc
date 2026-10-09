import Booking from '../../database/models/Booking.js';
import User from '../../database/models/User.js';
import Bus from '../../database/models/Bus.js';
import Trip from '../../database/models/Trip.js';
import AuditLog from '../../database/models/AuditLog.js';
import Depot from '../../database/models/Depot.js';
import Payment from '../../database/models/Payment.js';
import Route from '../../database/models/Route.js';
import { createRefund } from '../../services/paymentService.js';

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

        const stationsData = await Depot.find().sort({ depotName: 1 });
        const activeBusesList = await Bus.find({ status: 'ACTIVE' }).select('_id busNumber');

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeBuses,
                totalRevenue,
                totalBookings,
                recentBookings,
                stationsData,
                activeBusesList
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminBookings = async (req, res, next) => {
    try {
        const { cursor, limit = 20, startDate, endDate, bookingStatus, paymentStatus, search, busId, isUpcoming } = req.query;
        
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
        let match = {};

        // If they want upcoming, or if they filter by dates/bus, we need to match via trips
        if (isUpcoming === 'true' || busId || startDate || endDate) {
            let tripMatch = {};
            
            if (busId) tripMatch.busId = busId;
            
            if (startDate || endDate || isUpcoming === 'true') {
                tripMatch.departureDate = {};
                if (startDate) tripMatch.departureDate.$gte = new Date(startDate);
                else if (isUpcoming === 'true') tripMatch.departureDate.$gte = new Date();
                
                if (endDate) tripMatch.departureDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
            }
            
            const trips = await Trip.find(tripMatch).select('_id').lean();
            const tripIds = trips.map(t => t._id);
            match.tripId = { $in: tripIds };
        }

        if (bookingStatus) match.bookingStatus = bookingStatus;
        if (paymentStatus) match.paymentStatus = paymentStatus;

        if (search) {
            match.bookingNumber = { $regex: search, $options: 'i' };
        }

        if (cursor) {
            match._id = { $lt: cursor };
        }

        const bookings = await Booking.find(match)
            .sort({ _id: -1 })
            .limit(parsedLimit)
            .populate('passengerId', 'fullName email phone')
            .populate({
                path: 'tripId',
                populate: [
                    { path: 'routeId', populate: ['sourceStop', 'destinationStop'] },
                    { path: 'busId' }
                ]
            })
            .lean();

        const hasMore = bookings.length === parsedLimit;
        const nextCursor = hasMore ? bookings[bookings.length - 1]._id : null;

        res.status(200).json({
            success: true,
            data: bookings,
            nextCursor,
            hasMore
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminActivity = async (req, res, next) => {
    try {
        const { cursor, limit = 20, startDate, endDate, action, module } = req.query;
        
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
        let match = {};

        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        if (action) match.action = action;
        if (module) match.module = module;

        if (cursor) {
            match._id = { $lt: cursor };
        }

        const activities = await AuditLog.find(match)
            .sort({ _id: -1 })
            .limit(parsedLimit)
            .populate('userId', 'fullName email role')
            .lean();

        const hasMore = activities.length === parsedLimit;
        const nextCursor = hasMore ? activities[activities.length - 1]._id : null;

        res.status(200).json({
            success: true,
            data: activities,
            nextCursor,
            hasMore
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminFleet = async (req, res, next) => {
    try {
        const fleet = await Bus.find().populate('depotId', 'depotName').lean();
        res.status(200).json({ success: true, data: fleet });
    } catch (error) {
        next(error);
    }
};

export const getAdminUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: { $nin: ['ADMIN', 'admin'] } }).select('-password -__v').lean();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const addAdminFleet = async (req, res, next) => {
    try {
        const { busNumber, registrationNumber, busType, capacity, depotId } = req.body;
        const newBus = await Bus.create({ busNumber, registrationNumber, busType, capacity, depotId });
        await newBus.populate('depotId', 'depotName');
        res.status(201).json({ success: true, data: newBus });
    } catch (error) {
        next(error);
    }
};

export const addAdminUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, role, password } = req.body;
        const newUser = await User.create({ 
            firstName, lastName, fullName: `${firstName} ${lastName}`.trim(), 
            email, phone, role, password 
        });
        res.status(201).json({ success: true, data: newUser.toSafeJSON() });
    } catch (error) {
        next(error);
    }
};

export const editAdminUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, role } = req.body;
        
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (firstName || lastName) user.fullName = `${user.firstName} ${user.lastName}`.trim();
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        
        await user.save();
        res.status(200).json({ success: true, data: user.toSafeJSON() });
    } catch (error) {
        next(error);
    }
};

export const deleteAdminUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (user.role === 'ADMIN' || user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
        }
        
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.isActive = !user.isActive;
        await user.save();
        
        res.status(200).json({ success: true, data: user.toSafeJSON() });
    } catch (error) {
        next(error);
    }
};

export const addAdminStation = async (req, res, next) => {
    try {
        const stationData = req.body;
        const newStation = await Depot.create(stationData);
        res.status(201).json({ success: true, data: newStation });
    } catch (error) {
        next(error);
    }
};

export const toggleStationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const station = await Depot.findById(id);
        if (!station) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        
        station.isActive = !station.isActive;
        await station.save();
        
        res.status(200).json({ success: true, data: station });
    } catch (error) {
        next(error);
    }
};

export const editAdminFleet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { busNumber, registrationNumber, busType, capacity, depotId } = req.body;
        
        const bus = await Bus.findById(id);
        if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
        
        if (busNumber) bus.busNumber = busNumber;
        if (registrationNumber) bus.registrationNumber = registrationNumber;
        if (busType) bus.busType = busType;
        if (capacity) bus.capacity = capacity;
        if (depotId) bus.depotId = depotId;
        
        await bus.save();
        await bus.populate('depotId', 'depotName');
        res.status(200).json({ success: true, data: bus });
    } catch (error) {
        next(error);
    }
};

export const deleteAdminFleet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bus = await Bus.findById(id);
        if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
        
        const activeTrips = await Trip.countDocuments({ busId: id, status: { $ne: 'COMPLETED' } });
        if (activeTrips > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete bus with active trips.' });
        }
        
        await Bus.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Bus deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const editAdminStation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const stationData = req.body;
        
        const station = await Depot.findByIdAndUpdate(id, stationData, { new: true });
        if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
        
        res.status(200).json({ success: true, data: station });
    } catch (error) {
        next(error);
    }
};

export const deleteAdminStation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const station = await Depot.findById(id);
        if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
        
        const busesCount = await Bus.countDocuments({ depotId: id });
        if (busesCount > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete station with assigned buses.' });
        }
        
        await Depot.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Station deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getAdminRevenue = async (req, res, next) => {
    try {
        const { cursor, limit = 20, startDate, endDate, paymentStatus, search } = req.query;
        
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
        let baseMatch = {};

        if (startDate || endDate) {
            baseMatch.createdAt = {};
            if (startDate) baseMatch.createdAt.$gte = new Date(startDate);
            if (endDate) baseMatch.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }

        if (paymentStatus) {
            baseMatch.paymentStatus = paymentStatus;
        }

        if (search) {
            const matchingBookings = await Booking.find({ bookingNumber: { $regex: search, $options: 'i' } }).select('_id').lean();
            const bookingIds = matchingBookings.map(b => b._id);
            baseMatch.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { bookingId: { $in: bookingIds } }
            ];
        }

        let paginationMatch = { ...baseMatch };
        if (cursor) {
            paginationMatch._id = { $lt: cursor };
        }

        const payments = await Payment.find(paginationMatch)
            .sort({ _id: -1 })
            .limit(parsedLimit)
            .populate({
                path: 'bookingId',
                select: 'bookingNumber passengerId totalFare paymentGateway bookingStatus',
                populate: { path: 'passengerId', select: 'fullName email phone' }
            })
            .lean();

        const hasMore = payments.length === parsedLimit;
        const nextCursor = hasMore ? payments[payments.length - 1]._id : null;

        const successfulAgg = await Payment.aggregate([
            { $match: { ...baseMatch, paymentStatus: 'SUCCESS' } },
            { $group: { _id: null, totalGross: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const grossRevenue = successfulAgg[0]?.totalGross || 0;
        const totalPaymentsCount = successfulAgg[0]?.count || 0;

        const refundAgg = await Payment.aggregate([
            { $match: { ...baseMatch, refundStatus: 'PROCESSED' } },
            { $group: { _id: null, totalRefunds: { $sum: '$refundAmount' }, count: { $sum: 1 } } }
        ]);
        const totalRefunds = refundAgg[0]?.totalRefunds || 0;
        const refundsCount = refundAgg[0]?.count || 0;

        const netRevenue = grossRevenue - totalRefunds;

        res.status(200).json({
            success: true,
            data: payments,
            summary: {
                grossRevenue,
                netRevenue,
                totalRefunds,
                totalPaymentsCount,
                refundsCount
            },
            nextCursor,
            hasMore
        });
    } catch (error) {
        next(error);
    }
};

export const processAdminRefund = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount } = req.body; 
        
        const payment = await Payment.findById(id).populate('bookingId');
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        
        if (payment.paymentStatus !== 'SUCCESS') {
            return res.status(400).json({ success: false, message: 'Only successful payments can be refunded' });
        }
        
        if (payment.refundStatus === 'PROCESSED' && payment.refundAmount >= payment.amount) {
            return res.status(400).json({ success: false, message: 'Payment already fully refunded' });
        }

        const refundAmt = amount ? Number(amount) : (payment.amount - payment.refundAmount);
        if (refundAmt <= 0 || (payment.refundAmount + refundAmt) > payment.amount) {
            return res.status(400).json({ success: false, message: 'Invalid refund amount' });
        }

        const amountPaise = refundAmt * 100;
        
        try {
            const refundResult = await createRefund({
                transactionId: payment.transactionId,
                amountPaise,
                notes: { reason: 'Admin Requested Refund' },
                receiptId: payment.bookingId.bookingNumber
            });

            // Optimistic concurrency control to prevent duplicate refunds
            const updatedPayment = await Payment.findOneAndUpdate(
                { _id: payment._id, __v: payment.__v },
                {
                    $inc: { refundAmount: refundAmt, __v: 1 },
                    $set: { 
                        refundStatus: refundResult.status,
                        providerRefundId: refundResult.refundId
                    }
                },
                { new: true }
            );

            if (!updatedPayment) {
                // Another request modified this payment simultaneously!
                // We should ideally reverse the gateway refund here, but it's complex.
                // We log it and fail the request to alert the admin.
                console.error(`CONCURRENT REFUND DETECTED for payment ${payment._id}`);
                return res.status(409).json({ success: false, message: 'Concurrent refund detected. Please verify gateway.' });
            }
            
            await Booking.findByIdAndUpdate(payment.bookingId._id, {
                $inc: { refundAmountPaise: amountPaise },
                paymentStatus: 'REFUNDED'
            });
            
            res.status(200).json({ success: true, message: 'Refund processed successfully', data: updatedPayment });
        } catch (providerError) {
            res.status(500).json({ success: false, message: 'Refund failed at gateway: ' + providerError.message });
        }
    } catch (error) {
        next(error);
    }
};

export const getAdminAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        let baseMatch = {};

        if (startDate || endDate) {
            baseMatch.createdAt = {};
            if (startDate) baseMatch.createdAt.$gte = new Date(startDate);
            if (endDate) baseMatch.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }

        // 1. Revenue Trends (Grouped by Date)
        const revenueTrendsRaw = await Payment.aggregate([
            { $match: baseMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
                    gross: { $sum: { $cond: [{ $eq: ["$paymentStatus", "SUCCESS"] }, "$amount", 0] } },
                    refunds: { $sum: { $cond: [{ $eq: ["$refundStatus", "PROCESSED"] }, "$refundAmount", 0] } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const revenueTrends = revenueTrendsRaw.map(item => ({
            date: item._id,
            gross: item.gross,
            refunds: item.refunds,
            net: item.gross - item.refunds
        }));

        // 2. Booking Analytics (Status distribution)
        const bookingStatusAgg = await Booking.aggregate([
            { $match: baseMatch },
            { $group: { _id: "$bookingStatus", count: { $sum: 1 } } }
        ]);
        const bookingStats = bookingStatusAgg.map(item => ({
            name: item._id,
            value: item.count
        }));

        // 3. Popular Routes (by active bookings)
        const popularRoutesAgg = await Booking.aggregate([
            { $match: { ...baseMatch, bookingStatus: { $ne: 'CANCELLED' } } },
            {
                $lookup: {
                    from: 'trips',
                    localField: 'tripId',
                    foreignField: '_id',
                    as: 'trip'
                }
            },
            { $unwind: '$trip' },
            { $group: { _id: '$trip.routeId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        await Route.populate(popularRoutesAgg, { 
            path: '_id', 
            select: 'routeName routeNumber'
        });

        const popularRoutes = popularRoutesAgg.map(item => {
            const route = item._id;
            return {
                routeName: route ? `${route.routeName} (${route.routeNumber})` : 'Deleted Route',
                bookings: item.count
            };
        });

        // 4. Fleet Utilization (Aggregate Trips per Depot)
        // We'll group trips by Bus, then populate Depot
        const tripsAgg = await Trip.aggregate([
            { $match: baseMatch },
            { $group: { _id: "$busId", count: { $sum: 1 } } }
        ]);
        await Bus.populate(tripsAgg, { path: '_id', select: 'busNumber depotId', populate: { path: 'depotId', select: 'depotName' } });
        
        const depotStatsMap = {};
        tripsAgg.forEach(item => {
            const bus = item._id;
            const depotName = bus?.depotId?.depotName || 'Unassigned / Deleted';
            if (!depotStatsMap[depotName]) depotStatsMap[depotName] = { depot: depotName, trips: 0, buses: new Set() };
            depotStatsMap[depotName].trips += item.count;
            if (bus) depotStatsMap[depotName].buses.add(bus._id.toString());
        });

        const fleetUtilization = Object.values(depotStatsMap).map(d => ({
            depot: d.depot,
            trips: d.trips,
            activeBuses: d.buses.size
        })).sort((a, b) => b.trips - a.trips);

        res.status(200).json({
            success: true,
            data: {
                revenueTrends,
                bookingStats,
                popularRoutes,
                fleetUtilization
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAdminDashboardData,
    getAdminBookings,
    getAdminActivity,
    getAdminFleet,
    getAdminUsers,
    addAdminFleet,
    editAdminFleet,
    deleteAdminFleet,
    addAdminUser,
    editAdminUser,
    deleteAdminUser,
    toggleUserStatus,
    addAdminStation,
    editAdminStation,
    deleteAdminStation,
    toggleStationStatus,
    getAdminRevenue,
    processAdminRefund,
    getAdminAnalytics
};
