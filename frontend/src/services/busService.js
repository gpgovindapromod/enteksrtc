import apiClient from './apiClient';

/**
 * Dynamically search stops from the database backend.
 * Falls back to an empty list on failure rather than hardcoded mock data.
 */
export const searchStopsApi = async (query = '') => {
  if (!query || query.trim().length < 2) return [];
  try {
    const response = await apiClient.get('/api/stops/search', { params: { q: query.trim() } });
    return (response.data?.stops || []).map(s => s.stopName);
  } catch (error) {
    console.error('Failed to search stops dynamically:', error);
    return [];
  }
};

export const filterCities = async (query) => {
  return await searchStopsApi(query);
};


export const fetchBuses = async ({ origin = '', destination = '', date = '' }, signal) => {
  const trimmedOrigin = (origin || '').trim();
  const trimmedDestination = (destination || '').trim();
  if (!trimmedOrigin || !trimmedDestination || !date) {
    return [];
  }

  try {
    const response = await apiClient.get('/api/trips/search', {
      params: { from: trimmedOrigin, to: trimmedDestination, date },
      signal
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

/**
 * Universally generate dynamic seat layout grids based on the bus's totalCapacity.
 * Supports standard KSRTC 51-seat layout, 24-seat minibuses, 36-seat semi-sleepers,
 * or any custom capacity configured by Admins / Station Masters.
 */
export const generateSeatLayoutData = (seatStateMap = {}, totalCapacity = 51) => {
  const cap = Number(totalCapacity) > 0 ? Number(totalCapacity) : 51;

  // Case 1: Standard full-size 51-seat KSRTC layout (6 rows, 12 cols with doors and 3x2 distribution)
  if (cap >= 48) {
    const rows = 6;
    const cols = 12;
    const grid = [];
    let seatNumberCounter = 1;

    for (let r = 0; r < rows; r++) {
      const rowSeats = [];
      for (let c = 0; c < cols; c++) {
        // Driver column (far left)
        if (c === 0) {
          if (r === 0) {
            rowSeats.push({ isDriver: true, key: `driver` });
          } else {
            rowSeats.push({ isEmpty: true, key: `empty-${r}-${c}` });
          }
          continue;
        }

        // Aisle row (horizontal)
        if (r === 3) {
          rowSeats.push({ isAisle: true, key: `aisle-${c}` });
          continue;
        }

        // Gaps in the bottom block for doors
        if ((r === 4 || r === 5) && (c === 2 || c === 9)) {
          rowSeats.push({ isEmpty: true, key: `door-${r}-${c}` });
          continue;
        }

        // Check if we reached the bus capacity
        if (seatNumberCounter > cap) {
          rowSeats.push({ isEmpty: true, key: `empty-excess-${r}-${c}` });
          continue;
        }

        const seatId = `${r}-${c}`;
        const seatLabel = `${seatNumberCounter++}`;
        const seatInfo = seatStateMap[seatLabel] || { isAvailable: true, status: 'AVAILABLE' };
        const isBooked = !seatInfo.isAvailable;

        rowSeats.push({
          isSeat: true,
          seatId,
          seatLabel,
          isBooked,
          status: seatInfo.status || (isBooked ? 'BOOKED' : 'AVAILABLE')
        });
      }
      grid.push({ rowId: `row-${r}`, seats: rowSeats });
    }
    return grid;
  }

  // Case 2: Dynamic layout for smaller buses (e.g. 24-seat, 30-seat, 36-seat, 40-seat)
  // Standard 2+2 arrangement: Row 0 (window left), Row 1 (aisle left), Row 2 (aisle), Row 3 (aisle right), Row 4 (window right)
  const rows = 5;
  const seatsPerRow = 4; // 2 left, 2 right
  const numColumns = Math.max(6, Math.ceil(cap / seatsPerRow) + 1); // +1 for driver column
  const grid = [];
  let seatNumberCounter = 1;

  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    for (let c = 0; c < numColumns; c++) {
      // Driver column (far left)
      if (c === 0) {
        if (r === 0) {
          rowSeats.push({ isDriver: true, key: `driver` });
        } else {
          rowSeats.push({ isEmpty: true, key: `empty-${r}-${c}` });
        }
        continue;
      }

      // Center Aisle row
      if (r === 2) {
        rowSeats.push({ isAisle: true, key: `aisle-${c}` });
        continue;
      }

      // Check if seats are exhausted
      if (seatNumberCounter > cap) {
        rowSeats.push({ isEmpty: true, key: `empty-${r}-${c}` });
        continue;
      }

      const seatId = `${r}-${c}`;
      const seatLabel = `${seatNumberCounter++}`;
      const seatInfo = seatStateMap[seatLabel] || { isAvailable: true, status: 'AVAILABLE' };
      const isBooked = !seatInfo.isAvailable;

      rowSeats.push({
        isSeat: true,
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
