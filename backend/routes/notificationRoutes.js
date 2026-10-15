import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notification/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);

export default router;
