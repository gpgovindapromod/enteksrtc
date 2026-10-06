/**
 * useSeatGrid — Universal seat-grid hook
 * ----------------------------------------
 * Single source of truth for fetching real booked seats from the backend
 * and generating the seat layout grid with accurate `isBooked` state.
 *
 * Usage:
 *   const { seatGridData, isLoadingSeats, bookedSeats } = useSeatGrid(selectedBus);
 *
 * When `selectedBus` is null/undefined, returns an empty default grid.
 * When `selectedBus` changes, re-fetches booked seats from:
 *   GET /api/trips/:tripId/seats?boardingSequence=X&droppingSequence=Y
 *
 * Both Desktop and Mobile components call this hook — never duplicate the logic.
 */

import { useState, useEffect } from 'react';
import { getTripSeatAvailability, generateSeatLayoutData } from '../services/busService';

export const useSeatGrid = (selectedBus) => {
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [seatGridData, setSeatGridData] = useState(() => generateSeatLayoutData([]));

  useEffect(() => {
    // Reset grid whenever the selected bus changes
    setBookedSeats([]);
    setSeatGridData(generateSeatLayoutData([]));

    if (!selectedBus) return;

    const tripId = selectedBus.tripId;
    const boardingSequence = selectedBus.boardingSequence;
    const droppingSequence = selectedBus.droppingSequence;

    if (!tripId || boardingSequence == null || droppingSequence == null) {
      // Fall back to empty grid if meta is missing
      setSeatGridData(generateSeatLayoutData([]));
      return;
    }

    let cancelled = false;

    const fetchSeats = async () => {
      setIsLoadingSeats(true);
      try {
        const seats = await getTripSeatAvailability(tripId, boardingSequence, droppingSequence);
        if (cancelled) return;

        // seats is an array of { seatNumber, isAvailable, type, status }
        const seatStateMap = {};
        (seats || []).forEach(s => {
          const label = String(s.seatNumber);
          seatStateMap[label] = { isAvailable: s.isAvailable, status: s.status };
        });

        const taken = (seats || [])
          .filter(s => !s.isAvailable)
          .map(s => String(s.seatNumber));

        setBookedSeats(taken);
        setSeatGridData(generateSeatLayoutData(seatStateMap));
      } catch (err) {
        if (cancelled) return;
        console.error('useSeatGrid: failed to fetch seats', err);
        setSeatGridData(generateSeatLayoutData([]));
      } finally {
        if (!cancelled) setIsLoadingSeats(false);
      }
    };

    fetchSeats();

    return () => { cancelled = true; };
  }, [selectedBus]);

  return { seatGridData, isLoadingSeats, bookedSeats };
};
