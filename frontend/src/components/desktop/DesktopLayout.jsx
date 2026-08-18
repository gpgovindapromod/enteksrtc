import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useAppLogic } from '../../hooks/useAppLogic';

import DesktopHome from './DesktopHome';
import DesktopSearchResults from './DesktopSearchResults';
import DesktopAuthModal from './DesktopAuthModal';
import DesktopDashboard from './DesktopDashboard';
import DesktopTicketsModal from './DesktopTicketsModal';
import { TRANSLATIONS } from '../../data/mockData';

const DesktopLayout = () => {
  const { theme, toggleTheme } = useTheme();

  const {
    origin, setOrigin,
    destination, setDestination,
    journeyDate, setJourneyDate,
    selectedBus, setSelectedBus,
    selectedSeats, setSelectedSeats,
    isBookingSuccess, setIsBookingSuccess,
    activeBookings
  } = useBookingStore();

  const { language } = useAppStore();
  const { isUserLoggedIn, showLoginModal, setShowLoginModal, setAuthSession } = useAuthStore();
  
  const { handleCheckout, handleCancelBooking } = useAppLogic();

  const [showDesktopTicketsModal, setShowDesktopTicketsModal] = useState(false);
  
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <>
      <Routes>
        <Route path="/" element={<DesktopHome />} />
        
        <Route path="/search" element={
          <DesktopSearchResults
            theme={theme}
            toggleTheme={toggleTheme}
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            journeyDate={journeyDate}
            setJourneyDate={setJourneyDate}
            selectedBus={selectedBus}
            setSelectedBus={setSelectedBus}
            selectedSeats={selectedSeats}
            setSelectedSeats={setSelectedSeats}
            isBookingSuccess={isBookingSuccess}
            setIsBookingSuccess={setIsBookingSuccess}
            handleCheckout={handleCheckout}
            setShowDesktopTicketsModal={setShowDesktopTicketsModal}
            t={t}
            isUserLoggedIn={isUserLoggedIn}
            setShowLoginModal={setShowLoginModal}
          />
        } />

        <Route path="/dashboard" element={
          <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 99999, overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
            <DesktopDashboard theme={theme} toggleTheme={toggleTheme} />
          </div>
        } />
      </Routes>

      <DesktopAuthModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user, token) => setAuthSession({ user, token })}
      />
      <DesktopTicketsModal
        show={showDesktopTicketsModal}
        onClose={() => setShowDesktopTicketsModal(false)}
        activeBookings={activeBookings}
        handleCancelBooking={handleCancelBooking}
      />
    </>
  );
};

export default DesktopLayout;
