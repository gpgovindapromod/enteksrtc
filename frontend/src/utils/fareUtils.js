export const calculateDynamicFare = (selectedSeats, selectedBusFare, passengerDetails) => {
  if (!selectedSeats || selectedSeats.length === 0 || !selectedBusFare) return 0;
  
  // If only one seat is selected, child fare rules do NOT apply (and <12 is blocked anyway).
  // So it's simply the full base fare.
  if (selectedSeats.length === 1) {
    return selectedBusFare;
  }
  
  // Multiple seats: apply age-based rules
  let totalFare = 0;
  
  const safeDetails = passengerDetails || {};
  
  for (const seatNo of selectedSeats) {
    const details = safeDetails[seatNo];
    if (!details || !details.age) {
      // If age isn't entered yet, assume adult fare to be safe
      totalFare += selectedBusFare;
      continue;
    }
    
    const age = parseInt(details.age, 10);
    if (isNaN(age)) {
      totalFare += selectedBusFare;
    } else if (age <= 6) {
      totalFare += 0; // Free
    } else if (age > 6 && age < 12) {
      totalFare += (selectedBusFare * 0.5); // 50% fare
    } else {
      totalFare += selectedBusFare; // Full fare
    }
  }
  
  return totalFare;
};
