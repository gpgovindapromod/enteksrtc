import React, { useState, useEffect } from 'react';
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
import MobileProfileTab from './components/mobile/MobileProfileTab';
import MobileHomeTab from './components/mobile/MobileHomeTab';
import MobileLoginModal from './components/mobile/MobileLoginModal';
import DesktopSearchResults from './components/desktop/DesktopSearchResults';
import DesktopAuthModal from './components/desktop/DesktopAuthModal';
import Dashboard from './components/dashboard/Dashboard';


const GalleryImages = [
  { id: "1", img: "/assets/images/gallery_1.jpg", url: "#", height: 400 },
  { id: "2", img: "/assets/images/gallery_2.jpg", url: "#", height: 250 },
  { id: "3", img: "/assets/images/gallery_3.jpg", url: "#", height: 600 },
  { id: "4", img: "/assets/images/gallery_4.jpg", url: "#", height: 350 },
  { id: "5", img: "/assets/images/gallery_5.jpg", url: "#", height: 300 },
  { id: "6", img: "/assets/images/gallery_6.jpg", url: "#", height: 500 },
  { id: "7", img: "/assets/images/gallery_7.jpg", url: "#", height: 450 },
  { id: "8", img: "/assets/images/gallery_8.jpg", url: "#", height: 300 },
  { id: "9", img: "/assets/images/gallery_9.jpg", url: "#", height: 380 },
  { id: "10", img: "/assets/images/gallery_10.jpg", url: "#", height: 320 },
];

const TopRoutes = [
  { from: 'Trivandrum', to: 'Kanyakumari', img: '/assets/images/route_kanyakumari.jpg', duration: '2h 30m', price: '₹150' },
  { from: 'Trivandrum', to: 'Palakkad', img: '/assets/images/route_palakkad.jpg', duration: '8h 15m', price: '₹450' },
  { from: 'Trivandrum', to: 'Palani', img: '/assets/images/route_palani.jpg', duration: '7h 00m', price: '₹380' },
  { from: 'Trivandrum', to: 'Bangalore', img: '/assets/images/route_bangalore.jpg', duration: '14h 30m', price: '₹1200' },
  { from: 'Trivandrum', to: 'Coimbatore', img: '/assets/images/route_coimbatore.jpg', duration: '9h 00m', price: '₹480' },
  { from: 'Trivandrum', to: 'Kannur', img: '/assets/images/route_kannur.jpg', duration: '12h 45m', price: '₹650' },
  { from: 'Trivandrum', to: 'Munnar', img: '/assets/images/route_munnar.jpg', duration: '8h 30m', price: '₹420' },
  { from: 'Trivandrum', to: 'Mangalore', img: '/assets/images/route_mangalore.jpg', duration: '15h 00m', price: '₹1400' },
];

const Destinations = [
  { name: 'Munnar', img: '/assets/images/route_munnar.jpg' },
  { name: 'Alleppey', img: '/assets/images/dest_alleppey.jpg' },
  { name: 'Kochi', img: '/assets/images/dest_kochi.jpg' },
  { name: 'Kottarakkara', img: '/assets/images/dest_kottarakkara.jpg' },
  { name: 'Gavi', img: '/assets/images/dest_gavi.jpg' },
  { name: 'Kovalam', img: '/assets/images/dest_kovalam.jpg' },
  { name: 'Kozhikode', img: '/assets/images/dest_kozhikode.jpg' },
  { name: 'Wayanad', img: '/assets/images/dest_wayanad.jpg' },
  { name: 'Vagamon', img: '/assets/images/dest_vagamon.jpg' },
  { name: 'Varkala', img: '/assets/images/dest_varkala.jpg' },
  { name: 'Alappuzha', img: '/assets/images/dest_alleppey.jpg' },
];

