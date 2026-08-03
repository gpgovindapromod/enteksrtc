import React, { useEffect } from 'react';
import { Bus, MapPin, ArrowRightLeft, Menu, X, Sun, Moon } from 'lucide-react';
import BorderGlow from '../BorderGlow';
import GradualBlur from '../GradualBlur';
import MobileBookingWidget from './MobileBookingWidget';

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
  t,
  // Section components
  TopRoutesSection,
  DestinationsSection,
  GallerySection,
  TestimonialsSection,
  // Static datasets
  TopRoutes,
  Destinations,
  GalleryImages,
  Testimonials,
  // Slide states
  heroImages,
  currentSlide,
  setCurrentSlide,
  showMobileView,
  isMenuOpen,
  setIsMenuOpen,
  theme,
  toggleTheme
}) => {

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages, setCurrentSlide]);

  return (
    <div className="mobile-home-tab-wrapper">
      {/* Mobile Navbar */}
      <nav className="modern-navbar">
        <div className="navbar-container">
          <div className="nav-brand">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLWQfS0R2m1lTTNcpBqGKE8oBi2RxmC27R_wcpV3v8BQ&s=10" alt="KSRTC" className="ksrtc-logo-small" width="40" height="40" />
            <div className="brand-text-minimal">
              <span className="brand-title">Ente KSRTC</span>
              <span className="brand-tag">Premium Journey</span>
            </div>
          </div>

          <div className={`nav-menu-modern ${isMenuOpen ? 'active' : ''}`}>
            <div className="nav-links-modern">
              <span className="nav-item" onClick={() => {
                setIsMenuOpen(false);
                document.getElementById('mobile-routes-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>Routes</span>
              <span className="nav-item" onClick={() => {
                setIsMenuOpen(false);
                document.getElementById('mobile-destinations-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>Destinations</span>
              <span className="nav-item" onClick={() => {
                setIsMenuOpen(false);
                document.getElementById('mobile-gallery-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>Gallery</span>
            </div>

            <div className="nav-actions">
              <button
                onClick={toggleTheme}
                style={{ background: 'transparent', border: 'none', color: 'var(--dark)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
              </button>
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
      <div id="mobile-routes-section">
        <TopRoutesSection routes={TopRoutes} />
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3 className="footer-title">Quick Links</h3>
              <div className="footer-links-grid">
                <ul className="footer-links">
                  <li><span className="footer-link-span" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</span></li>
                  <li><span className="footer-link-span">About us</span></li>
                  <li><span className="footer-link-span">View Booking</span></li>
                  <li><span className="footer-link-span">Cancellation</span></li>
                  <li><span className="footer-link-span">Feedback</span></li>
                </ul>
                <ul className="footer-links">
                  <li><span className="footer-link-span">Contact Us</span></li>
                  <li><span className="footer-link-span">Gallery</span></li>
                  <li><span className="footer-link-span">Privacy Policy</span></li>
                  <li><span className="footer-link-span">Terms & Conditions</span></li>
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
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="app-store-badge mt-4" style={{ height: '40px', cursor: 'pointer' }} width="119" height="40" />
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026, All Rights Reserved, Kerala State Road Transport Corporation - KSRTC</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MobileHomeTab;
