import express from 'express';
import { getAdminDashboardData } from '../controllers/admin/adminController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole(['admin']));

export default router;
