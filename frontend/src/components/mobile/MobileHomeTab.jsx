import React, { useEffect } from 'react';
import { Bus, Navigation, Clock, CalendarDays, Sun, Moon } from 'lucide-react';
import MobileBookingWidget from './MobileBookingWidget';
import GradualBlur from '../GradualBlur';
import Marquee from '../home/Marquee';

const MobileHomeTab = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  journeyDate,
  setJourneyDate,
  tripType,
  setTripType,
  onSearch,
  onBookRoute,
  t,
  TopRoutesSection,
  DestinationsSection,
  GallerySection,
  TestimonialsSection,
  TopRoutes,
  Destinations,
  GalleryImages,
  Testimonials,
  heroImages,
  currentSlide,
  setCurrentSlide,
  theme,
  toggleTheme,
  isUserLoggedIn,
  setShowLoginModal,
  setShowLiveTracking,
  setShowTimingsModal,
  setActiveMobileTab
}) => {

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages, setCurrentSlide]);

  return (
    <main className={`font-inter ${theme === 'dark' ? 'dark bg-background text-white' : 'bg-background text-slate-900'} min-h-screen overflow-x-hidden`}>
      {/* Mobile Navbar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-6 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-lg">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Bus size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-emerald-500 leading-none text-lg font-outfit">Ente KSRTC</span>
              <span className="text-[10px] uppercase tracking-widest mt-0.5 text-gray-500 dark:text-white/60 font-bold">Premium Journey</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isUserLoggedIn && (
              <button
                className="text-sm font-bold bg-emerald-500 text-slate-950 px-5 py-2 rounded-full shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-transform"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
            )}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-white/80 active:scale-95 transition-transform"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex flex-col pt-24 pb-8 px-6">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="Hero Background"
              className={`w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-1000 scale-105 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-50 dark:to-slate-950"></div>
        </div>

        <div className="relative z-10 text-center animate-fade-in-up mt-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl font-outfit leading-tight mb-4">
            Experience the <br/><span className="text-emerald-500">Journey</span>
          </h1>
          <p className="text-base text-white/80 max-w-sm mx-auto drop-shadow-lg font-medium px-6">
            Premium mobility across Kerala and beyond. Seamless, comfortable, and cinematic travel.
          </p>
        </div>

        <div className="relative z-20 mt-auto">
          <MobileBookingWidget
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            journeyDate={journeyDate}
            setJourneyDate={setJourneyDate}
            tripType={tripType}
            setTripType={setTripType}
            onSearch={onSearch}
            t={t}
          />
        </div>
      </header>

      {/* Quick Services Grid */}
      <div className="px-6 py-8 relative z-20 -mt-12 bg-transparent">
        <h2 className="text-lg font-bold font-outfit mb-4 text-slate-900 dark:text-white">Quick Services</h2>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setShowLiveTracking(true)}
            className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform group"
          >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation size={20} className="text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Track Bus</span>
          </button>
          
          <button 
            onClick={() => setShowTimingsModal(true)}
            className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform group"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={20} className="text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Timings</span>
          </button>

          <button 
            onClick={() => {
              if (isUserLoggedIn) {
                setActiveMobileTab('tickets');
              } else {
                setShowLoginModal(true);
              }
            }}
            className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform group"
          >
            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays size={20} className="text-purple-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Bookings</span>
          </button>
        </div>
      </div>

      {/* Sections Wrapper (to ensure they respect dark mode) */}
      <div className="bg-background pb-20">
        <div id="mobile-routes-section">
          <TopRoutesSection routes={TopRoutes} onBookRoute={onBookRoute} />
        </div>

        <div id="mobile-destinations-section">
          <DestinationsSection destinations={Destinations} />
        </div>

        <div id="mobile-gallery-section">
          <GallerySection images={GalleryImages} />
        </div>

        <div id="mobile-testimonials-section">
          <TestimonialsSection testimonials={Testimonials} />
        </div>

        <div className="mt-12">
          <Marquee />
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 text-white w-full relative z-10 pt-16 pb-10 mt-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col gap-10 mb-12">
              
              {/* Brand Column */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Bus size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-2xl text-white font-black font-outfit tracking-tight">Ente KSRTC</span>
                    <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Premium Journey</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-8">
                  Experience the pinnacle of mobility across God's Own Country. We connect communities, empower travelers, and deliver cinematic journeys with unparalleled comfort and safety.
                </p>
              </div>

              {/* Links Columns */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Explore
                  </h3>
                  <ul className="space-y-4">
                    <li><a className="text-sm text-white/60 hover:text-emerald-500 transition-colors" href="#">Routes</a></li>
                    <li><a className="text-sm text-white/60 hover:text-emerald-500 transition-colors" href="#">Fleet</a></li>
                    <li><a className="text-sm text-white/60 hover:text-emerald-500 transition-colors" href="#">Offers</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Support
                  </h3>
                  <ul className="space-y-4">
                    <li><a className="text-sm text-white/60 hover:text-emerald-500 transition-colors" href="#">Help Center</a></li>
                    <li><a className="text-sm text-white/60 hover:text-emerald-500 transition-colors" href="#">Contact</a></li>
                    <li><a className="text-sm text-white/60 hover:text-emerald-500 transition-colors" href="#">Grievances</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-4">
              <div className="text-xs text-gray-400 font-medium text-center">
                &copy; {new Date().getFullYear()} Kerala State Road Transport Corporation.<br/>All rights reserved.
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400 font-medium mt-2">
                <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-emerald-500 transition-colors">Accessibility</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default MobileHomeTab;