const Testimonials = [
  { name: 'Rahul Nambiar', text: 'The new K-Swift buses are incredibly comfortable for long journeys. Reached Bangalore right on time!' },
  { name: 'Sreya from Kochi', text: 'KSRTC is the worst transportation service in Kerala. i like city life and uber.' },
  { name: 'Saniya jose ayyapan', text: 'A great Kerala Government Bus Booking App, for those in Kerala and those in other states who can easily book bus tickets online.' },
  { name: 'Mohammed Shafi', text: 'Very impressed with the cleanliness and the professional behavior of the staff. Highly recommended.' },
  { name: 'Anjali Menon', text: 'Booking tickets has never been easier. The live tracking feature is a lifesaver during night travels.' },
  { name: 'Thomas Varghese', text: 'The Minnal service from Trivandrum to Palakkad is the fastest way to travel across the state. Great experience!' },
  { name: 'Sneha Ramesh', text: 'Love the new AC Sleeper buses. Very comfortable bedding and smooth driving throughout the trip.' },
  { name: 'Krishna Kumar', text: 'I Liked: Punctuality, Staff behavior, Cleanliness, Seat comfort. Nice experience with KSRTC Buses.' },
];

const LazyLoad = ({ children, minHeight = '400px' }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={{ minHeight: isVisible ? 'auto' : minHeight }}>{isVisible ? children : null}</div>;
};

