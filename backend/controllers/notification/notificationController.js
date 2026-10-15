import { notificationService } from '../../services/notificationService.js';

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const data = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
