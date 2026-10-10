import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useAppLogic } from '../../hooks/useAppLogic';
import { logoutUser } from '../../services/authService';

import DesktopHome from './DesktopHome';
import DesktopSearchResults from './DesktopSearchResults';
import DesktopAuthModal from './DesktopAuthModal';
import DesktopDashboard from './DesktopDashboard';
import DesktopTicketsModal from './DesktopTicketsModal';
import { TRANSLATIONS } from '../../data/mockData';

const DesktopLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const {
    origin, setOrigin,
    destination, setDestination,
    journeyDate, setJourneyDate,
    selectedBus, setSelectedBus,
    selectedSeats, setSelectedSeats,
    passengerDetails, setPassengerDetails,
    isBookingSuccess, setIsBookingSuccess,
    activeBookings
  } = useBookingStore();

  const { language } = useAppStore();
  const { isUserLoggedIn, showLoginModal, setShowLoginModal, setAuthSession, clearAuthSession } = useAuthStore();
  
  const { handleCheckout, handleCancelBooking, isCheckingOut } = useAppLogic();

  const [showDesktopTicketsModal, setShowDesktopTicketsModal] = useState(false);
  
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    try {
      await logoutUser();
    } finally {
      clearAuthSession();
      navigate('/');
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={isUserLoggedIn ? <Navigate to="/dashboard" replace /> : <DesktopHome />} />
        <Route path="/login" element={isUserLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
        <Route path="/register" element={isUserLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
        
        <Route path="/search" element={
          <DesktopSearchResults
            onBack={() => navigate(isUserLoggedIn ? '/dashboard' : '/')}
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
            passengerDetails={passengerDetails}
            setPassengerDetails={setPassengerDetails}
            isBookingSuccess={isBookingSuccess}
            setIsBookingSuccess={setIsBookingSuccess}
            handleCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
            setShowDesktopTicketsModal={setShowDesktopTicketsModal}
            t={t}
            isUserLoggedIn={isUserLoggedIn}
            setShowLoginModal={setShowLoginModal}
          />
        } />

        <Route path="/dashboard" element={
          isUserLoggedIn ? (
            <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 99999, overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
            <DesktopDashboard theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        } />
      </Routes>

      <DesktopAuthModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user, token) => {
          setAuthSession({ user, token });
          navigate('/dashboard');
        }}
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