const TopRoutesSection = React.memo(({ routes, onBookRoute }) => (
  <section className="section bg-white">
    <div className="container">
      <div className="section-subtitle">Routes</div>
      <h2 className="section-title">Top Routes</h2>
      <div className="routes-grid">
        {routes.map((route, idx) => (
          <div key={idx} className="route-card">
            <div className="route-img-wrapper">
              <img src={route.img} alt={`${route.from} to ${route.to}`} className="route-img" loading="lazy" decoding="async" width="400" height="250" />
            </div>
            <div className="route-info">
              <div className="route-points">
                <div className="point">
                  <div className="point-dot start"></div>
                  {route.from}
                </div>
                <div className="point">
                  <div className="point-dot end"></div>
                  {route.to}
                </div>
              </div>
              <div className="route-actions-right">
                <div className="route-price">{route.price}</div>
                <div className="route-duration">{route.duration}</div>
                <a href="#" className="book-now-link" onClick={(e) => { e.preventDefault(); onBookRoute && onBookRoute(route.from, route.to); }}>
                  <CalendarDays size={16} /> Book Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const DestinationsSection = React.memo(({ destinations }) => (
  <section className="section">
    <div className="container">
      <div className="section-subtitle">Destinations</div>
      <h2 className="section-title">Popular Destinations from <span style={{ color: 'var(--secondary)' }}>Trivandrum</span></h2>
      <div className="destinations-grid">
        {destinations.map((dest, idx) => (
          <div key={idx} className="dest-card">
            <img src={dest.img} alt={dest.name} className="dest-img" loading="lazy" decoding="async" width="300" height="200" />
            <div className="dest-overlay"></div>
            <div className="dest-name">{dest.name}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const GallerySection = React.memo(({ images }) => (
  <section className="section bg-white">
    <div className="container">
      <div className="section-subtitle">Gallery</div>
      <h2 className="section-title">KSRTC Moments</h2>
      <div className="gallery-container">
        <Masonry
          items={images}
          ease="power3.out"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover={true}
          hoverScale={1.05}
          blurToFocus={true}
          colorShiftOnHover={false}
        />
      </div>
    </div>
  </section>
));

const TestimonialsSection = React.memo(({ testimonials }) => {
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const maxIdx = Math.max(0, testimonials.length - 3);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIdx]);

  return (
    <section className="section testimonials-bg">
      <div className="container" style={{ position: 'relative' }}>
        <div className="section-subtitle">Testimonial</div>
        <h2 className="section-title">Client Feedback</h2>
        
        {/* Navigation Buttons */}
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          style={{
            position: 'absolute', left: '-20px', top: '55%', transform: 'translateY(-50%)',
            background: 'white', border: '1px solid #eee', borderRadius: '50%', width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 10, cursor: 'pointer', opacity: currentIdx === 0 ? 0.5 : 1, transition: 'all 0.3s'
          }}
          disabled={currentIdx === 0}
          aria-label="Previous testimonials"
        >
          <ArrowLeft size={24} color="var(--primary, #e11d48)" />
        </button>

        <button 
          onClick={() => setCurrentIdx(prev => Math.min(maxIdx, prev + 1))}
          style={{
            position: 'absolute', right: '-20px', top: '55%', transform: 'translateY(-50%)',
            background: 'white', border: '1px solid #eee', borderRadius: '50%', width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 10, cursor: 'pointer', opacity: currentIdx === maxIdx ? 0.5 : 1, transition: 'all 0.3s'
          }}
          disabled={currentIdx === maxIdx}
          aria-label="Next testimonials"
        >
          <ChevronRight size={24} color="var(--primary, #e11d48)" />
        </button>

        <div style={{ overflow: 'hidden', padding: '10px 0' }}>
          <div 
            className="testimonials-slider-track" 
            style={{ 
              display: 'flex', 
              transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)', 
              transform: `translateX(calc(-${currentIdx} * (100% / ${testimonials.length})))`,
              width: `calc(${testimonials.length} * 33.333%)`
            }}
          >
            {testimonials.map((testimonial, idx) => (
              <div key={idx} style={{ flex: `0 0 calc(100% / ${testimonials.length})`, padding: '0 12px', boxSizing: 'border-box' }}>
                <div className="testimonial-card" style={{ height: '100%', margin: 0 }}>
                  <Quote className="quote-mark" size={32} />
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <User size={28} />
                    </div>
                    <div className="author-info">
                      <h4>{testimonial.name}</h4>
                      <span>Traveller</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const MOCK_BUSES = [
  { id: 'B1', name: 'K-Swift Premium AC Sleeper', departure: '19:30', arrival: '08:45', duration: '13h 15m', fare: 1450, rating: '4.8', type: 'Sleeper (2+1)', brand: 'K-Swift' },
  { id: 'B2', name: 'Minnal Super Express', departure: '20:15', arrival: '07:30', duration: '11h 15m', fare: 950, rating: '4.2', type: 'Semi-Sleeper (2+2)', brand: 'Minnal' },
  { id: 'B3', name: 'Swift Deluxe AC Seater', departure: '21:00', arrival: '10:00', duration: '13h 00m', fare: 1100, rating: '4.5', type: 'Seater (2+2)', brand: 'K-Swift' },
  { id: 'B4', name: 'Fast Passenger (Non-AC)', departure: '18:00', arrival: '09:30', duration: '15h 30m', fare: 650, rating: '3.9', type: 'Seater (3+2)', brand: 'Fast Passenger' }
];

const TRANSLATIONS = {
  en: {
    welcome: "Where are you heading?",
    searchPlaceholder: "Search destinations...",
    origin: "Origin",
    destination: "Destination",
    date: "Departure Date",
    searchBuses: "Search Buses",
    myTickets: "My Tickets",
    activeJourneys: "Active Journeys",
    routes: "Popular Routes",
    profile: "Profile Settings",
    support: "Support & Helplines",
    quickActions: "Quick Actions",
    liveTracking: "Live Tracking",
    swiftCargo: "Swift Cargo",
    busTimings: "Bus Timings",
    kSwift: "K-Swift",
    seatSelection: "Seat Selection",
    confirmBooking: "Confirm Booking",
    paymentSuccess: "Booking Confirmed!",
    backHome: "Back to Home",
    boardingPass: "Boarding Pass",
    tapToScan: "Tap to view boarding pass",
    theme: "Dark Theme",
    language: "Language",
    phoneEnquiry: "Enquiry Helpline",
    feedback: "Send Feedback"
  },
  ml: {
    welcome: "നിങ്ങൾ എവിടേക്കാണ് പോകുന്നത്?",
    searchPlaceholder: "സ്ഥലം തിരയുക...",
    origin: "പുറപ്പെടുന്ന സ്ഥലം",
    destination: "എത്തുന്ന സ്ഥലം",
    date: "യാത്രാ തീയതി",
    searchBuses: "ബസുകൾ തിരയുക",
    myTickets: "എന്റെ ടിക്കറ്റുകൾ",
    activeJourneys: "നിലവിലെ യാത്രകൾ",
    routes: "പ്രധാന റൂട്ടുകൾ",
    profile: "പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ",
    support: "സഹായ കേന്ദ്രം",
    quickActions: "ദ്രുത സേവനങ്ങൾ",
    liveTracking: "ലൈവ് ട്രാക്കിംഗ്",
    swiftCargo: "സ്വിഫ്റ്റ് കാർഗോ",
    busTimings: "ബസ് സമയവിവരങ്ങൾ",
    kSwift: "കെ-സ്വിഫ്റ്റ്",
    seatSelection: "സീറ്റ് തിരഞ്ഞെടുക്കുക",
    confirmBooking: "ബുക്കിംഗ് സ്ഥിരീകരിക്കുക",
    paymentSuccess: "ബുക്കിംഗ് വിജയിച്ചു!",
    backHome: "ഹോമിലേക്ക് മടങ്ങുക",
    boardingPass: "ബോർഡിംഗ് പാസ്",
    tapToScan: "ബോർഡിംഗ് പാസ് കാണാൻ ക്ലിക്ക് ചെയ്യുക",
    theme: "ഡാർക്ക് തീം",
    language: "ഭാഷ",
    phoneEnquiry: "ഹെൽപ്പ്‌ലൈൻ നമ്പർ",
    feedback: "അഭിപ്രായങ്ങൾ അറിയിക്കുക"
  }
};



import { useTheme } from './context/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [tripType, setTripType] = useState('one-way');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mobile WebApp States
  const [isMobile, setIsMobile] = useState(false);
  const [forceMobilePreview, setForceMobilePreview] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('home');
  const [language, setLanguage] = useState('en');
  const [hasActivatedWebApp, setHasActivatedWebApp] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
        setIsSearching(true);
      }}
      t={t}
    />
  );

  // Search, Selection & Checkout States
  const [origin, setOrigin] = useState('Bangalore');
  const [destination, setDestination] = useState('Tirunelveli');
  const [journeyDate, setJourneyDate] = useState('2026-07-28');
  const [isSearching, setIsSearching] = useState(false);
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearchClick = () => {
    if (!origin || !origin.trim()) { setSearchError("Please enter a departure city."); return; }
    if (!destination || !destination.trim()) { setSearchError("Please enter a destination city."); return; }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) { setSearchError("Origin and destination cannot be the same."); return; }
    if (!journeyDate) { setSearchError("Please select a journey date."); return; }
    
    const selectedDate = new Date(journeyDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) { setSearchError("Journey date cannot be in the past."); return; }

    setSearchError('');
    setSelectedBus(null); 
    setSelectedSeats([]); 
    setIsBookingSuccess(false); 
    setShowDesktopSearch(true); 
  };

  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [trackingStep, setTrackingStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTimingsModal, setShowTimingsModal] = useState(false);
  const [showDesktopTicketsModal, setShowDesktopTicketsModal] = useState(false);

  // Profile accordion state
  const [faqExpanded, setFaqExpanded] = useState({ 0: false, 1: false, 2: false });

  // Ticket status list
  const [activeBookings, setActiveBookings] = useState([
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
  ]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

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
    '/assets/images/premium_hero_1.jpg',
    '/assets/images/premium_hero_2.jpg',
    '/assets/images/premium_hero_3.jpg',
    '/assets/images/premium_hero_4.jpg'
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
    setActiveBookings([newBooking, ...activeBookings]);
    setIsBookingSuccess(true);
  };

  const handleCancelBooking = (bookingId) => {
    setActiveBookings(activeBookings.filter(b => b.id !== bookingId));
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
        <div style={{width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 99999, overflowY: 'auto', backgroundColor: 'var(--bg-color)'}}>
           <button onClick={() => setShowDashboard(false)} className="fixed bottom-6 right-6 z-[60] bg-white text-emerald-500 px-4 py-2 rounded-xl font-bold shadow-xl border border-emerald-500 hover:scale-105 active:scale-95 transition-all">Back to App</button>
           <Dashboard theme={theme} toggleTheme={toggleTheme} />
        </div>
      );
    }
    if (showDesktopSearch && !showMobileView) {
      return (
        <>
          <DesktopSearchResults
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() => setShowDesktopSearch(false)}
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
<button onClick={() => setShowDashboard(true)} className={`drop-shadow-md hover:text-primary hover:scale-105 transition-all duration-300 font-semibold ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}>Experience Dashboard</button>
</div>
{/*  Right Actions  */}
<div className="flex items-center justify-end gap-6 w-1/4">
<a className={`hidden md:block drop-shadow-md text-sm hover:text-primary transition-colors duration-300 font-medium ${isScrolled ? 'text-gray-600 dark:text-white/70' : 'text-white/80'}`} href="#">Kerala Tourism</a>
{/*  Theme Toggle  */}

    {isUserLoggedIn ? (
      <button className="text-sm font-medium text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-primary/10" onClick={() => setIsUserLoggedIn(false)}>Logout</button>
    ) : (
      <button className="text-sm font-medium bg-primary text-on-primary px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all" onClick={() => setShowLoginModal(true)}>Login</button>
    )}
    <div className={`cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-300 hover:text-primary drop-shadow-md ${isScrolled ? 'text-gray-700 dark:text-white/80' : 'text-white/80'}`}>
  
<span className="material-symbols-outlined" onClick={toggleTheme}>{theme === "dark" ? "light_mode" : "dark_mode"}</span>
</div>
</div>
</div>
</nav>

{/*  Hero Section  */}
<header className="relative min-h-[90vh] flex flex-col justify-center items-center pt-20">
{/*  Background Image  */}
<div className="absolute inset-0 z-0 overflow-hidden">

      {heroImages.map((img, index) => (
        <div
          key={index}
          className={`w-full h-full absolute inset-0 bg-cover bg-center transition-opacity duration-1000 scale-105 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{ backgroundImage: `url(${img})` }}
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
    <label className="block text-[10px] text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2 font-bold">From</label>
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-gray-400 dark:text-white/40" style={{ fontSize: '18px' }}>location_on</span>
      <input
        className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30 p-0"
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
    >
      <span className="material-symbols-outlined text-gray-500 dark:text-white/60 group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>swap_horiz</span>
    </button>
  </div>

  {/* TO Field */}
  <div className="flex-1 border-b-2 border-gray-200 dark:border-white/20 pb-3 focus-within:border-primary transition-colors px-0 md:px-4">
    <label className="block text-[10px] text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2 font-bold">To</label>
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-gray-400 dark:text-white/40" style={{ fontSize: '18px' }}>flag</span>
      <input
        className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30 p-0"
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
    <label className="block text-[10px] text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2 font-bold">Date</label>
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-gray-400 dark:text-white/40" style={{ fontSize: '18px' }}>calendar_month</span>
      <input
        className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none p-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
      className="bg-primary text-white h-12 md:h-14 px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg shadow-primary/30 group w-full md:w-auto"
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
<main className="pt-16 bg-white dark:bg-slate-950 transition-colors duration-300">

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
            <button className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-sm text-sm font-bold active:scale-95">Book</button>
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
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpovBCBQ4ZZLKLOSa9pozzVeIgh29fkOCe20zgkwgve4ailXKQzSLGojSpkge8iIcdnum57332-J6K6tQ54H6jKQmBDOKM39pNLYqwVgbP7jUFT4c6nrwa-cklraMMNY33dNxb4b46r47sAkVPrh_wHCoaCtYke3G2i6j5HjJJR2EU8lSyb7gDrfoYG9GZYPxCffTyewR6_X0IpeLzWfV6IwjXBiJWZ_0PpPsY1ljR78H9y9T-pPA')` }}></div>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
<div className="absolute bottom-stack-lg left-stack-lg">
<h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mb-2 drop-shadow-lg">Munnar</h3>
<p className="text-white/70 font-body-md text-body-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">The Emerald Hills of Kerala</p>
</div>
</div>
{/*  Kochi  */}
<div className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-auto border border-white/10 shadow-lg">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA37NzZLa650ZYZsr07Xcm8902nMutBRS74Sme8mhc0ys_K_oXTa9B0jf3iT32QIPoWnHLBq0z8kRHubszdtSXgFgTIjcbHWyKbE_n5EDzD5EcDqe5fvlOwPWk-OFr3qcOvRiddxr8cv3_CSe9SYnOH2AbI0KKs481QyRnanU_sSLy-_JoeCUgJjLnNcvV0-CtGkjNhriuPTGm1mF3CotQr1Gq4IA-3xgdlxcI-4Mz8TMw_FVLbhJE')` }}></div>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
<div className="absolute bottom-stack-md left-stack-md">
<h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Kochi</h3>
</div>
</div>
{/*  Alleppey  */}
<div className="relative rounded-xl overflow-hidden group cursor-pointer h-[300px] md:h-auto border border-white/10 shadow-lg">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZNHpO9tDoPqxCZFQoy9ypuaolmdDE5FwIUwuC27tFmFy-i1Tq5KqUZJ78bMiw4At2iJm9tiEA-8JbVfB7AM6q9fgkgIk87rtKUNPK7pUhor7IHJYZBGTU2T2EvZJZ5MJK4VHr_flVKCZzD2i4lrHIPCrjlVInxHPnE_9ZDnwep3-dOKjUB85qRXBntaG_gvi935iYaNe3ie2aO_kFe-19wXRykdP5-Zeeno7vZBsvUGcvsB7v2B8')` }}></div>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
<div className="absolute bottom-stack-md left-stack-md">
<h3 className="font-headline-md text-headline-md text-white drop-shadow-md">Alleppey</h3>
</div>
</div>
</div>
</section>
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
        <p className="text-white/60 font-body-md text-sm leading-relaxed mb-8">
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
          <h4 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Explore
          </h4>
          <ul className="space-y-4">
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Routes</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Fleet</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Offers</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Support
          </h4>
          <ul className="space-y-4">
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Help Center</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Contact</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Grievances</a></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors duration-500"></div>
          <h4 className="font-headline-md text-lg font-bold text-white mb-2 relative z-10">Get the App</h4>
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
      <div className="text-xs text-white/40 font-medium">
        &copy; {new Date().getFullYear()} Kerala State Road Transport Corporation. All rights reserved.
      </div>
      <div className="flex items-center gap-6 text-xs text-white/40 font-medium">
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

  if (!showMobileView) {
    return (
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
  }

  // Mobile WebApp Layout (showMobileView is true)
  return (
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
              setIsSearching(true);
            }}
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
            setActiveMobileTab={setActiveMobileTab}
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
            setActiveMobileTab={setActiveMobileTab}
            isUserLoggedIn={isUserLoggedIn}
            setShowLoginModal={setShowLoginModal}
          />
          <main className="mobile-webapp-content" style={{ flex: 1, paddingTop: '64px' }}>
            <MobileTicketsTab
              activeBookings={activeBookings}
              expandedTicketId={expandedTicketId}
              setExpandedTicketId={setExpandedTicketId}
              handleCancelBooking={handleCancelBooking}
              setActiveMobileTab={setActiveMobileTab}
              setIsSearching={setIsSearching}
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
            setActiveMobileTab={setActiveMobileTab}
            isUserLoggedIn={isUserLoggedIn}
            setShowLoginModal={setShowLoginModal}
          />
          <main className="mobile-webapp-content" style={{ flex: 1, paddingTop: '64px' }}>
            <MobileProfileTab
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
                setActiveMobileTab('home');
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
        setIsSearching={setIsSearching}
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
        setActiveMobileTab={setActiveMobileTab}
        t={t}
      />
      <MobileLoginModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        onLoginSuccess={() => {
          setIsUserLoggedIn(true);
          setActiveMobileTab('profile');
        }}
      />

      {/* Sticky Persistent Mobile Bottom Navbar */}
      <nav className="mobile-bottom-navbar">
        <button
          className={`navbar-tab-item ${activeMobileTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveMobileTab('home');
            setIsSearching(false);
            setSelectedBus(null);
          }}
        >
          <Search size={22} />
          <span>Home</span>
        </button>
        <button
          className="navbar-tab-item"
          onClick={() => {
            setActiveMobileTab('home');
            setIsSearching(false);
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
            setActiveMobileTab('home');
            setIsSearching(false);
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
            onClick={() => setActiveMobileTab('tickets')}
          >
            <Ticket size={22} />
            <span>Tickets</span>
          </button>
        )}
        {isUserLoggedIn && (
          <button
            className={`navbar-tab-item ${activeMobileTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('profile')}
          >
            <User size={22} />
            <span>Profile</span>
          </button>
        )}
      </nav>
    </div>
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
