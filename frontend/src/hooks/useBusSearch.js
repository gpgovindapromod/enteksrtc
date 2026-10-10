import { useState, useEffect } from 'react';
import { fetchBuses } from '../services/busService';

export const useBusSearch = ({
  initialOrigin,
  initialDestination,
  initialJourneyDate,
  setOrigin,
  setDestination,
  setJourneyDate,
  onModify, // Added for URL syncing
  isSearching = true // Added this for mobile which only searches when isSearching is true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allBuses, setAllBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [availableBusTypes, setAvailableBusTypes] = useState([]);

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

  // Fetch buses once when route/date changes
  useEffect(() => {
    const fetchBusesData = async () => {
      if (!isSearching) return;
      
      setIsLoading(true);
      try {
        const buses = await fetchBuses({
          origin: initialOrigin,
          destination: initialDestination,
          date: initialJourneyDate
        });
        setAllBuses(buses);
        
        // Extract unique bus types from the fetched data
        const uniqueTypes = [...new Set(buses.map(bus => bus.type))].filter(Boolean);
        setAvailableBusTypes(uniqueTypes);
      } catch (error) {
        console.error("Failed to fetch buses", error);
        setAllBuses([]);
        setAvailableBusTypes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusesData();
  }, [isSearching, initialOrigin, initialDestination, initialJourneyDate]);

  // Apply filters and sorting locally whenever filters or allBuses change
  useEffect(() => {
    let result = [...allBuses];

    if (selectedBusTypes.length > 0) {
      result = result.filter(bus => selectedBusTypes.includes(bus.type));
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

    setFilteredBuses(result);
  }, [allBuses, selectedBusTypes, selectedDepTimes, sortBy]);

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
    
    if (onModify) {
      onModify(localOrigin, localDestination, localDate);
    }
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


  return {
    isLoading,
    filteredBuses,
    availableBusTypes,
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
    seatGridData: null  // use useSeatGrid hook instead
  };
};
