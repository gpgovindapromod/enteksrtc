import BookingAudit from '../database/models/BookingAudit.js';

/**
 * Appends a new audit record to the history.
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {string} params.bookingNumber
 * @param {string} params.userId
 * @param {string} params.eventType
 * @param {string} params.previousBookingStatus
 * @param {string} params.newBookingStatus
 * @param {string} params.previousPaymentStatus
 * @param {string} params.newPaymentStatus
 * @param {string} params.source
 * @param {string} [params.reason]
 * @param {Object} [params.metadata]
 * @param {Object} [params.session] Mongoose transaction session
 */
export const auditBooking = async ({
  bookingId,
  bookingNumber,
  userId,
  eventType,
  previousBookingStatus,
  newBookingStatus,
  previousPaymentStatus,
  newPaymentStatus,
  source,
  reason,
  metadata,
  session
}) => {
  try {
    const auditRecord = new BookingAudit({
      bookingId,
      bookingNumber,
      userId,
      eventType,
      previousBookingStatus,
      newBookingStatus,
      previousPaymentStatus,
      newPaymentStatus,
      source,
      reason,
      metadata
    });
    
    if (session) {
      await auditRecord.save({ session });
    } else {
      await auditRecord.save();
    }
  } catch (error) {
    // We log the error but don't fail the primary transaction for an audit failure
    console.error('[AuditUtils] Failed to create audit record:', error.message);
  }
};
