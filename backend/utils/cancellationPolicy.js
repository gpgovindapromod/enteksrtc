/**
 * Cancellation Policy Evaluator
 * 
 * Rules (example configurable windows):
 * - > 24 hours before departure: 100% refund (0% fee)
 * - 12 to 24 hours before departure: 75% refund (25% fee)
 * - 2 to 12 hours before departure: 50% refund (50% fee)
 * - < 2 hours before departure or departed: Not eligible for refund (0% refund)
 */

export const evaluateCancellation = (booking, trip) => {
  if (!trip || !trip.departureDate) {
    throw new Error('Trip departure data missing for cancellation evaluation');
  }

  const now = new Date();
  const departureDate = new Date(trip.departureDate);
  
  // Base check: already departed trips cannot be cancelled by passengers
  if (now >= departureDate) {
    return {
      eligible: false,
      refundAmountPaise: 0,
      cancellationFeePaise: booking.farePaise,
      reason: 'Trip has already departed or departure time has passed.'
    };
  }

  const msUntilDeparture = departureDate.getTime() - now.getTime();
  const hoursUntilDeparture = msUntilDeparture / (1000 * 60 * 60);

  let refundPercentage = 0;

  if (hoursUntilDeparture >= 24) {
    refundPercentage = 100;
  } else if (hoursUntilDeparture >= 12) {
    refundPercentage = 75;
  } else if (hoursUntilDeparture >= 2) {
    refundPercentage = 50;
  } else {
    return {
      eligible: false,
      refundAmountPaise: 0,
      cancellationFeePaise: booking.farePaise,
      reason: 'Cancellations are not permitted within 2 hours of departure.'
    };
  }

  // Calculate refund in paise (integers)
  const baseFare = booking.farePaise || (booking.totalFare * 100) || 0;
  const refundAmountPaise = Math.floor((baseFare * refundPercentage) / 100);
  const cancellationFeePaise = baseFare - refundAmountPaise;

  return {
    eligible: true,
    refundAmountPaise,
    cancellationFeePaise,
    reason: `Eligible for ${refundPercentage}% refund (${hoursUntilDeparture.toFixed(1)} hours before departure).`
  };
};
