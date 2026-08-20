import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useTheme } from '../../context/ThemeContext';
import { logoutUser } from '../../services/authService';
import { useAppLogic } from '../../hooks/useAppLogic';

import MobileAppHeader from './MobileAppHeader';
import MobileLiveTracking from './MobileLiveTracking';
import MobileTimings from './MobileTimings';
import MobileSearchResults from './MobileSearchResults';
import MobileTicketsTab from './MobileTicketsTab';
import MobileDashboard from './MobileDashboard';
import MobileHomeTab from './MobileHomeTab';
import MobileLoginModal from './MobileLoginModal';
import { Search, Compass, Ticket, User } from 'lucide-react';
import { GalleryImages, TopRoutes, Destinations, Testimonials, TRANSLATIONS } from '../../data/mockData';

import TopRoutesSection from '../home/TopRoutesSection';
import DestinationsSection from '../home/DestinationsSection';
import GallerySection from '../home/GallerySection';
import TestimonialsSection from '../home/TestimonialsSection';

const MobileLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const {
    origin, setOrigin,
    destination, setDestination,
    journeyDate, setJourneyDate,
    tripType, setTripType,
    selectedBus, setSelectedBus,
    selectedSeats, setSelectedSeats,
    isBookingSuccess, setIsBookingSuccess,
    activeBookings
  } = useBookingStore();

  const { 
    language, setLanguage,
    hasActivatedWebApp, setHasActivatedWebApp,
    showLiveTracking, setShowLiveTracking,
    trackingStep, setTrackingStep,
    showNotifications, setShowNotifications,
    showTimingsModal, setShowTimingsModal,
    expandedTicketId, setExpandedTicketId,
    faqExpanded, setFaqExpanded
  } = useAppStore();

  const {
    isUserLoggedIn, showLoginModal, setShowLoginModal, setAuthSession, clearAuthSession
  } = useAuthStore();
  
  const { handleSearchClick, handleCheckout, handleCancelBooking, handleBookRoute } = useAppLogic();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Derive active tab from location for the bottom navbar styling
  const activeMobileTab = location.pathname === '/profile' || location.pathname === '/dashboard' ? 'profile' : location.pathname === '/tickets' ? 'tickets' : 'home';
  const isSearching = location.pathname === '/search';
  
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const heroImages = [
    './assets/images/premium_hero_1.webp',
    './assets/images/premium_hero_2.webp',
    './assets/images/premium_hero_3.webp',
    './assets/images/premium_hero_4.webp'
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      clearAuthSession();
      navigate('/');
    }
  };

  return (
    <div className="mobile-app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      <Routes>
        <Route path="/" element={
          <div className="tab-view-fadein" style={{ paddingBottom: '120px', overflowY: 'auto', flex: 1 }}>
            <MobileHomeTab
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              journeyDate={journeyDate}
              setJourneyDate={setJourneyDate}
              tripType={tripType}
              setTripType={setTripType}
              onSearch={() => {
                setSelectedSeats([]);
                navigate('/search');
              }}
              onBookRoute={handleBookRoute}
              t={t}
              TopRoutesSection={TopRoutesSection}
              DestinationsSection={DestinationsSection}
              GallerySection={GallerySection}
              TestimonialsSection={TestimonialsSection}
              TopRoutes={TopRoutes}
              Destinations={Destinations}
              GalleryImages={GalleryImages}
              Testimonials={Testimonials}
              heroImages={heroImages}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
              showMobileView={true}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              theme={theme}
              toggleTheme={toggleTheme}
              isUserLoggedIn={isUserLoggedIn}
              setShowLoginModal={setShowLoginModal}
              setShowLiveTracking={setShowLiveTracking}
              setShowTimingsModal={setShowTimingsModal}
              setActiveMobileTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
            />
          </div>
        } />

        <Route path="/tickets" element={
          <div className="tab-view-container" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            <MobileAppHeader
              theme={theme}
              toggleTheme={toggleTheme}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              setActiveMobileTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
              isUserLoggedIn={isUserLoggedIn}
              setShowLoginModal={setShowLoginModal}
            />
            <main className="mobile-webapp-content" style={{ flex: 1, paddingTop: '64px' }}>
              <MobileTicketsTab
                activeBookings={activeBookings}
                expandedTicketId={expandedTicketId}
                setExpandedTicketId={setExpandedTicketId}
                handleCancelBooking={handleCancelBooking}
                setActiveMobileTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
                setIsSearching={(val) => { if(!val) navigate('/'); else navigate('/search'); }}
                t={t}
              />
            </main>
          </div>
        } />

        <Route path="/profile" element={
          <div className="tab-view-container" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            <MobileAppHeader
              theme={theme}
              toggleTheme={toggleTheme}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              setActiveMobileTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
              isUserLoggedIn={isUserLoggedIn}
              setShowLoginModal={setShowLoginModal}
            />
            <main className="mobile-webapp-content" style={{ flex: 1, paddingTop: '64px' }}>
              <MobileDashboard
                theme={theme}
                toggleTheme={toggleTheme}
                language={language}
                setLanguage={setLanguage}
                hasActivatedWebApp={hasActivatedWebApp}
                setHasActivatedWebApp={setHasActivatedWebApp}
                faqExpanded={faqExpanded}
                setFaqExpanded={setFaqExpanded}
                onLogout={handleLogout}
                t={t}
              />
            </main>
          </div>
        } />
        
        {/* Map /dashboard to profile on mobile for URL consistency */}
        <Route path="/dashboard" element={
          <div className="tab-view-container" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            <MobileAppHeader
              theme={theme}
              toggleTheme={toggleTheme}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              setActiveMobileTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
              isUserLoggedIn={isUserLoggedIn}
              setShowLoginModal={setShowLoginModal}
            />
            <main className="mobile-webapp-content" style={{ flex: 1, paddingTop: '64px' }}>
              <MobileDashboard
                theme={theme}
                toggleTheme={toggleTheme}
                language={language}
                setLanguage={setLanguage}
                hasActivatedWebApp={hasActivatedWebApp}
                setHasActivatedWebApp={setHasActivatedWebApp}
                faqExpanded={faqExpanded}
                setFaqExpanded={setFaqExpanded}
                onLogout={handleLogout}
                t={t}
              />
            </main>
          </div>
        } />
      </Routes>

      {/* Dynamic Modals / Bottom Sheets */}
      <MobileLiveTracking
        showLiveTracking={showLiveTracking}
        setShowLiveTracking={setShowLiveTracking}
        trackingStep={trackingStep}
        setTrackingStep={setTrackingStep}
        t={t}
      />
      <MobileTimings
        showTimingsModal={showTimingsModal}
        setShowTimingsModal={setShowTimingsModal}
        t={t}
      />
      <MobileSearchResults
        isSearching={isSearching}
        setIsSearching={(val) => { if(!val) navigate('/'); else navigate('/search'); }}
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
        setHasActivatedWebApp={setHasActivatedWebApp}
        setActiveMobileTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
        t={t}
        isUserLoggedIn={isUserLoggedIn}
        setShowLoginModal={setShowLoginModal}
      />
      <MobileLoginModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        onLoginSuccess={(user, token) => {
          setAuthSession({ user, token });
          navigate('/profile');
        }}
      />

      {/* Sticky Persistent Mobile Bottom Navbar */}
      <nav className="mobile-bottom-navbar">
        <button
          className={`navbar-tab-item ${activeMobileTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            navigate('/');
            setSelectedBus(null);
          }}
        >
          <Search size={22} />
          <span>Home</span>
        </button>
        <button
          className="navbar-tab-item"
          onClick={() => {
            navigate('/');
            setSelectedBus(null);
            setTimeout(() => {
              document.getElementById('mobile-routes-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        >
          <Compass size={22} />
          <span>Routes</span>
        </button>
        <button
          className="navbar-tab-item"
          onClick={() => {
            navigate('/');
            setSelectedBus(null);
            setTimeout(() => {
              document.getElementById('mobile-gallery-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        >
          <Compass size={22} style={{ transform: 'rotate(45deg)' }} />
          <span>Gallery</span>
        </button>

        {isUserLoggedIn && (
          <button
            className={`navbar-tab-item ${activeMobileTab === 'tickets' ? 'active' : ''}`}
            onClick={() => navigate('/tickets')}
          >
            <Ticket size={22} />
            <span>Tickets</span>
          </button>
        )}
        {isUserLoggedIn && (
          <button
            className={`navbar-tab-item ${activeMobileTab === 'profile' ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            <User size={22} />
            <span>Dashboard</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default MobileLayout;
