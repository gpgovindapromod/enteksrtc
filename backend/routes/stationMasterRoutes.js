import express from 'express';
import { protect, requireRole, checkDepotAssignment } from '../middleware/authMiddleware.js';
import {
    getStationMasterDashboard,
    getDepotStaff,
    addDepotStaff,
    updateDepotStaff,
    getDepotFleet,
    updateDepotFleet,
    getDepotTrips,
    getDepotManifest,
    updateDepotTrip
} from '../controllers/stationMaster/stationMasterController.js';

const router = express.Router();

// All routes require authentication and STATION_MASTER role
router.use(protect);
router.use(requireRole(['STATION_MASTER', 'station_master']));
router.use(checkDepotAssignment); // Custom middleware to ensure req.user.depotId exists

// Dashboard
router.get('/dashboard', getStationMasterDashboard);

// Staff Management
router.get('/staff', getDepotStaff);
router.post('/staff', addDepotStaff);
router.put('/staff/:id', updateDepotStaff);

// Fleet Management
router.get('/fleet', getDepotFleet);
router.put('/fleet/:id', updateDepotFleet);

// Trips and Operations
router.get('/trips', getDepotTrips);
router.put('/trips/:id', updateDepotTrip);
router.get('/trips/:id/manifest', getDepotManifest);

export default router;
