import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
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
import { Search, Compass, Ticket, User, Bus, MapPin, Calendar, Clock, CreditCard, LayoutDashboard, Users, TrendingUp, AlertTriangle, Route as RouteIcon, Star, Settings, LifeBuoy, Coffee } from 'lucide-react';
import { GalleryImages, TopRoutes, Destinations, Testimonials, TRANSLATIONS } from '../../data/mockData';
import { ROLES, normalizeRole } from '../../utils/roleUtils';

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
    passengerDetails, setPassengerDetails,
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

  const [searchParams] = useSearchParams();
  const activeDashboardTab = searchParams.get('tab');

  const {
    isUserLoggedIn, showLoginModal, setShowLoginModal, setAuthSession, clearAuthSession, user
  } = useAuthStore();
  
  const activeRole = normalizeRole(user?.role);

  const getSidebarLinks = () => {
    switch (activeRole) {
      case ROLES.ADMIN:
        return [
          { id: 'Overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'Fleet', icon: Bus, label: 'Fleet' },
          { id: 'Stations', icon: MapPin, label: 'Stations' },
          { id: 'Users', icon: Users, label: 'Users' },
          { id: 'Revenue', icon: TrendingUp, label: 'Revenue' }
        ];
      case ROLES.STATION_MASTER:
        return [
          { id: 'Tracking', icon: LayoutDashboard, label: 'Tracking' },
          { id: 'Schedules', icon: Clock, label: 'Schedules' },
          { id: 'Platforms', icon: MapPin, label: 'Platforms' },
          { id: 'Alerts', icon: AlertTriangle, label: 'Alerts' }
        ];
      case ROLES.CONDUCTOR:
        return [
          { id: 'My Route', icon: RouteIcon, label: 'My Route' },
          { id: 'Manifest', icon: Users, label: 'Manifest' },
          { id: 'Scan Tickets', icon: Ticket, label: 'Scan Tickets' }
        ];
      case ROLES.DRIVER:
        return [
          { id: 'My Route', icon: RouteIcon, label: 'My Route' },
          { id: 'Schedule', icon: Clock, label: 'Schedule' },
          { id: 'Vehicle Alerts', icon: AlertTriangle, label: 'Alerts' }
        ];
      case ROLES.SUPPORT:
        return [
          { id: 'Tickets', icon: LayoutDashboard, label: 'Tickets' },
          { id: 'Refunds', icon: CreditCard, label: 'Refunds' },
          { id: 'Feedback', icon: Star, label: 'Feedback' }
        ];
      default:
        return [
          { id: 'Home', icon: Search, label: 'Search' },
          { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'Tickets', icon: Ticket, label: 'Bookings' },
          { id: 'Profile', icon: User, label: 'Profile' }
        ];
    }
  };

  const { searchError, handleSearchClick, handleCheckout, handleCancelBooking, handleBookRoute, isCheckingOut } = useAppLogic();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Derive active tab from location for the bottom navbar styling
  const activeMobileTab = activeDashboardTab || (location.pathname === '/profile' || location.pathname === '/dashboard' ? 'Dashboard' : location.pathname === '/tickets' ? 'Tickets' : 'Home');
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
        <Route path="/" element={isUserLoggedIn ? <Navigate to="/profile" replace /> : (
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
                handleSearchClick();
              }}
              searchError={searchError}
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
        ) } />
        <Route path="/login" element={isUserLoggedIn ? <Navigate to="/profile" replace /> : <Navigate to="/" replace />} />
        <Route path="/register" element={isUserLoggedIn ? <Navigate to="/profile" replace /> : <Navigate to="/" replace />} />

        <Route path="/tickets" element={
          isUserLoggedIn ? (
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
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/profile" element={
          isUserLoggedIn ? (
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
                  activeDashboardTab={activeDashboardTab}
                  t={t}
                />
              </main>
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        {/* Map /dashboard to profile on mobile for URL consistency */}
        <Route path="/dashboard" element={
          isUserLoggedIn ? (
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
                  activeDashboardTab={activeDashboardTab}
                  t={t}
                />
              </main>
            </div>
          ) : (
            <Navigate to="/" replace />
          )
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
        passengerDetails={passengerDetails}
        setPassengerDetails={setPassengerDetails}
        isBookingSuccess={isBookingSuccess}
        setIsBookingSuccess={setIsBookingSuccess}
        handleCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
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
        {!isUserLoggedIn ? (
          <>
            <button
              className={`navbar-tab-item ${activeMobileTab === 'Home' ? 'active' : ''}`}
              onClick={() => {
                navigate('/');
                setSelectedBus(null);
              }}
            >
              <Search size={22} />
              <span>Search</span>
            </button>
            <button
              className="navbar-tab-item"
              onClick={() => {
                navigate('/');
                setSelectedBus(null);
                setTimeout(() => document.getElementById('mobile-routes-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
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
                setTimeout(() => document.getElementById('mobile-gallery-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
            >
              <Compass size={22} style={{ transform: 'rotate(45deg)' }} />
              <span>Gallery</span>
            </button>
          </>
        ) : (
          getSidebarLinks().map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                className={`navbar-tab-item ${activeMobileTab === link.id ? 'active' : ''}`}
                onClick={() => {
                  if (activeRole === ROLES.PASSENGER) {
                    if (link.id === 'Home') navigate('/');
                    else if (link.id === 'Tickets') navigate('/tickets');
                    else if (link.id === 'Dashboard' || link.id === 'Profile') navigate('/profile');
                  } else {
                    navigate(`/profile?tab=${link.id}`);
                  }
                }}
              >
                <Icon size={22} />
                <span>{link.label}</span>
              </button>
            );
          })
        )}
      </nav>
    </div>
  );
};

export default MobileLayout;

