import express from 'express';
import { getAdminDashboardData, getAdminBookings, getAdminActivity, getAdminFleet, getAdminUsers, addAdminFleet, editAdminFleet, deleteAdminFleet, addAdminUser, editAdminUser, deleteAdminUser, toggleUserStatus, addAdminStation, editAdminStation, deleteAdminStation, toggleStationStatus, getAdminRevenue, processAdminRefund, getAdminAnalytics } from '../controllers/admin/adminController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole(['ADMIN', 'admin']));

router.get('/bookings', getAdminBookings);
router.get('/activity', getAdminActivity);
router.get('/fleet', getAdminFleet);
router.post('/fleet', addAdminFleet);
router.put('/fleet/:id', editAdminFleet);
router.delete('/fleet/:id', deleteAdminFleet);
router.get('/users', getAdminUsers);
router.post('/users', addAdminUser);
router.put('/users/:id', editAdminUser);
router.delete('/users/:id', deleteAdminUser);
router.patch('/users/:id/status', toggleUserStatus);
router.post('/stations', addAdminStation);
router.put('/stations/:id', editAdminStation);
router.delete('/stations/:id', deleteAdminStation);
router.patch('/stations/:id/status', toggleStationStatus);

router.get('/revenue', getAdminRevenue);
router.post('/revenue/:id/refund', processAdminRefund);
router.get('/analytics', getAdminAnalytics);

export default router;
