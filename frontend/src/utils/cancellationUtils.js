/**
 * Universal Ticket Cancellation Policy & Eligibility Helper
 *
 * Single Source of Truth for cancellation constraints across Desktop and Mobile:
 * 1. Checks if trip has started / departed.
 * 2. Checks existing 2-hour departure cutoff window.
 * 3. Provides human-readable restriction messages for disabled buttons.
 */

export const getCancellationEligibility = (ticket) => {
  if (!ticket) return { canCancel: false, tripStarted: false, message: '' };

  const bookingStatus = (ticket.bookingStatus || '').toUpperCase();
  if (bookingStatus === 'CANCELLED') {
    return { canCancel: false, tripStarted: false, message: 'Ticket is already cancelled.' };
  }

  // Derive departure timestamp
  const departureDateVal = ticket.date || ticket.tripId?.departureDate;
  const tripStatus = (ticket.tripStatus || ticket.tripId?.status || '').toUpperCase();

  const now = new Date();
  let departureDate = null;

  if (departureDateVal) {
    const parsed = new Date(departureDateVal);
    if (!isNaN(parsed.getTime())) {
      departureDate = parsed;
    }
  }

  // If time string exists (e.g. "21:30" or "10:00 PM") and date is a separate date string
  if (departureDate && ticket.time && typeof ticket.time === 'string') {
    const timeStr = ticket.time.trim();
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridian = match[3] ? match[3].toUpperCase() : null;

      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;

      // Only adjust if date was just midnight
      if (departureDate.getHours() === 0 && departureDate.getMinutes() === 0) {
        departureDate = new Date(departureDate);
        departureDate.setHours(hours, minutes, 0, 0);
      }
    }
  }

  // 1. Trip started check: Remove cancellation completely
  const isTripStarted =
    tripStatus === 'DEPARTED' ||
    tripStatus === 'COMPLETED' ||
    (departureDate && now >= departureDate);

  if (isTripStarted) {
    return {
      canCancel: false,
      tripStarted: true,
      message: 'Trip has already started. Cancellation is no longer available.'
    };
  }

  // 2. Cancellation time restriction check:
  // Policy rule: Cancellations are permitted until 2 hours prior to departure.
  if (departureDate) {
    const msUntilDeparture = departureDate.getTime() - now.getTime();
    const hoursUntilDeparture = msUntilDeparture / (1000 * 60 * 60);

    if (hoursUntilDeparture < 2) {
      return {
        canCancel: false,
        tripStarted: false,
        message: 'Cancellation is allowed only within the permitted cancellation period (up to 2 hours before departure).'
      };
    }
  }

  return {
    canCancel: true,
    tripStarted: false,
    message: ''
  };
};
