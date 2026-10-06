// Universal Single Source of Truth for Bus Data, Search & Filtering Logic

export const CITIES = [
  'Bangalore', 'Trivandrum', 'Kochi', 'Calicut', 'Thrissur', 
  'Tirunelveli', 'Chennai', 'Madurai', 'Kochi City Ride', 
  'Kodakara (401)', 'Kodenchery', 'Kodungallur (73)', 
  'Kollam (2)', 'Kollengode', 'Kollur'
];

export const filterCities = (query) => {
  if (!query) return CITIES;
  return CITIES.filter(city => city.toLowerCase().includes(query.toLowerCase()));
};

export const MOCK_BUSES = [
  { id: 1, name: 'K-Swift Premium AC Sleeper (2+1)', brand: 'K-SWIFT', type: 'AC Sleeper', departure: '18:30', arrival: '08:45', duration: '14h 15m', fare: 1450, rating: 4.8 },
  { id: 2, name: 'Swift Deluxe Air Bus (2+2)', brand: 'K-SWIFT', type: 'AC Semi-Sleeper', departure: '06:00', arrival: '20:30', duration: '14h 30m', fare: 950, rating: 4.5 },
  { id: 3, name: 'Minnal Express (Non-AC Sleeper)', brand: 'KSRTC MINNAL', type: 'Non-AC Sleeper', departure: '20:00', arrival: '09:15', duration: '13h 15m', fare: 880, rating: 4.2 },
  { id: 4, name: 'KSRTC Super Fast (2+3)', brand: 'KSRTC', type: 'Non-AC Semi-Sleeper', departure: '22:15', arrival: '13:00', duration: '14h 45m', fare: 720, rating: 3.9 }
];

import apiClient from './apiClient';

export const fetchBuses = async ({ origin = '', destination = '', date = '' }) => {
  try {
    const response = await apiClient.get('/api/trips/search', {
      params: { from: origin, to: destination, date }
    });
    
    return (response.data.trips || []).map(tripData => {
      return {
        id: tripData.tripId,
        tripId: tripData.tripId,
        boardingStopId: tripData.boardingPoint?.stop?._id,
        droppingStopId: tripData.droppingPoint?.stop?._id,
        tripDetails: tripData,
        name: tripData.bus.busType,
        brand: tripData.bus.busNumber,
        type: tripData.bus.category || tripData.bus.busType,
        totalSeats: tripData.bus.totalSeats,
        availableSeats: tripData.bus.availableSeats,
        departure: new Date(tripData.boardingPoint.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        arrival: new Date(tripData.droppingPoint.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: 'N/A', 
        fare: tripData.fare,
        rating: 4.5,
        boardingSequence: tripData.boardingPoint.sequence,
        droppingSequence: tripData.droppingPoint.sequence
      };
    });
  } catch (error) {
    console.error("Backend fetch failed", error);
    return [];
  }
};

export const generateSeatLayoutData = (seatStateMap = {}) => {
  const rows = 6;
  const cols = 5;
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    for (let c = 0; c < cols; c++) {
      if (c === 2) {
        rowSeats.push({ isAisle: true, key: `aisle-${r}` });
        continue;
      }
      const seatId = `${r}-${c}`;
      // In real scenario, label is just 1, 2, 3.. or A1, B1
      const seatLabel = `${(r * 4) + (c > 2 ? c : c + 1)}`;
      
      const seatInfo = seatStateMap[seatLabel] || { isAvailable: true, status: 'AVAILABLE' };
      const isBooked = !seatInfo.isAvailable;

      rowSeats.push({
        isAisle: false,
        seatId,
        seatLabel,
        isBooked,
        status: seatInfo.status || (isBooked ? 'BOOKED' : 'AVAILABLE')
      });
    }
    grid.push({ rowId: `row-${r}`, seats: rowSeats });
  }
  return grid;
};

export const getTripSeatAvailability = async (tripId, boardingSequence, droppingSequence) => {
  try {
    const response = await apiClient.get(`/api/trips/${tripId}/seats`, {
      params: { boardingSequence, droppingSequence, _t: Date.now() }
    });
    return response.data.seats;
  } catch (error) {
    console.error("Failed to fetch seats", error);
    return [];
  }
};
