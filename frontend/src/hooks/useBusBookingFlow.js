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
          const seatStateMap = {};
          (seats || []).forEach(s => {
            const label = String(s.seatNumber || s.seatNo);
            seatStateMap[label] = { isAvailable: s.isAvailable, status: s.status };
          });
          setDynamicSeatGridData(generateSeatLayoutData(seatStateMap));
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
