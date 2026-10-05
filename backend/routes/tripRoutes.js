import express from 'express';
import { searchTrips, getSeatAvailability, updateTripStatus } from '../controllers/trip/tripController.js';
import { getTripInventory, blockSeat, unblockSeat } from '../controllers/trip/adminInventoryController.js';
import { getTripTimetable, updateTripTimetable } from '../controllers/trip/timetableController.js';
import { createRecurringSchedule, getRecurringSchedules, updateRecurringSchedule } from '../controllers/trip/recurringScheduleController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchTrips);
router.get('/:tripId/seats', getSeatAvailability);

router.patch('/:tripId/status', protect, requireRole('ADMIN', 'STATION_MASTER'), updateTripStatus);
router.get('/:tripId/inventory', protect, requireRole('ADMIN', 'STATION_MASTER'), getTripInventory);
router.post('/:tripId/block', protect, requireRole('ADMIN', 'STATION_MASTER'), blockSeat);
router.post('/unblock/:blockBookingId', protect, requireRole('ADMIN', 'STATION_MASTER'), unblockSeat);

router.get('/:tripId/timetable', protect, requireRole('ADMIN', 'STATION_MASTER'), getTripTimetable);
router.put('/:tripId/timetable', protect, requireRole('ADMIN', 'STATION_MASTER'), updateTripTimetable);

router.post('/recurring', protect, requireRole('ADMIN', 'STATION_MASTER'), createRecurringSchedule);
router.get('/recurring', protect, requireRole('ADMIN', 'STATION_MASTER'), getRecurringSchedules);
router.put('/recurring/:scheduleId', protect, requireRole('ADMIN', 'STATION_MASTER'), updateRecurringSchedule);

export default router;
