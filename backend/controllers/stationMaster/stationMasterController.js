import User from '../../database/models/User.js';
import Bus from '../../database/models/Bus.js';
import Trip from '../../database/models/Trip.js';
import Depot from '../../database/models/Depot.js';
import Booking from '../../database/models/Booking.js';
import bcrypt from 'bcrypt';

// Dashboard Overview
export const getStationMasterDashboard = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const depot = await Depot.findById(depotId);

        if (!depot) {
            return res.status(404).json({ success: false, message: 'Depot not found' });
        }

        const driversCount = await User.countDocuments({ depotId, role: 'DRIVER', isActive: true });
        const conductorsCount = await User.countDocuments({ depotId, role: 'CONDUCTOR', isActive: true });
        
        const activeBuses = await Bus.countDocuments({ depotId, status: 'ACTIVE' });
        const maintenanceBuses = await Bus.countDocuments({ depotId, status: 'MAINTENANCE' });
        const totalBuses = await Bus.countDocuments({ depotId });

        // Get trips assigned to this depot's buses for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find buses assigned to this depot
        const depotBuses = await Bus.find({ depotId }).select('_id').lean();
        const busIds = depotBuses.map(b => b._id);

        const scheduledTrips = await Trip.countDocuments({ busId: { $in: busIds }, departureDate: { $gte: today, $lt: tomorrow }, status: 'SCHEDULED' });
        const runningTrips = await Trip.countDocuments({ busId: { $in: busIds }, departureDate: { $gte: today, $lt: tomorrow }, status: { $in: ['OPEN', 'BOARDING', 'DEPARTED'] } });
        const completedTrips = await Trip.countDocuments({ busId: { $in: busIds }, departureDate: { $gte: today, $lt: tomorrow }, status: 'COMPLETED' });
        const cancelledTrips = await Trip.countDocuments({ busId: { $in: busIds }, departureDate: { $gte: today, $lt: tomorrow }, status: 'CANCELLED' });

        res.status(200).json({
            success: true,
            data: {
                depot: {
                    name: depot.depotName,
                    code: depot.depotCode,
                    address: depot.address
                },
                staff: { drivers: driversCount, conductors: conductorsCount },
                fleet: { total: totalBuses, active: activeBuses, maintenance: maintenanceBuses },
                trips: { scheduled: scheduledTrips, running: runningTrips, completed: completedTrips, cancelled: cancelledTrips }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Staff Management
export const getDepotStaff = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const staff = await User.find({ 
            depotId, 
            role: { $in: ['DRIVER', 'CONDUCTOR'] } 
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        next(error);
    }
};

export const addDepotStaff = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const { firstName, lastName, email, phone, role, password, gender, dob, employeeId } = req.body;

        if (!['DRIVER', 'CONDUCTOR'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role for depot staff' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            role,
            password,
            gender,
            dob,
            employeeId,
            depotId, // Force the depot scope
            isActive: true
        });

        await newUser.save();
        const safeUser = newUser.toSafeJSON();
        res.status(201).json({ success: true, message: 'Staff created successfully', data: safeUser });
    } catch (error) {
        next(error);
    }
};

export const updateDepotStaff = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const staffId = req.params.id;
        
        const staff = await User.findOne({ _id: staffId, depotId });
        if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found in your depot' });

        // Extract allowed update fields
        const { firstName, lastName, phone, gender, dob, employeeId, isActive } = req.body;
        
        if (firstName) staff.firstName = firstName;
        if (lastName) staff.lastName = lastName;
        if (phone) staff.phone = phone;
        if (gender) staff.gender = gender;
        if (dob) staff.dob = dob;
        if (employeeId) staff.employeeId = employeeId;
        if (isActive !== undefined) staff.isActive = isActive;
        
        await staff.save();
        res.status(200).json({ success: true, message: 'Staff updated successfully', data: staff.toSafeJSON() });
    } catch (error) {
        next(error);
    }
};

// Fleet Management
export const getDepotFleet = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const buses = await Bus.find({ depotId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: buses });
    } catch (error) {
        next(error);
    }
};

