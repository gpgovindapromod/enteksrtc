import express from 'express';
import { searchTrips, getSeatAvailability } from '../controllers/trip/tripController.js';

const router = express.Router();

router.get('/search', searchTrips);
router.get('/:tripId/seats', getSeatAvailability);

export default router;
