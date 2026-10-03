import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  origin: '',
  destination: '',
  journeyDate: new Date().toISOString().split('T')[0],
  tripType: 'one-way',
  selectedBus: null,
  selectedSeats: [],
  passengerDetails: {},
  activeBookings: [
    {
      id: 'KSRTC-9481023',
      from: 'Trivandrum',
      to: 'Bangalore',
      date: '2026-08-05',
      time: '18:30',
      busType: 'K-Swift Premium AC Sleeper',
      seats: ['S5', 'S6'],
      price: '₹2,900',
      qrCode: 'KSRTC-9481023-TVM-BLR-050826'
    }
  ],
  isBookingSuccess: false,
  
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setJourneyDate: (journeyDate) => set({ journeyDate }),
  setTripType: (tripType) => set({ tripType }),
  setSelectedBus: (selectedBus) => set({ selectedBus }),
  setSelectedSeats: (selectedSeats) => set({ selectedSeats }),
  setPassengerDetails: (passengerDetails) => set({ passengerDetails }),
  setIsBookingSuccess: (isBookingSuccess) => set({ isBookingSuccess }),
  
  addActiveBooking: (booking) => set((state) => ({ activeBookings: [booking, ...state.activeBookings] })),
  setActiveBookings: (bookings) => set({ activeBookings: bookings }),
  removeActiveBooking: (bookingId) => set((state) => ({ activeBookings: state.activeBookings.filter(b => b.id !== bookingId) })),
}));