export const updateDepotFleet = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const busId = req.params.id;
        
        const bus = await Bus.findOne({ _id: busId, depotId });
        if (!bus) return res.status(404).json({ success: false, message: 'Bus not found in your depot' });

        // Station masters can only update maintenance status and basic non-identifying info
        const { status, maintenanceHistory } = req.body;
        
        if (status && ['ACTIVE', 'MAINTENANCE', 'RETIRED'].includes(status)) {
            bus.status = status;
        }
        
        await bus.save();
        res.status(200).json({ success: true, message: 'Fleet updated successfully', data: bus });
    } catch (error) {
        next(error);
    }
};

// Trips Operations
export const getDepotTrips = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const buses = await Bus.find({ depotId }).select('_id').lean();
        const busIds = buses.map(b => b._id);

        const trips = await Trip.find({ busId: { $in: busIds } })
            .populate('routeId', 'routeName routeNumber')
            .populate('busId', 'busNumber registrationNumber')
            .populate('conductorId', 'firstName lastName phone')
            .sort({ departureDate: -1 })
            .limit(100);
            
        res.status(200).json({ success: true, data: trips });
    } catch (error) {
        next(error);
    }
};

export const getDepotManifest = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const tripId = req.params.id;
        
        const trip = await Trip.findById(tripId).populate('busId');
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        
        // Verify the trip's bus belongs to this depot
        if (trip.busId.depotId.toString() !== depotId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Trip belongs to another depot' });
        }

        const bookings = await Booking.find({ tripId, bookingStatus: 'CONFIRMED' })
            .populate('passengerId', 'firstName lastName gender age phone')
            .populate('boardingPoint', 'stopName')
            .populate('droppingPoint', 'stopName')
            .sort({ 'seatNumbers.0': 1 });

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

export const updateDepotTrip = async (req, res, next) => {
    try {
        const depotId = req.user.depotId;
        const tripId = req.params.id;
        const { status, conductorId } = req.body;

        const trip = await Trip.findById(tripId).populate('busId');
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        
        if (trip.busId.depotId.toString() !== depotId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Trip belongs to another depot' });
        }

        if (conductorId) {
            const conductor = await User.findOne({ _id: conductorId, depotId, role: 'CONDUCTOR', isActive: true });
            if (!conductor) {
                return res.status(400).json({ success: false, message: 'Invalid conductor assignment' });
            }
            
            // Check for conflicts: conductor assigned to another running trip
            const conflictingTrip = await Trip.findOne({
                _id: { $ne: tripId },
                conductorId,
                status: { $in: ['OPEN', 'BOARDING', 'DEPARTED'] }
            });
            if (conflictingTrip) {
                return res.status(400).json({ success: false, message: 'Conductor is already assigned to an active trip' });
            }
            trip.conductorId = conductorId;
        }

        if (status) {
            const validTransitions = {
                'SCHEDULED': ['OPEN', 'CANCELLED'],
                'OPEN': ['BOARDING', 'CANCELLED'],
                'BOARDING': ['DEPARTED', 'CANCELLED'],
                'DEPARTED': ['COMPLETED', 'CANCELLED'],
                'COMPLETED': [],
                'CANCELLED': []
            };

            if (!validTransitions[trip.status]?.includes(status)) {
                return res.status(400).json({ success: false, message: `Invalid status transition from ${trip.status} to ${status}` });
            }

            if (['OPEN', 'BOARDING', 'DEPARTED'].includes(status)) {
                if (trip.busId.status !== 'ACTIVE') {
                    return res.status(400).json({ success: false, message: `Cannot start trip: Bus is currently ${trip.busId.status}` });
                }
                if (!trip.conductorId) {
                    return res.status(400).json({ success: false, message: 'Cannot start trip without an assigned conductor' });
                }
            }

            trip.status = status;
        }

        await trip.save();
        
        const updatedTrip = await Trip.findById(tripId)
            .populate('routeId', 'routeName routeNumber')
            .populate('busId', 'busNumber registrationNumber')
            .populate('conductorId', 'firstName lastName phone');
            
        res.status(200).json({ success: true, message: 'Trip updated successfully', data: updatedTrip });
    } catch (error) {
        next(error);
    }
};
