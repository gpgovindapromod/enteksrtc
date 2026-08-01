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


const GalleryImages = [
  { id: "1", img: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=600&auto=format&fit=crop", url: "#", height: 400 },
  { id: "2", img: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=600&auto=format&fit=crop", url: "#", height: 250 },
  { id: "3", img: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?q=80&w=600&auto=format&fit=crop", url: "#", height: 600 },
  { id: "4", img: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=600&auto=format&fit=crop", url: "#", height: 350 },
  { id: "5", img: "https://upload.wikimedia.org/wikipedia/commons/2/2b/K.S.R.T.C.Bus.jpg?_=20110514164313", url: "#", height: 300 },
  { id: "6", img: "https://vadakkus.com/wp-content/uploads/2024/10/KSRTC-Fast-Passenger-UPI-payment-scaled.jpg", url: "#", height: 500 },
];

const TopRoutes = [
  { from: 'Trivandrum', to: 'Kanyakumari', img: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=600&auto=format&fit=crop', duration: '2h 30m', price: '₹150' },
  { from: 'Trivandrum', to: 'Palakkad', img: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=600&auto=format&fit=crop', duration: '8h 15m', price: '₹450' },
  { from: 'Trivandrum', to: 'Palani', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop', duration: '7h 00m', price: '₹380' },
  { from: 'Trivandrum', to: 'Bangalore', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop', duration: '14h 30m', price: '₹1200' },
  { from: 'Trivandrum', to: 'Coimbatore', img: 'https://images.unsplash.com/photo-1621217734151-51203794bfa2?q=80&w=600&auto=format&fit=crop', duration: '9h 00m', price: '₹480' },
  { from: 'Trivandrum', to: 'Kannur', img: 'https://images.unsplash.com/photo-1634055979927-46328a6f3bdf?q=80&w=600&auto=format&fit=crop', duration: '12h 45m', price: '₹650' },
  { from: 'Trivandrum', to: 'Munnar', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop', duration: '8h 30m', price: '₹420' },
  { from: 'Trivandrum', to: 'Mangalore', img: 'https://images.unsplash.com/photo-1555530752-6bf6a524a10e?q=80&w=600&auto=format&fit=crop', duration: '15h 00m', price: '₹1400' },
];

const Destinations = [
  { name: 'Munnar', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Alleppey', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop' },
  { name: 'Kochi', img: 'https://images.unsplash.com/photo-1555530752-6bf6a524a10e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Kovalam', img: 'https://images.unsplash.com/photo-1574044566347-1dd7788be4a3?q=80&w=800&auto=format&fit=crop' }
];

const Testimonials = [
  { name: 'Sreya from Kochi', text: 'KSRTC is the worst transportation service in Kerala. i like city life and uber.' },
  { name: 'Saniya jose ayyapan', text: 'A great Kerala Government Bus Booking App, for those in Kerala and those in other states who can easily book bus tickets online.' },
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

const TopRoutesSection = React.memo(({ routes }) => (
  <section className="section bg-white">
    <div className="container">
      <div className="section-subtitle">Routes</div>
      <h2 className="section-title">Top Routes</h2>
      <div className="routes-grid">
        {routes.map((route, idx) => (
          <div key={idx} className="route-card">
            <img src={route.img} alt={`${route.from} to ${route.to}`} className="route-img" loading="lazy" decoding="async" />
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
                <a href="#" className="book-now-link">
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
            <img src={dest.img} alt={dest.name} className="dest-img" loading="lazy" decoding="async" />
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

const TestimonialsSection = React.memo(({ testimonials }) => (
  <section className="section testimonials-bg">
    <div className="container">
      <div className="section-subtitle">Testimonial</div>
      <h2 className="section-title">Client Feedback</h2>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, idx) => (
          <div key={idx} className="testimonial-card">
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
        ))}
      </div>
    </div>
  </section>
));

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



function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [tripType, setTripType] = useState('one-way');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Mobile WebApp States
  const [isMobile, setIsMobile] = useState(false);
  const [forceMobilePreview, setForceMobilePreview] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('home');
  const [language, setLanguage] = useState('en');
  const [hasActivatedWebApp, setHasActivatedWebApp] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [trackingStep, setTrackingStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTimingsModal, setShowTimingsModal] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [theme]);

  // Screen size resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const heroImages = [
    'https://upload.wikimedia.org/wikipedia/commons/2/2b/K.S.R.T.C.Bus.jpg?_=20110514164313',
    'https://vadakkus.com/wp-content/uploads/2024/10/KSRTC-Fast-Passenger-UPI-payment-scaled.jpg',
    'https://www.justkerala.in/wp-content/uploads/2012/12/ksrtc-bus-service.jpg',
    'https://fottam.com/wp-content/uploads/2016/02/Kerala-KSRTC-New-Scania-Metrolink-Bus.jpg'
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
    return () => clearInterval(interval);
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
      qrCode: `KSRTC-${Math.floor(1000000 + Math.random() * 9000000)}-${origin.substring(0,3).toUpperCase()}-${destination.substring(0,3).toUpperCase()}-${journeyDate.replace(/-/g, '')}`
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
  const renderWebsiteReplicaContent = () => (
    <>
      {/* Navbar */}
      <nav className="modern-navbar">
        <div className="navbar-container">
          <div className="nav-brand">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLWQfS0R2m1lTTNcpBqGKE8oBi2RxmC27R_wcpV3v8BQ&s=10" alt="KSRTC" className="ksrtc-logo-small" />
            <div className="brand-text-minimal">
              <span className="brand-title">Ente KSRTC</span>
              <span className="brand-tag">Premium Journey</span>
            </div>
          </div>

          <div className={`nav-menu-modern ${isMenuOpen ? 'active' : ''}`}>
            <div className="nav-links-modern">
              <a href="#" className="nav-item">Routes</a>
              <a href="#" className="nav-item">Destinations</a>
              <a href="#" className="nav-item">Gallery</a>
              <a href="#" className="nav-item">Support</a>
            </div>

            <div className="nav-actions">
              <button
                onClick={toggleTheme}
                style={{ background: 'transparent', border: 'none', color: 'var(--dark)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
              </button>
              <div className="nav-divider"></div>
              <img src="https://banner2.cleanpng.com/20181120/jiq/kisspng-kerala-logo-gods-own-country-vector-graphics-clip-1713920244732.webp" alt="Kerala Tourism" className="tourism-logo-small" />
              <div className="nav-divider"></div>
              <button className="btn-secondary-modern">Manage</button>
              <button className="btn-primary-modern">Login</button>
            </div>
          </div>

          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
              colors={['#ea580c', '#308342', '#fbbf24']}
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
                  <label>Travelling From</label>
                  <input list="origin-options" className="input-field" placeholder="Select Origin" defaultValue="Bangalore" />
                  <datalist id="origin-options">
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Kochi">Kochi</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Mysore">Mysore</option>
                  </datalist>
                  <MapPin className="input-icon" size={20} />
                </div>

                <button className="swap-btn">
                  <ArrowRightLeft size={18} />
                </button>

                <div className="input-group">
                  <label>Going To</label>
                  <input list="destination-options" className="input-field" placeholder="Select Destination" defaultValue="Tirunelveli" />
                  <datalist id="destination-options">
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Kochi">Kochi</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Mysore">Mysore</option>
                    <option value="Tirunelveli">Tirunelveli</option>
                  </datalist>
                  <MapPin className="input-icon" size={20} />
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Journey Date</label>
                  <input type="date" className="input-field" defaultValue="2026-07-28" />
                </div>
                <div className="input-group">
                  <label>Return Date (Optional)</label>
                  <input type="date" className="input-field" disabled={tripType === 'one-way'} />
                </div>
              </div>

              <button className="btn-primary">SEARCH BUSES</button>
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
        <TopRoutesSection routes={TopRoutes} />
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
              <h3 className="footer-title">Quick Links</h3>
              <div className="footer-links-grid">
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Home</a></li>
                  <li><a href="#" className="footer-link">About us</a></li>
                  <li><a href="#" className="footer-link">View Booking</a></li>
                  <li><a href="#" className="footer-link">Cancellation</a></li>
                  <li><a href="#" className="footer-link">Feedback</a></li>
                </ul>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Contact Us</a></li>
                  <li><a href="#" className="footer-link">Gallery</a></li>
                  <li><a href="#" className="footer-link">Privacy Policy</a></li>
                  <li><a href="#" className="footer-link">Terms & Conditions</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="footer-title">Contact Us</h3>
              <div className="contact-info">
                <p><strong>Route Related Enquiry</strong><br />
                  0471-2463799<br />
                  9447071021<br />
                  18005994011(Toll Free)<br />
                  We Social 9497722205<br />
                  <a href="mailto:rsnksrtc@kerala.gov.in" className="footer-link">rsnksrtc@kerala.gov.in</a></p>
                <p className="mt-4"><strong>Technical Enquiry</strong><br />
                  <a href="mailto:rsnksrtc@kerala.gov.in" className="footer-link">rsnksrtc@kerala.gov.in</a></p>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="footer-title">Corporate Office</h3>
              <div className="contact-info">
                <p>Kerala, Office of Managing Director,<br />
                  TRANSPORT BHAVAN, Fort, Trivandrum,<br />
                  Kerala, India, Pin 695023</p>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="app-store-badge mt-4" style={{ height: '40px', cursor: 'pointer' }} />
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026, All Rights Reserved, Kerala State Road Transport Corporation - KSRTC</p>
          </div>
        </div>
      </footer>
    </>
  );

  // Main Render Strategy
  const AcademicDisclaimer = () => (
    <div style={{ backgroundColor: '#ff4444', color: 'white', textAlign: 'center', padding: '10px', fontSize: '14px', fontWeight: 'bold', zIndex: 10000, position: 'relative' }}>
      ⚠️ ACADEMIC PROJECT ONLY: This is a student clone and is NOT the official KSRTC website. Do not enter real credentials.
    </div>
  );

  if (!showMobileView) {
    return (
      <>
        <AcademicDisclaimer />
        {/* Desktop Preview Enable Switch */}
        <button className="desktop-preview-toggle-button" onClick={() => setForceMobilePreview(true)}>
          📱 Mobile WebApp View
        </button>
        {renderWebsiteReplicaContent()}
      </>
    );
  }

  // Mobile WebApp Layout (showMobileView is true)
  return (
    <div className="mobile-app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <AcademicDisclaimer />
      <button className="desktop-preview-toggle-button" style={{ zIndex: 9999, top: '50px' }} onClick={() => setForceMobilePreview(false)}>
        💻 Desktop View
      </button>

      {/* Dynamic Active Tab View Render */}
      {activeMobileTab === 'home' && (
        <div className="tab-view-fadein" style={{ paddingBottom: '80px', overflowY: 'auto', flex: 1 }}>
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
        destination={destination}
        journeyDate={journeyDate}
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

export default App;