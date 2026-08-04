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

import axios from 'axios';

export const getFilteredAndSortedBuses = async ({ selectedBusTypes = [], selectedDepTimes = [], sortBy = 'Relevance', origin = '', destination = '', date = '' }) => {
  let result = [];
  try {
    // Attempt to fetch from backend
    const response = await axios.get('http://localhost:5000/api/buses', {
      params: { origin, destination, date }
    });
    result = response.data.buses || response.data;
  } catch (error) {
    console.warn("Backend not reachable, falling back to mock data.");
    result = [...MOCK_BUSES];
  }

  if (selectedBusTypes.length > 0) {
    result = result.filter(bus => {
      if (selectedBusTypes.includes('AC Sleeper') && bus.type === 'AC Sleeper') return true;
      if (selectedBusTypes.includes('Non-AC Sleeper') && bus.type === 'Non-AC Sleeper') return true;
      if (selectedBusTypes.includes('AC Semi-Sleeper') && bus.type === 'AC Semi-Sleeper') return true;
      if (selectedBusTypes.includes('Seater') && bus.type === 'Non-AC Semi-Sleeper') return true;
      return false;
    });
  }

  if (selectedDepTimes.length > 0) {
    result = result.filter(bus => {
      const hour = parseInt(bus.departure.split(':')[0], 10);
      if (selectedDepTimes.includes('Before 6 AM') && hour < 6) return true;
      if (selectedDepTimes.includes('6 AM to 12 PM') && hour >= 6 && hour < 12) return true;
      if (selectedDepTimes.includes('12 PM to 6 PM') && hour >= 12 && hour < 18) return true;
      if (selectedDepTimes.includes('After 6 PM') && hour >= 18) return true;
      return false;
    });
  }

  if (sortBy === 'Price: Low to High') {
    result.sort((a, b) => a.fare - b.fare);
  } else if (sortBy === 'Departure: Earliest First') {
    result.sort((a, b) => a.departure.localeCompare(b.departure));
  } else if (sortBy === 'Rating: High to Low') {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result;
};

export const generateSeatLayoutData = () => {
  const rows = 6;
  const cols = 5;
  const preBooked = ['0-0', '1-3', '2-4', '3-0', '4-1', '5-3'];
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    for (let c = 0; c < cols; c++) {
      if (c === 2) {
        rowSeats.push({ isAisle: true, key: `aisle-${r}` });
        continue;
      }
      const seatId = `${r}-${c}`;
      const seatLabel = `${String.fromCharCode(65 + r)}${c + 1}`;
      const isBooked = preBooked.includes(seatId);
      rowSeats.push({
        isAisle: false,
        seatId,
        seatLabel,
        isBooked
      });
    }
    grid.push({ rowId: `row-${r}`, seats: rowSeats });
  }
  return grid;
};
