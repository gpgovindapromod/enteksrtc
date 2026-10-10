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
import StopSearchAutocomplete from '../shared/StopSearchAutocomplete';
import ScrollReveal from '../shared/ScrollReveal';
import TechText from '../common/TechText';

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
            <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#routes">Routes</a>
            <a className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} href="#">Contact</a>
          </div>
          <div className="flex items-center justify-end gap-5">
            <a className={`hidden lg:block drop-shadow-md text-sm hover:text-primary transition-colors duration-300 font-medium ${isScrolled ? 'text-gray-600 dark:text-white/70' : 'text-white/80'}`} href="#">Kerala Tourism</a>
            {isUserLoggedIn ? (
              <>
                <button className="text-sm font-medium bg-emerald-700 text-white px-4 py-1.5 rounded-full shadow-lg shadow-emerald-700/20 hover:brightness-110 active:scale-95 transition-all" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="text-sm font-medium text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-primary/10" onClick={handleLogout}>Logout</button>
              </>
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
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
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
          {/* Enhanced overlay for better text readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-slate-900/90"></div>
          {/* Radial gradient focusing on center text */}
          <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-black/50 to-transparent"></div>
        </div>
        <div className="relative z-20 text-center px-gutter animate-fade-in-up mt-[-15vh] w-full flex flex-col items-center">
          <div className="w-full max-w-5xl h-[120px] md:h-[200px] relative mb-4">
            <TechText
              text="Experience the Journey"
              fontFamily="Outfit, sans-serif"
              fontWeight={900}
              fontSize={120}
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={15}
              color="#ffffff"
              accentColor="#ffffff"
            />
          </div>

        </div>
        <div className="absolute bottom-12 w-full max-w-6xl px-edge-margin-mobile md:px-0 z-30 left-1/2 -translate-x-1/2">
          {/* Premium Glassmorphism Search Box */}
          <div className="bg-white/10 dark:bg-slate-950/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
            <div className="flex gap-8 mb-6 border-b border-white/20 pb-2">
              <button className="text-emerald-400 font-bold border-b-2 border-emerald-400 pb-2 tracking-wide transition-colors text-sm">Book Bus Ticket</button>
              <button className="text-white/50 hover:text-white pb-2 tracking-wide transition-colors text-sm">Link Ticket Booking</button>
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-stretch md:items-end">
              <div className="flex-1 border-b-2 border-white/20 pb-3 focus-within:border-emerald-400 transition-colors px-0 md:pr-4">
                <label htmlFor="origin-input" className="block text-[10px] text-white/70 uppercase tracking-widest mb-2 font-bold">From</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/50" style={{ fontSize: '18px' }}>location_on</span>
                  <StopSearchAutocomplete
                    value={origin}
                    onChange={(name) => setOrigin(name)}
                    placeholder="Departure City"
                    className="bg-transparent border-none w-full text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-white/40 p-0"
                  />
                </div>
              </div>

              <div className="hidden md:flex items-end pb-3 px-2">
                <button
                  onClick={() => { const temp = origin; setOrigin(destination); setDestination(temp); }}
                  className="bg-white/10 border border-white/20 rounded-full p-2 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all group flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-white/60 group-hover:text-emerald-400 transition-colors" style={{ fontSize: '18px' }}>swap_horiz</span>
                </button>
              </div>

              <div className="flex-1 border-b-2 border-white/20 pb-3 focus-within:border-emerald-400 transition-colors px-0 md:px-4">
                <label htmlFor="destination-input" className="block text-[10px] text-white/70 uppercase tracking-widest mb-2 font-bold">To</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/50" style={{ fontSize: '18px' }}>flag</span>
                  <StopSearchAutocomplete
                    value={destination}
                    onChange={(name) => setDestination(name)}
                    placeholder="Destination City"
                    className="bg-transparent border-none w-full text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-white/40 p-0"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-white/20 mx-4 mb-3"></div>

              <div className="flex-1 border-b-2 border-white/20 pb-3 focus-within:border-emerald-400 transition-colors px-0 md:pl-4">
                <label htmlFor="date-input" className="block text-[10px] text-white/70 uppercase tracking-widest mb-2 font-bold">Date</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/50" style={{ fontSize: '18px' }}>calendar_month</span>
                  <input
                    id="date-input"
                    className="bg-transparent border-none w-full text-white text-base font-medium focus:ring-0 focus:outline-none p-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
        <section id="routes" className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop py-stack-xl">
          <ScrollReveal animation="fade-up">
            <div className="flex justify-between items-end mb-stack-lg">
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-gray-900 dark:text-white">Top Routes</h2>
              <a className="text-primary hover:brightness-110 flex items-center gap-1 transition-colors" href="#">View All <span className="material-symbols-outlined text-sm">chevron_right</span></a>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {TopRoutes.map((route, idx) => (
              <ScrollReveal key={idx} animation="fade-up" delay={idx * 100} className="flex h-full">
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 flex flex-col shadow-sm w-full">
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
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop py-stack-xl mb-stack-xl">
          <ScrollReveal animation="fade-up">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold mb-stack-lg text-gray-900 dark:text-white">Popular Destinations</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter h-auto md:h-[600px]">
            <ScrollReveal animation="fade-right" delay={100} className="relative rounded-xl overflow-hidden group cursor-pointer md:col-span-2 md:row-span-2 h-[400px] md:h-full border border-white/10 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/route_munnar.webp')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-stack-lg left-stack-lg">
                <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mb-2 drop-shadow-lg">Munnar</h3>
                <p className="text-white/70 font-body-md text-body-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">The Emerald Hills of Kerala</p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200} className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-full border border-white/10 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/dest_kochi.webp')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-stack-md left-stack-md">
                <h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Kochi</h3>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={300} className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-full border border-white/10 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('./assets/images/dest_alleppey.webp')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-stack-md left-stack-md">
                <h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Alleppey</h3>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <ScrollReveal animation="fade-up">
          <GallerySection images={GalleryImages} />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={200}>
          <TestimonialsSection testimonials={Testimonials} />
        </ScrollReveal>
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
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#routes">Top Routes</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Our Fleet</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Destinations</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Premium Amenities</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Passengers</h3>
                <ul className="space-y-4">
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Baggage Policy</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Cancellation Rules</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Refund Status</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Loyalty Program</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Support</h3>
                <ul className="space-y-4">
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Contact Us</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Help Center / FAQ</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">File a Complaint</a></li>
                  <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#">Feedback</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Connect</h3>
                <div className="flex gap-4 mb-6">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-white/60">
                    <span className="material-symbols-outlined text-[20px]">link</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-white/60">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-white/60">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </a>
                </div>
                <h4 className="text-sm font-bold text-white mb-3">Newsletter</h4>
                <div className="flex relative">
                  <input type="email" placeholder="Your email address" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                  <button className="absolute right-1 top-1 bottom-1 px-3 bg-primary rounded-md text-white hover:brightness-110 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">© {new Date().getFullYear()} Kerala State Road Transport Corporation. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-white/40 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-white/40 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-white/40 hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default DesktopHome;
