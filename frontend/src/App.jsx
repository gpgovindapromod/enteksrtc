import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useBookingStore } from './store/useBookingStore';
import { useAppStore } from './store/useAppStore';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Bus,
  ArrowRightLeft,
  Calendar,
  MapPin,
  User,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CalendarDays,
  Menu,
  X,
  Quote,
  Phone,
  ChevronDown,
  Sun,
  Moon,
  Ticket,
  Compass,
  Settings,
  ChevronRight,
  Bell,
  Shield,
  Info,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Share2,
  Heart,
  Search
} from 'lucide-react';
import GradualBlur from './components/GradualBlur';
import Masonry from './components/Masonry';
import BorderGlow from './components/BorderGlow';
import MobileBookingWidget from './components/mobile/MobileBookingWidget';
import MobileAppHeader from './components/mobile/MobileAppHeader';
import MobileLiveTracking from './components/mobile/MobileLiveTracking';
import MobileTimings from './components/mobile/MobileTimings';
import MobileSearchResults from './components/mobile/MobileSearchResults';
import MobileTicketsTab from './components/mobile/MobileTicketsTab';
import MobileDashboard from './components/mobile/MobileDashboard';
import MobileHomeTab from './components/mobile/MobileHomeTab';
import MobileLoginModal from './components/mobile/MobileLoginModal';
import DesktopSearchResults from './components/desktop/DesktopSearchResults';
import DesktopAuthModal from './components/desktop/DesktopAuthModal';
import DesktopDashboard from './components/desktop/DesktopDashboard';


