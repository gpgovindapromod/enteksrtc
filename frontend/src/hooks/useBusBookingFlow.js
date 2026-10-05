import { useState, useEffect } from 'react';
import { getTripSeatAvailability } from '../services/busService';
import { generateSeatLayoutData } from '../services/busService';

export const useBusBookingFlow = ({
  isUserLoggedIn,
  selectedBus,
  setSelectedBus,
  setShowLoginModal,
  seatGridData
}) => {
  const [pendingBusSelection, setPendingBusSelection] = useState(null);
  const [dynamicSeatGridData, setDynamicSeatGridData] = useState(seatGridData || []);

  useEffect(() => {
    if (isUserLoggedIn && pendingBusSelection) {
      setSelectedBus(pendingBusSelection);
      setPendingBusSelection(null);
    }
  }, [isUserLoggedIn, pendingBusSelection, setSelectedBus]);

  useEffect(() => {
    if (selectedBus) {
      getTripSeatAvailability(selectedBus.id, selectedBus.boardingSequence, selectedBus.droppingSequence)
        .then(seats => {
          const preBooked = seats.filter(s => !s.isAvailable).map(s => s.seatNumber);
          setDynamicSeatGridData(generateSeatLayoutData(preBooked));
        })
        .catch(() => {
          setDynamicSeatGridData(generateSeatLayoutData());
        });
    } else {
      setDynamicSeatGridData(seatGridData || generateSeatLayoutData());
    }
  }, [selectedBus, seatGridData]);

  const handleBusSelection = (bus) => {
    if (!isUserLoggedIn) {
      setPendingBusSelection(bus);
      setShowLoginModal(true);
    } else {
      setSelectedBus(bus);
    }
  };

  return {
    dynamicSeatGridData,
    handleBusSelection
  };
};
