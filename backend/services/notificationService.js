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
   * Safe asynchronous dispatcher. Will not throw exceptions back to the caller.
   */
  async dispatchNotification(payload) {
    try {
      const {
        userId,
        bookingId,
        tripId,
        channel,
        eventType,
        recipient,
        subject,
        message,
        metadata
      } = payload;

      // 1. Idempotency Check using atomic insert
      // Mongoose sparse unique index on { bookingId, eventType, channel } handles this natively
      const notification = new Notification({
        userId,
        bookingId,
        tripId,
        channel,
        eventType,
        recipient,
        subject,
        message,
        status: 'PENDING',
        metadata
      });

      try {
        await notification.save();
      } catch (err) {
        if (err.code === 11000) {
          console.log(`[NotificationService] Duplicate notification blocked (${eventType} / ${channel} for booking ${bookingId})`);
          return null; // Successfully deduplicated
        }
        throw err;
      }

      // 2. Dispatch to provider asynchronously
      // We do not await this so it doesn't block the request if the provider is slow
      this._processDelivery(notification).catch(err => {
        console.error('[NotificationService] Background delivery error:', err);
      });

      return notification;
    } catch (error) {
      console.error('[NotificationService] Dispatch error:', error.message);
      // We swallow the error so we NEVER break the primary business transaction
      return null; 
    }
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
