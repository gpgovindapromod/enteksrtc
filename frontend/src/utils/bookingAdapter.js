export const normalizeBooking = (b) => {
  if (!b) return null;
  return {
    ...b,
    id: b.bookingNumber || b._id,
    _id: b._id,
    tripId: b.tripId || null,
    totalFare: (b.totalFare || b.farePaise) || 0,
    bookingStatus: b.bookingStatus || 'Confirmed',
    seats: b.seats ? b.seats.map(s => s.seatNo) : [],
    passengers: b.seats || [],
    qrCode: b.bookingNumber || b._id,
    
    // Safely extract boarding and dropping stops whether they are strings, IDs, or populated objects
    boardingStopName: typeof b.boardingStop === 'object' ? (b.boardingStop?.stopName || 'Source') : (b.boardingStop || 'Source'),
    droppingStopName: typeof b.droppingStop === 'object' ? (b.droppingStop?.stopName || 'Destination') : (b.droppingStop || 'Destination'),
    
    // Safely extract dates
    date: b.tripId?.departureDate || b.date,
    
    // Financials
    refundAmount: b.refundAmountPaise ? (b.refundAmountPaise / 100) : 0,
    cancellationFee: b.cancellationFeePaise ? (b.cancellationFeePaise / 100) : 0,

    // Bus Info
    busNumber: b.tripId?.busId?.busNumber || 'Unknown Bus',
    busType: b.tripId?.busId?.busType || 'Standard',
    
    // Route Info
    routeNumber: b.tripId?.routeId?.routeNumber || 'Unknown Route'
  };
};
