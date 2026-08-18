import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useTheme } from '../../context/ThemeContext';
import { logoutUser } from '../../services/authService';
import { useAppLogic } from '../../hooks/useAppLogic';

import GallerySection from '../home/GallerySection';
import TestimonialsSection from '../home/TestimonialsSection';
import Marquee from '../home/Marquee';
import { GalleryImages, TopRoutes, Testimonials } from '../../data/mockData';

const DesktopHome = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const {
    origin, setOrigin,
    destination, setDestination,
    journeyDate, setJourneyDate
  } = useBookingStore();

  const { isScrolled, setIsScrolled } = useAppStore();
  const { isUserLoggedIn, setShowLoginModal, clearAuthSession } = useAuthStore();
  
  const { searchError, handleSearchClick, handleBookRoute } = useAppLogic();

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    './assets/images/premium_hero_1.webp',
    './assets/images/premium_hero_2.webp',
    './assets/images/premium_hero_3.webp',
    './assets/images/premium_hero_4.webp'
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsScrolled]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      clearAuthSession();
      navigate('/');
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 ${isScrolled ? "py-2" : "py-4"}`} id="navbar">
        <div className={`flex justify-between items-center px-6 h-20 mx-auto transition-all duration-500 ease-in-out ${isScrolled ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-lg rounded-full max-w-4xl" : "w-full max-w-container-max"}`} id="navbar-container">
          <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform duration-300">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold text-primary leading-none">Ente KSRTC</span>
              <span className={`text-xs uppercase tracking-widest mt-1 drop-shadow-md ${isScrolled ? 'text-gray-500 dark:text-white/60' : 'text-white/80'}`}>Premium Journey</span>
            </div>
          </div>
          <div className="hidden lg:flex justify-center gap-8 flex-1 px-4">
            <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#">Home</a>
            <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#">Routes</a>
            <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#">Contact</a>
            <button onClick={() => navigate('/dashboard')} className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}>Experience Dashboard</button>
          </div>
          <div className="flex items-center justify-end gap-5">
            <a className={`hidden lg:block drop-shadow-md text-sm hover:text-primary transition-colors duration-300 font-medium ${isScrolled ? 'text-gray-600 dark:text-white/70' : 'text-white/80'}`} href="#">Kerala Tourism</a>
            {isUserLoggedIn ? (
              <button className="text-sm font-medium text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-primary/10" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="text-sm font-medium bg-emerald-700 text-white px-4 py-1.5 rounded-full shadow-lg shadow-emerald-700/20 hover:brightness-110 active:scale-95 transition-all" onClick={() => setShowLoginModal(true)}>Login</button>
            )}
            <div className={`cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-300 hover:text-primary drop-shadow-md ${isScrolled ? 'text-gray-700 dark:text-white/80' : 'text-white/80'}`}>
              <span className="material-symbols-outlined" onClick={toggleTheme}>{theme === "dark" ? "light_mode" : "dark_mode"}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col justify-center items-center pt-20">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-gutter animate-fade-in-up mt-[-10vh]">
          <h1 className="font-display-hero text-display-hero text-white tracking-tight drop-shadow-2xl">Experience the Journey</h1>
          <p className="font-body-lg text-body-lg text-white/80 mt-6 max-w-2xl mx-auto drop-shadow-lg">Premium mobility across Kerala and beyond. Seamless, comfortable, and cinematic travel.</p>
        </div>
        <div className="absolute bottom-8 w-full max-w-6xl px-edge-margin-mobile md:px-0 z-20 left-1/2 -translate-x-1/2">
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-[24px] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-white/10 pb-2">
              <button className="text-primary font-bold border-b-2 border-primary pb-2 tracking-wide transition-colors text-sm">Book Bus Ticket</button>
              <button className="text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white pb-2 tracking-wide transition-colors text-sm">Link Ticket Booking</button>
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-stretch md:items-end">
              <div className="flex-1 border-b-2 border-gray-200 dark:border-white/20 pb-3 focus-within:border-primary transition-colors px-0 md:pr-4">
                <label htmlFor="origin-input" className="block text-[10px] text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">From</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400" style={{ fontSize: '18px' }}>location_on</span>
                  <input
                    id="origin-input"
                    className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 p-0"
                    placeholder="Departure City"
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>

              <div className="hidden md:flex items-end pb-3 px-2">
                <button
                  onClick={() => { const temp = origin; setOrigin(destination); setDestination(temp); }}
                  className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-white/20 rounded-full p-2 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary transition-all group flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-gray-500 dark:text-white/60 group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>swap_horiz</span>
                </button>
              </div>

              <div className="flex-1 border-b-2 border-gray-200 dark:border-white/20 pb-3 focus-within:border-primary transition-colors px-0 md:px-4">
                <label htmlFor="destination-input" className="block text-[10px] text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">To</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400" style={{ fontSize: '18px' }}>flag</span>
                  <input
                    id="destination-input"
                    className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 p-0"
                    placeholder="Destination City"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-gray-200 dark:bg-white/10 mx-4 mb-3"></div>

              <div className="flex-1 border-b-2 border-gray-200 dark:border-white/20 pb-3 focus-within:border-primary transition-colors px-0 md:pl-4">
                <label htmlFor="date-input" className="block text-[10px] text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">Date</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400" style={{ fontSize: '18px' }}>calendar_month</span>
                  <input
                    id="date-input"
                    className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none p-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                  />
                </div>
              </div>

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

      {/* Main Content Area */}
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

        <section className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop py-stack-xl mb-stack-xl">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold mb-stack-lg text-gray-900 dark:text-white">Popular Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter h-auto md:h-[600px]">
            <div className="relative rounded-xl overflow-hidden group cursor-pointer md:col-span-2 md:row-span-2 h-[400px] md:h-auto border border-white/10 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/route_munnar.webp')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-stack-lg left-stack-lg">
                <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mb-2 drop-shadow-lg">Munnar</h3>
                <p className="text-white/70 font-body-md text-body-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">The Emerald Hills of Kerala</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-auto border border-white/10 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/dest_kochi.webp')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-stack-md left-stack-md">
                <h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Kochi</h3>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-auto border border-white/10 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/dest_alleppey.webp')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-stack-md left-stack-md">
                <h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Alleppey</h3>
              </div>
            </div>
          </div>
        </section>

        <GallerySection images={GalleryImages} />
        <TestimonialsSection testimonials={Testimonials} />
        <div className="mt-20"><Marquee /></div>
      </main>

      <footer className="bg-slate-900 text-white w-full relative z-10 pt-20 pb-10 mt-20 border-t border-white/10">
        <div className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
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
            </div>
            <div className="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Explore</h3>
                <ul className="space-y-4">
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Routes</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Fleet</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default DesktopHome;
