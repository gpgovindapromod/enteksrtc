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
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
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
        <nav className={`modern-navbar ${isScrolled ? 'scrolled' : 'transparent'}`}>
          <div className="navbar-container">
            <div className="nav-brand">
              <img src="/assets/images/ksrtc_logo.png" alt="KSRTC" className="ksrtc-logo-small" width="40" height="40" />
              <div className="brand-text-minimal">
                <span className="brand-title">Ente KSRTC</span>
                <span className="brand-tag">Premium Journey</span>
              </div>
            </div>

            <div className={`nav-menu-modern ${isMenuOpen ? 'active' : ''}`}>
              <div className="nav-links-modern">
                <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); document.getElementById('mobile-routes-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Routes</a>
                <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); document.getElementById('mobile-destinations-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Destinations</a>
                <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); document.getElementById('mobile-gallery-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Gallery</a>
                <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setShowLiveTracking(true); }}>Track Bus</a>
                <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setShowTimingsModal(true); }}>Timings</a>
                {isUserLoggedIn && (
                  <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setShowDesktopTicketsModal(true); }}>My Tickets</a>
                )}
              </div>

              <div className="nav-actions">
                <button
                  onClick={toggleTheme}
                  style={{ background: 'transparent', border: 'none', color: 'var(--dark)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                </button>
                <div className="nav-divider"></div>
                <img src="/assets/images/kerala_tourism.webp" alt="Kerala Tourism" className="tourism-logo-small" width="80" height="40" />
                <div className="nav-divider"></div>
                <button className="btn-secondary-modern">Manage</button>
                {isUserLoggedIn ? (
                  <button className="btn-primary-modern" onClick={() => setIsUserLoggedIn(false)}>Logout</button>
                ) : (
                  <button className="btn-primary-modern" onClick={() => setShowLoginModal(true)}>Login</button>
                )}
              </div>
            </div>

            <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="hero">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`hero-bg ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="hero-overlay"></div>

          {/* Modern Slider Controls */}
          <div className="slider-controls">
            {heroImages.map((_, index) => (
              <div
                key={index}
                className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                onMouseEnter={() => setCurrentSlide(index)}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="dot-progress"></div>
              </div>
            ))}
          </div>

          <div className="container hero-content center-content">
            <div className="hero-title-area">
              <h1 className="hero-title">Experience the Journey</h1>
              <p className="hero-subtitle">Safe, Reliable, and Comfortable travel across Kerala and beyond.</p>
            </div>

            {showMobileView ? (
              renderMobileBookingWidget()
            ) : (
              <BorderGlow
                className="booking-widget glass-widget"
                glowColor="25 90 55"
                backgroundColor="transparent"
                borderRadius={24}
                glowIntensity={0.8}
                colors={['#10b981', '#059669', '#047857']}
              >
                <div className="widget-tabs">
                  <button className="widget-tab active">
                    <Bus size={20} />
                    Book Bus Ticket
                  </button>
                  <button className="widget-tab" style={{ color: 'var(--gray)' }}>
                    Link Ticket Booking
                  </button>
                </div>

                <div className="trip-type">
                  <button
                    className={`badge-btn ${tripType === 'one-way' ? 'active' : ''}`}
                    onClick={() => setTripType('one-way')}
                  >
                    ONE WAY
                  </button>
                  <button
                    className={`badge-btn ${tripType === 'round' ? 'active' : ''}`}
                    onClick={() => setTripType('round')}
                  >
                    ROUND TRIP
                  </button>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="origin-input">Travelling From</label>
                    <input
                      id="origin-input"
                      type="text"
                      className="input-field"
                      placeholder="Select Origin"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                    <MapPin className="input-icon" size={20} />
                  </div>

                  <button className="swap-btn" aria-label="Swap Origin and Destination" onClick={() => { const temp = origin; setOrigin(destination); setDestination(temp); }}>
                    <ArrowRightLeft size={18} />
                  </button>

                  <div className="input-group">
                    <label htmlFor="destination-input">Going To</label>
                    <input
                      id="destination-input"
                      type="text"
                      className="input-field"
                      placeholder="Select Destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                    <MapPin className="input-icon" size={20} />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="journey-date-input">Journey Date</label>
                    <input
                      id="journey-date-input"
                      type="date"
                      className="input-field"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="return-date-input">Return Date (Optional)</label>
                    <input id="return-date-input" type="date" className="input-field" disabled={tripType === 'one-way'} />
                  </div>
                </div>

                <button className="btn-primary" onClick={() => { setSelectedBus(null); setSelectedSeats([]); setIsBookingSuccess(false); setShowDesktopSearch(true); }}>SEARCH BUSES</button>
              </BorderGlow>
            )}
          </div>
          <GradualBlur
            target="parent"
            position="bottom"
            height="12rem"
            strength={4}
            divCount={6}
            curve="bezier"
            zIndex={3}
          />
        </header>

        {/* Sections */}
        <LazyLoad minHeight="500px">
          <TopRoutesSection 
            routes={TopRoutes} 
            onBookRoute={(from, to) => {
              setOrigin(from);
              setDestination(to);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                alert(`Route ${from} to ${to} selected.\nPlease select your journey date to continue booking.`);
              }, 500);
            }}
          />
        </LazyLoad>

        <LazyLoad minHeight="400px">
          <DestinationsSection destinations={Destinations} />
        </LazyLoad>

        <LazyLoad minHeight="800px">
          <GallerySection images={GalleryImages} />
        </LazyLoad>

        <LazyLoad minHeight="400px">
          <TestimonialsSection testimonials={Testimonials} />
        </LazyLoad>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-column">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                    <Bus size={24} color="var(--primary)" />
                  </div>
                  <h3 className="footer-title" style={{ marginBottom: 0, fontSize: '1.4rem' }}>Ente KSRTC</h3>
                </div>
                <p style={{ lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '24px', color: 'var(--gray)' }}>
                  The official bus ticket booking application for Kerala State Road Transport Corporation. We provide safe, comfortable, and reliable travel across Kerala and neighboring states.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href="#" className="footer-link"><Facebook size={22} /></a>
                  <a href="#" className="footer-link"><Twitter size={22} /></a>
                  <a href="#" className="footer-link"><Instagram size={22} /></a>
                  <a href="#" className="footer-link"><Youtube size={22} /></a>
                </div>
              </div>
              <div className="footer-column">
                <h3 className="footer-title">Quick Links</h3>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Home</a></li>
                  <li><a href="#" className="footer-link">About Us</a></li>
                  <li><a href="#" className="footer-link">View Booking</a></li>
                  <li><a href="#" className="footer-link">Gallery</a></li>
                  <li><a href="#" className="footer-link">Terms & Conditions</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h3 className="footer-title">Support</h3>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Contact Us</a></li>
                  <li><a href="#" className="footer-link">Cancellation</a></li>
                  <li><a href="#" className="footer-link">Feedback</a></li>
                  <li><a href="#" className="footer-link">Privacy Policy</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h3 className="footer-title">Corporate Office</h3>
                <div className="contact-info">
                  <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
                    <span>Office of Managing Director,<br />
                    TRANSPORT BHAVAN, Fort,<br />
                    Trivandrum, Pin 695023</span>
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                    <Phone size={18} style={{ color: 'var(--primary)' }} />
                    <span>0471-2463799 / 18005994011</span>
                  </p>
                </div>
                <img src="/assets/images/app_store.svg" alt="App Store" className="app-store-badge mt-4" style={{ height: '40px', cursor: 'pointer', transition: 'transform 0.2s', marginTop: '24px' }} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'} width="119" height="40" />
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2026, All Rights Reserved, Kerala State Road Transport Corporation - KSRTC</p>
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
