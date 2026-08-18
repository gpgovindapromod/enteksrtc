import { useState } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { useNavigate } from 'react-router-dom';

export function useAppLogic() {
  const navigate = useNavigate();
  
  const {
    origin, setOrigin,
    destination, setDestination,
    journeyDate,
    selectedBus, setSelectedBus,
    selectedSeats, setSelectedSeats,
    setIsBookingSuccess,
    addActiveBooking,
    removeActiveBooking
  } = useBookingStore();

  const [searchError, setSearchError] = useState('');

  const handleSearchClick = () => {
    if (!origin || !origin.trim()) { setSearchError("Please enter a departure city."); return; }
    if (!destination || !destination.trim()) { setSearchError("Please enter a destination city."); return; }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) { setSearchError("Origin and destination cannot be the same."); return; }
    if (!journeyDate) { setSearchError("Please select a journey date."); return; }

    const selectedDate = new Date(journeyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setSearchError("Journey date cannot be in the past."); return; }

    setSearchError('');
    setSelectedBus(null);
    setSelectedSeats([]);
    setIsBookingSuccess(false);
    navigate('/search');
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0 || !selectedBus) return;
    const newBooking = {
      id: `KSRTC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      from: origin,
      to: destination,
      date: journeyDate,
      time: selectedBus.departure,
      busType: selectedBus.name,
      seats: selectedSeats,
      price: `₹${(selectedSeats.length * selectedBus.fare).toLocaleString()}`,
      qrCode: `KSRTC-${Math.floor(1000000 + Math.random() * 9000000)}-${origin.substring(0, 3).toUpperCase()}-${destination.substring(0, 3).toUpperCase()}-${journeyDate.replace(/-/g, '')}`
    };
    addActiveBooking(newBooking);
    setIsBookingSuccess(true);
  };

  const handleCancelBooking = (bookingId) => {
    removeActiveBooking(bookingId);
  };

  const handleBookRoute = (from, to) => {
    setOrigin(from);
    setDestination(to);
    alert("Please select a journey date and proceed with your search.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    searchError,
    setSearchError,
    handleSearchClick,
    handleCheckout,
    handleCancelBooking,
    handleBookRoute
  };
}