import { GalleryImages, TopRoutes, Destinations, Testimonials, TRANSLATIONS } from './data/mockData';
import TopRoutesSection from './components/home/TopRoutesSection';
import DestinationsSection from './components/home/DestinationsSection';
import GallerySection from './components/home/GallerySection';
import TestimonialsSection from './components/home/TestimonialsSection';
import Marquee from './components/home/Marquee';
import { useTheme } from './context/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Derived state from routes
  const activeMobileTab = location.pathname === '/profile' ? 'profile' : location.pathname === '/tickets' ? 'tickets' : 'home';
  const isSearching = location.pathname === '/search';
  const showDesktopSearch = location.pathname === '/search';
  const showDashboard = location.pathname === '/dashboard';

  const [isLoading, setIsLoading] = useState(true);
    const { 
    origin, setOrigin, destination, setDestination, journeyDate, setJourneyDate, 
    tripType, setTripType, selectedBus, setSelectedBus, selectedSeats, setSelectedSeats, 
    isBookingSuccess, setIsBookingSuccess, activeBookings, addActiveBooking, removeActiveBooking
  } = useBookingStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mobile WebApp States
    const { 
    isMobile, setIsMobile, forceMobilePreview, setForceMobilePreview, 
    language, setLanguage, hasActivatedWebApp, setHasActivatedWebApp, 
    isScrolled, setIsScrolled, showLiveTracking, setShowLiveTracking, 
    trackingStep, setTrackingStep, showNotifications, setShowNotifications, 
    showTimingsModal, setShowTimingsModal, expandedTicketId, setExpandedTicketId, 
    faqExpanded, setFaqExpanded 
  } = useAppStore();
    const { isUserLoggedIn, showLoginModal, setIsUserLoggedIn, setShowLoginModal } = useAuthStore();
  

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderMobileBookingWidget = () => (
    <MobileBookingWidget
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
        setHasActivatedWebApp(true);
        navigate('/search');
      }}
      t={t}
    />
  );

  // Search, Selection & Checkout States
  
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

  
  const [showDesktopTicketsModal, setShowDesktopTicketsModal] = useState(false);

  // Profile accordion state
  
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Screen size resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroImages = [
    './assets/images/premium_hero_1.webp',
    './assets/images/premium_hero_2.webp',
    './assets/images/premium_hero_3.webp',
    './assets/images/premium_hero_4.webp'
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearTimeout(interval);
  }, [isLoading]);

  // Handle tracking step interval
  useEffect(() => {
    if (showLiveTracking) {
      const interval = setInterval(() => {
        setTrackingStep((prev) => (prev + 1) % 6);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showLiveTracking]);

  const handleBookRoute = (from, to) => {
    setOrigin(from);
    setDestination(to);
    alert("Please select a journey date and proceed with your search.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bus seat grid builder helper
  const renderSeatGrid = () => {
    const rows = 6;
    const cols = 5;
    const preBooked = ['0-0', '1-3', '2-4', '3-0', '4-1', '5-3'];
    const seatLayout = [];

    for (let r = 0; r < rows; r++) {
      const rowSeats = [];
      for (let c = 0; c < cols; c++) {
        if (c === 2) {
          rowSeats.push(<div key={`aisle-${r}`} className="seat-aisle"></div>);
          continue;
        }
        const seatId = `${r}-${c}`;
        const seatLabel = `${String.fromCharCode(65 + r)}${c + 1}`;
        const isBooked = preBooked.includes(seatId);
        const isSelected = selectedSeats.includes(seatLabel);

        let seatClass = "seat-item";
        if (isBooked) seatClass += " booked";
        else if (isSelected) seatClass += " selected";

        rowSeats.push(
          <button
            key={seatId}
            disabled={isBooked}
            className={seatClass}
            onClick={() => {
              if (isSelected) {
                setSelectedSeats(selectedSeats.filter(s => s !== seatLabel));
              } else {
                setSelectedSeats([...selectedSeats, seatLabel]);
              }
            }}
          >
            {seatLabel}
          </button>
        );
      }
      seatLayout.push(<div key={`row-${r}`} className="seat-row">{rowSeats}</div>);
    }
    return seatLayout;
  };
  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
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

  if (isLoading) {
    return (
      <div className="splash-screen">
        <div className="loader-container">
          <Bus size={64} className="bus-loader" color="var(--primary)" />
          <div className="loading-text">Loading Ente KSRTC...</div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  const showMobileView = isMobile || forceMobilePreview;



  // Local helper: Entire Website Replica Layout content (reused in desktop and mobile active home tab)
  const renderWebsiteReplicaContent = () => {
    if (showDashboard) {
      return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 99999, overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
          <button onClick={() => navigate('/')} className="fixed bottom-6 right-6 z-[60] bg-white text-emerald-500 px-4 py-2 rounded-xl font-bold shadow-xl border border-emerald-500 hover:scale-105 active:scale-95 transition-all">Back to App</button>
          <DesktopDashboard theme={theme} toggleTheme={toggleTheme} />
        </div>
      );
    }
    if (showDesktopSearch && !showMobileView) {
      return (
        <>
          <DesktopSearchResults
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() => navigate('/')}
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
        </>
      );
    }

    return (
      <>
        {/* Navbar */}

        {/*  TopAppBar  */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 ${isScrolled ? "py-2" : "py-4"}`} id="navbar">
          <div className={`flex justify-between items-center px-6 h-20 mx-auto transition-all duration-500 ease-in-out ${isScrolled ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-lg rounded-full max-w-4xl" : "w-full max-w-container-max"}`} id="navbar-container">
            {/*  Brand (Left)  */}
            <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform duration-300 w-1/4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md font-bold text-primary leading-none">Ente KSRTC</span>
                <span className={`text-xs uppercase tracking-widest mt-1 drop-shadow-md ${isScrolled ? 'text-gray-500 dark:text-white/60' : 'text-white/80'}`}>Premium Journey</span>
              </div>
            </div>
            {/*  Center Navigation Links  */}
            <div className="hidden md:flex justify-center gap-8 w-2/4">
              <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#">Home</a>
              <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#">Routes</a>
              <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#">Contact</a>
              <button onClick={() => navigate('/dashboard')} className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}>Experience Dashboard</button>
            </div>
            {/*  Right Actions  */}
            <div className="flex items-center justify-end gap-6 w-1/4">
              <a className={`hidden md:block drop-shadow-md text-sm hover:text-primary transition-colors duration-300 font-medium ${isScrolled ? 'text-gray-600 dark:text-white/70' : 'text-white/80'}`} href="#">Kerala Tourism</a>
              {/*  Theme Toggle  */}

              {isUserLoggedIn ? (
                <button className="text-sm font-medium text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-primary/10" onClick={() => setIsUserLoggedIn(false)}>Logout</button>
              ) : (
                <button className="text-sm font-medium bg-emerald-700 text-white px-4 py-1.5 rounded-full shadow-lg shadow-emerald-700/20 hover:brightness-110 active:scale-95 transition-all" onClick={() => setShowLoginModal(true)}>Login</button>
              )}
              <div className={`cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-300 hover:text-primary drop-shadow-md ${isScrolled ? 'text-gray-700 dark:text-white/80' : 'text-white/80'}`}>

                <span className="material-symbols-outlined" onClick={toggleTheme}>{theme === "dark" ? "light_mode" : "dark_mode"}</span>
              </div>
            </div>
          </div>
        </nav>

        {/*  Hero Section  */}
        <header className="relative min-h-screen flex flex-col justify-center items-center pt-20">
          {/*  Background Image  */}
          <div className="absolute inset-0 z-0 overflow-hidden">

            {heroImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Hero Background"
                className={`w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-1000 scale-105 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                fetchpriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
              />
            ))}

            {/*  Gradient Overlay for readability  */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"></div>
          </div>
          <div className="relative z-10 text-center px-gutter animate-fade-in-up mt-[-10vh]">
            <h1 className="font-display-hero text-display-hero text-white tracking-tight drop-shadow-2xl">Experience the Journey</h1>
            <p className="font-body-lg text-body-lg text-white/80 mt-6 max-w-2xl mx-auto drop-shadow-lg">Premium mobility across Kerala and beyond. Seamless, comfortable, and cinematic travel.</p>
          </div>
          {/*  Floating Booking Widget (Horizontal Desktop)  */}
          <div className="absolute bottom-8 w-full max-w-6xl px-edge-margin-mobile md:px-0 z-20 left-1/2 -translate-x-1/2">
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-[24px] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              {/*  Tabs  */}
              <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-white/10 pb-2">
                <button className="text-primary font-bold border-b-2 border-primary pb-2 tracking-wide transition-colors text-sm">Book Bus Ticket</button>
                <button className="text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white pb-2 tracking-wide transition-colors text-sm">Link Ticket Booking</button>
              </div>
              {/*  Horizontal Form  */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-stretch md:items-end">

                {/* FROM Field */}
                <div className="flex-1 border-b-2 border-gray-200 dark:border-white/20 pb-3 focus-within:border-primary transition-colors px-0 md:pr-4">
                  <label htmlFor="origin-input" className="block text-[10px] text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">From</label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400" style={{ fontSize: '18px' }}>location_on</span>
                    <input
                      id="origin-input"
                      aria-label="Departure City"
                      className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 p-0"
                      placeholder="Departure City"
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                </div>

                {/* Swap Button - inline between fields */}
                <div className="hidden md:flex items-end pb-3 px-2">
                  <button
                    onClick={() => { const temp = origin; setOrigin(destination); setDestination(temp); }}
                    className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-white/20 rounded-full p-2 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary transition-all group flex-shrink-0"
                    title="Swap origin and destination"
                    aria-label="Swap origin and destination"
                  >
                    <span className="material-symbols-outlined text-gray-500 dark:text-white/60 group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>swap_horiz</span>
                  </button>
                </div>

                {/* TO Field */}
                <div className="flex-1 border-b-2 border-gray-200 dark:border-white/20 pb-3 focus-within:border-primary transition-colors px-0 md:px-4">
                  <label htmlFor="destination-input" className="block text-[10px] text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">To</label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400" style={{ fontSize: '18px' }}>flag</span>
                    <input
                      id="destination-input"
                      aria-label="Destination City"
                      className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 p-0"
                      placeholder="Destination City"
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-gray-200 dark:bg-white/10 mx-4 mb-3"></div>

                {/* DATE Field */}
                <div className="flex-1 border-b-2 border-gray-200 dark:border-white/20 pb-3 focus-within:border-primary transition-colors px-0 md:pl-4">
                  <label htmlFor="date-input" className="block text-[10px] text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">Date</label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400" style={{ fontSize: '18px' }}>calendar_month</span>
                    <input
                      id="date-input"
                      aria-label="Journey Date"
                      className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none p-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      type="date"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Search Button */}
                {/* Search Button */}
                <div className="md:pl-4 mt-4 md:mt-0 flex-shrink-0 relative">
                  <button
                    onClick={handleSearchClick}
                    className="bg-emerald-700 text-white h-12 md:h-14 px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg shadow-emerald-700/30 group w-full md:w-auto"
                  >
                    <span>Search</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '20px' }}>arrow_forward</span>
                  </button>
                </div>

              </div>

              {searchError && (
                <div className="text-red-500 font-bold text-sm mt-3 animate-fade-in-up">
                  {searchError}
                </div>
              )}

            </div>
          </div>
        </header>

        {/*  Main Content Area  */}
        <main className="pt-32 md:pt-28 bg-background transition-colors duration-300">

          <section className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop py-stack-xl">
            <div className="flex justify-between items-end mb-stack-lg">
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-gray-900 dark:text-white">Top Routes</h2>
              <a className="text-primary hover:brightness-110 flex items-center gap-1 transition-colors" href="#">View All <span className="material-symbols-outlined text-sm">chevron_right</span></a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {TopRoutes.map((route, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 flex flex-col shadow-sm">
                  <div className="h-40 w-full overflow-hidden relative">
                    <img src={route.img} alt={`${route.from} to ${route.to}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 text-white text-xs font-bold px-2.5 py-1 bg-primary/90 rounded-md shadow-md backdrop-blur-sm">
                      {route.duration}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col">
                        <span className="font-headline-md text-body-lg font-bold text-gray-900 dark:text-white">{route.from}</span>
                      </div>
                      <span className="material-symbols-outlined text-primary/70 group-hover:text-primary transition-colors">arrow_right_alt</span>
                      <div className="flex flex-col text-right">
                        <span className="font-headline-md text-body-lg font-bold text-gray-900 dark:text-white">{route.to}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                      <div className="flex flex-col">
                        <span className="font-label-caps text-[10px] text-gray-500 dark:text-white/50 uppercase tracking-wider mb-1">Starting from</span>
                        <span className="font-headline-md text-headline-md text-primary font-bold">{route.price}</span>
                      </div>
                      <button
                        className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-sm text-sm font-bold active:scale-95"
                        onClick={(e) => { e.preventDefault(); handleBookRoute(route.from, route.to); }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/*  Popular Destinations Grid  */}
          <section className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop py-stack-xl mb-stack-xl">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold mb-stack-lg text-gray-900 dark:text-white">Popular Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter h-auto md:h-[600px]">
              {/*  Munnar (Large Feature)  */}
              <div className="relative rounded-xl overflow-hidden group cursor-pointer md:col-span-2 md:row-span-2 h-[400px] md:h-auto border border-white/10 shadow-lg">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/route_munnar.webp')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-stack-lg left-stack-lg">
                  <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mb-2 drop-shadow-lg">Munnar</h3>
                  <p className="text-white/70 font-body-md text-body-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">The Emerald Hills of Kerala</p>
                </div>
              </div>
              {/*  Kochi  */}
              <div className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-auto border border-white/10 shadow-lg">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/dest_kochi.webp')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-stack-md left-stack-md">
                  <h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Kochi</h3>
                </div>
              </div>
              {/*  Alleppey  */}
              <div className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-auto border border-white/10 shadow-lg">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/dest_alleppey.webp')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-stack-md left-stack-md">
                  <h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Alleppey</h3>
                </div>
              </div>
            </div>
          </section>

          {/* Desktop Gallery & Testimonials (reusing mobile components for now or just adding them) */}
          <GallerySection images={GalleryImages} />
          <TestimonialsSection testimonials={Testimonials} />
          
          <div className="mt-20">
            <Marquee />
          </div>

        </main>
        {/*  Footer  */}
        <footer className="bg-slate-900 text-white w-full relative z-10 pt-20 pb-10 mt-20 border-t border-white/10">
          <div className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

              {/* Brand Column */}
              <div className="col-span-1 md:col-span-4 pr-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-2xl text-white font-black tracking-tight">Ente KSRTC</span>
                    <span className="text-xs text-primary uppercase tracking-widest font-bold">Premium Journey</span>
                  </div>
                </div>
                <p className="text-white/80 font-body-md text-sm leading-relaxed mb-8">
                  Experience the pinnacle of mobility across God's Own Country. We connect communities, empower travelers, and deliver cinematic journeys with unparalleled comfort and safety.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 shadow-lg">
                    <span className="material-symbols-outlined text-sm">public</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 shadow-lg">
                    <span className="material-symbols-outlined text-sm">share</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 shadow-lg">
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </a>
                </div>
              </div>

              {/* Links Columns */}
              <div className="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span> Explore
                  </h3>
                  <ul className="space-y-4">
                    <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Routes</a></li>
                    <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Fleet</a></li>
                    <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Offers</a></li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span> Support
                  </h3>
                  <ul className="space-y-4">
                    <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Help Center</a></li>
                    <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Contact</a></li>
                    <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Grievances</a></li>
                  </ul>
                </div>

                <div className="col-span-2 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors duration-500"></div>
                  <h3 className="font-headline-md text-lg font-bold text-white mb-2 relative z-10">Get the App</h3>
                  <p className="text-xs text-white/60 mb-6 relative z-10">Book tickets instantly from your pocket.</p>
                  <div className="flex flex-col gap-3 relative z-10">
                    <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black py-2 px-4 rounded-xl transition-all text-sm font-bold border border-white/20">
                      <span className="material-symbols-outlined text-lg">shop</span> Play Store
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black py-2 px-4 rounded-xl transition-all text-sm font-bold border border-white/20">
                      <span className="material-symbols-outlined text-lg">apple</span> App Store
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-white/70 font-medium">
                &copy; {new Date().getFullYear()} Kerala State Road Transport Corporation. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-xs text-white/70 font-medium">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Accessibility</a>
              </div>
            </div>
          </div>
        </footer>


      </>
    );
  };

  // Main Render Strategy

  const desktopContent = (
      <>
        {renderWebsiteReplicaContent()}
        <DesktopAuthModal
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => setIsUserLoggedIn(true)}
        />
        <DesktopTicketsModal
          show={showDesktopTicketsModal}
          onClose={() => setShowDesktopTicketsModal(false)}
          activeBookings={activeBookings}
          handleCancelBooking={handleCancelBooking}
        />
      </>
  );

  // Mobile WebApp Layout (showMobileView is true)
  const mobileContent = (
    <div className="mobile-app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>


      {/* Dynamic Active Tab View Render */}
      {activeMobileTab === 'home' && (
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
            showMobileView={showMobileView}
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
      )}

      {activeMobileTab === 'tickets' && (
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
      )}

      {activeMobileTab === 'profile' && (
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
              onLogout={() => {
                setIsUserLoggedIn(false);
                navigate('/');
              }}
              t={t}
            />
          </main>
        </div>
      )}

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
        onLoginSuccess={() => {
          setIsUserLoggedIn(true);
        }}
      />

      {/* Sticky Persistent Mobile Bottom Navbar */}
      <nav className="mobile-bottom-navbar">
        <button
          className={`navbar-tab-item ${activeMobileTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            navigate('/');
            /* Handled by route */
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
            /* Handled by route */
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
            /* Handled by route */
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

  return (
    <Routes>
      <Route path="*" element={!showMobileView ? desktopContent : mobileContent} />
    </Routes>
  );
}

const DesktopTicketsModal = ({ show, onClose, activeBookings, handleCancelBooking }) => {
  if (!show) return null;
  return (
    <div className="desktop-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="desktop-modal-content" style={{
        backgroundColor: 'var(--white)',
        color: 'var(--dark)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '650px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Boarding Passes</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {activeBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No Active Tickets Found</p>
            <p style={{ fontSize: '0.9rem' }}>You can book new tickets from the home screen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeBookings.map((ticket) => (
              <div key={ticket.id} style={{
                border: '1px solid var(--gray-light)',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: 'var(--light)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--dark)' }}>{ticket.from} → {ticket.to}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{ticket.date} • {ticket.time}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{ticket.busType}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{ticket.price}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Seats: {ticket.seats.join(', ')}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--gray-light)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>Ready for Boarding</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this ticket?')) {
                        handleCancelBooking(ticket.id);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancel Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

// End of App.jsx
