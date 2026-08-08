import { useState, useEffect } from 'react';
import { getFilteredAndSortedBuses, generateSeatLayoutData } from '../services/busService';

export const useBusSearch = ({
  initialOrigin,
  initialDestination,
  initialJourneyDate,
  setOrigin,
  setDestination,
  setJourneyDate,
  isSearching = true // Added this for mobile which only searches when isSearching is true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filteredBuses, setFilteredBuses] = useState([]);

  // Filter States
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [selectedDepTimes, setSelectedDepTimes] = useState([]);
  const [sortBy, setSortBy] = useState('Relevance');
  
  // Local modification states (for desktop top bar & mobile bottom sheet)
  const [localOrigin, setLocalOrigin] = useState(initialOrigin);
  const [localDestination, setLocalDestination] = useState(initialDestination);
  const [localDate, setLocalDate] = useState(initialJourneyDate);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Keep local states synced with parent if they change externally
    setLocalOrigin(initialOrigin);
    setLocalDestination(initialDestination);
    setLocalDate(initialJourneyDate);
  }, [initialOrigin, initialDestination, initialJourneyDate]);

  useEffect(() => {
    const fetchBuses = async () => {
      if (!isSearching) return;
      
      setIsLoading(true);
      try {
        const buses = await getFilteredAndSortedBuses({
          selectedBusTypes,
          selectedDepTimes,
          sortBy,
          origin: initialOrigin,
          destination: initialDestination,
          date: initialJourneyDate
        });
        setFilteredBuses(buses);
      } catch (error) {
        console.error("Failed to fetch buses", error);
        setFilteredBuses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuses();
  }, [isSearching, selectedBusTypes, selectedDepTimes, sortBy, initialOrigin, initialDestination, initialJourneyDate]);

  const handleSwap = () => {
    const temp = localOrigin;
    setLocalOrigin(localDestination);
    setLocalDestination(temp);
  };

  const handleModify = () => {
    if (!localOrigin.trim()) { setErrorMsg("Please enter a departure city."); return; }
    if (!localDestination.trim()) { setErrorMsg("Please enter a destination city."); return; }
    if (localOrigin.trim().toLowerCase() === localDestination.trim().toLowerCase()) { setErrorMsg("Origin and destination cannot be the same."); return; }
    if (!localDate) { setErrorMsg("Please select a journey date."); return; }

    const selectedDate = new Date(localDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setErrorMsg("Journey date cannot be in the past."); return; }

    setErrorMsg('');
    setOrigin(localOrigin);
    setDestination(localDestination);
    setJourneyDate(localDate);
  };

  const handleCheckboxChange = (setter, stateList, value) => {
    if (stateList.includes(value)) {
      setter(stateList.filter(item => item !== value));
    } else {
      setter([...stateList, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedBusTypes([]);
    setSelectedDepTimes([]);
    setSortBy('Relevance');
  };

  const seatGridData = generateSeatLayoutData();

  return {
    isLoading,
    filteredBuses,
    selectedBusTypes,
    setSelectedBusTypes,
    selectedDepTimes,
    setSelectedDepTimes,
    sortBy,
    setSortBy,
    localOrigin,
    setLocalOrigin,
    localDestination,
    setLocalDestination,
    localDate,
    setLocalDate,
    errorMsg,
    handleSwap,
    handleModify,
    handleCheckboxChange,
    clearAllFilters,
    seatGridData
  };
};
