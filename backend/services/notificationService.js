import Notification from '../database/models/Notification.js';
import { SimulatedEmailProvider } from './notificationProviders/simulatedEmailProvider.js';
import { SimulatedSmsProvider } from './notificationProviders/simulatedSmsProvider.js';
import { SimulatedWhatsAppProvider } from './notificationProviders/simulatedWhatsAppProvider.js';

class NotificationService {
  constructor() {
    this.providers = {
      EMAIL: new SimulatedEmailProvider(),
      SMS: new SimulatedSmsProvider(),
      WHATSAPP: new SimulatedWhatsAppProvider()
    };
  }

  /**
   * Safe dispatcher for single notification. Will not throw exceptions to the caller.
   */
  async dispatchNotification(payload) {
    try {
      const {
        userId,
        bookingId,
        tripId,
        channel = 'IN_APP',
        eventType,
        recipient,
        title,
        subject,
        message,
        metadata
      } = payload;

      const notification = new Notification({
        userId,
        bookingId,
        tripId,
        channel,
        eventType,
        recipient: recipient || (userId ? String(userId) : 'system'),
        title: title || subject || 'Notification',
        subject,
        message,
        status: channel === 'IN_APP' ? 'SENT' : 'PENDING',
        provider: channel === 'IN_APP' ? 'INTERNAL' : 'SIMULATED',
        sentAt: new Date(),
        metadata
      });

      try {
        await notification.save();
      } catch (err) {
        if (err.code === 11000) {
          console.log(`[NotificationService] Duplicate notification blocked (${eventType} / ${channel} for ${recipient || userId})`);
          return null; // Successfully deduplicated
        }
        throw err;
      }

      // If channel is external (EMAIL, SMS, WHATSAPP), dispatch to provider asynchronously
      if (channel !== 'IN_APP') {
        this._processDelivery(notification).catch(err => {
          console.error('[NotificationService] Background delivery error:', err);
        });
      }

      return notification;
    } catch (error) {
      console.error('[NotificationService] Dispatch error:', error.message);
      // Swallow error so we NEVER break the primary business transaction
      return null; 
    }
  }

  /**
   * Dispatch notifications to multiple recipients safely (e.g., all Station Masters for a depot)
   */
  async dispatchBulk(recipients, basePayload) {
    if (!Array.isArray(recipients) || recipients.length === 0) return [];
    const results = [];
    for (const recipient of recipients) {
      const payload = {
        ...basePayload,
        userId: recipient.userId || recipient._id || basePayload.userId,
        recipient: recipient.recipient || recipient.email || recipient.phone || String(recipient.userId || recipient._id)
      };
      const res = await this.dispatchNotification(payload);
      if (res) results.push(res);
    }
    return results;
  }

  /**
   * Paginated list of notifications for a user
   */
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page, 10),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit) || 1
      },
      unreadCount
    };
  }

  /**
   * Get total unread count for a user
   */
  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { modifiedCount: result.modifiedCount };
  }

  async _processDelivery(notification) {
    try {
      notification.status = 'PROCESSING';
      notification.attempts += 1;
      await notification.save();

      const provider = this.providers[notification.channel];
      if (!provider) throw new Error(`Unsupported channel: ${notification.channel}`);

      const result = await provider.send({
        to: notification.recipient,
        subject: notification.subject,
        message: notification.message
      });

      notification.status = result.status;
      notification.provider = result.provider;
      notification.providerMessageId = result.providerMessageId;
      notification.sentAt = new Date();
      await notification.save();

    } catch (error) {
      notification.status = 'FAILED';
      notification.failureReason = error.message;
      await notification.save();
      console.error(`[NotificationService] Delivery failed for ${notification._id}:`, error.message);
    }
  }
}

export const notificationService = new NotificationService();
