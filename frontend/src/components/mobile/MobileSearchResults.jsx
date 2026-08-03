import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Info, SlidersHorizontal, ArrowDownWideNarrow, X } from 'lucide-react';

const MOCK_BUSES = [
  { id: 1, name: 'K-Swift Premium AC Sleeper (2+1)', brand: 'K-SWIFT', type: 'AC Sleeper', departure: '18:30', arrival: '08:45', duration: '14h 15m', fare: 1450, rating: 4.8 },
  { id: 2, name: 'Swift Deluxe Air Bus (2+2)', brand: 'K-SWIFT', type: 'AC Semi-Sleeper', departure: '06:00', arrival: '20:30', duration: '14h 30m', fare: 950, rating: 4.5 },
  { id: 3, name: 'Minnal Express (Non-AC Sleeper)', brand: 'KSRTC MINNAL', type: 'Non-AC Sleeper', departure: '20:00', arrival: '09:15', duration: '13h 15m', fare: 880, rating: 4.2 },
  { id: 4, name: 'KSRTC Super Fast (2+3)', brand: 'KSRTC', type: 'Non-AC Semi-Sleeper', departure: '22:15', arrival: '13:00', duration: '14h 45m', fare: 720, rating: 3.9 }
];

const MobileSearchResults = ({
  isSearching,
  setIsSearching,
  origin,
  destination,
  journeyDate,
  selectedBus,
  setSelectedBus,
  selectedSeats,
  setSelectedSeats,
  isBookingSuccess,
  setIsBookingSuccess,
  handleCheckout,
  setHasActivatedWebApp,
  setActiveMobileTab,
  t
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [selectedDepTimes, setSelectedDepTimes] = useState([]);
  const [sortBy, setSortBy] = useState('Relevance');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  // Filter Logic
  const handleCheckboxChange = (setter, stateList, value) => {
    if (stateList.includes(value)) {
      setter(stateList.filter(item => item !== value));
    } else {
      setter([...stateList, value]);
    }
  };

  const getFilteredAndSortedBuses = () => {
    let result = [...MOCK_BUSES];

    if (selectedBusTypes.length > 0) {
      result = result.filter(bus => {
        if (selectedBusTypes.includes('AC Sleeper') && bus.type === 'AC Sleeper') return true;
        if (selectedBusTypes.includes('Non-AC Sleeper') && bus.type === 'Non-AC Sleeper') return true;
        if (selectedBusTypes.includes('AC Semi-Sleeper') && bus.type === 'AC Semi-Sleeper') return true;
        if (selectedBusTypes.includes('Seater') && bus.type === 'Non-AC Semi-Sleeper') return true;
        return false;
      });
    }

    if (selectedDepTimes.length > 0) {
      result = result.filter(bus => {
        const hour = parseInt(bus.departure.split(':')[0], 10);
        if (selectedDepTimes.includes('Before 6 AM') && hour < 6) return true;
        if (selectedDepTimes.includes('6 AM to 12 PM') && hour >= 6 && hour < 12) return true;
        if (selectedDepTimes.includes('12 PM to 6 PM') && hour >= 12 && hour < 18) return true;
        if (selectedDepTimes.includes('After 6 PM') && hour >= 18) return true;
        return false;
      });
    }

    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.fare - b.fare);
    } else if (sortBy === 'Departure: Earliest First') {
      result.sort((a, b) => a.departure.localeCompare(b.departure));
    } else if (sortBy === 'Rating: High to Low') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  };

  const filteredBuses = getFilteredAndSortedBuses();
  useEffect(() => {
    if (isSearching) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  if (!isSearching) return null;

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

  return (
    <div className="mobile-search-results-overlay">
      <div className="mobile-results-container">
        <header className="mobile-results-header">
          <button className="back-arrow-btn" onClick={() => { setIsSearching(false); setSelectedBus(null); }}>
            <ArrowLeft size={24} />
          </button>
          <div className="results-header-info">
            <h3>{origin} to {destination}</h3>
            <span>{journeyDate} • {selectedSeats.length > 0 ? `${selectedSeats.length} seats` : 'Select Bus'}</span>
          </div>
        </header>

        <div className="results-body">
          {!selectedBus ? (
            <>
              <div className="mobile-filter-bar">
                <button className="mobile-filter-pill outline" onClick={() => setShowSortSheet(true)}>
                  <ArrowDownWideNarrow size={14} /> Sort By
                </button>
                <button className="mobile-filter-pill outline" onClick={() => setShowFilterSheet(true)}>
                  <SlidersHorizontal size={14} /> Filters
                </button>
                {(selectedBusTypes.length > 0 || selectedDepTimes.length > 0) && (
                  <button className="mobile-filter-pill active" onClick={() => { setSelectedBusTypes([]); setSelectedDepTimes([]); }}>
                    <X size={14} /> Clear {selectedBusTypes.length + selectedDepTimes.length}
                  </button>
                )}
              </div>
              <div className="results-info-banner" style={{ marginTop: '12px' }}>
                <Info size={16} /> {filteredBuses.length} Services found for your route.
              </div>
              <div className="buses-list">
                {isLoading ? (
                  // Skeleton Loaders
                  [1, 2, 3, 4].map((item) => (
                    <div key={item} className="mobile-bus-card skeleton-card">
                      <div className="skeleton-row top-row">
                        <div className="skeleton-box tag"></div>
                        <div className="skeleton-box rating"></div>
                      </div>
                      <div className="skeleton-row title">
                        <div className="skeleton-box text-large"></div>
                      </div>
                      <div className="skeleton-row times">
                        <div className="skeleton-box time"></div>
                        <div className="skeleton-box time-line"></div>
                        <div className="skeleton-box time"></div>
                      </div>
                      <div className="skeleton-row footer">
                        <div className="skeleton-box text-medium"></div>
                        <div className="skeleton-box button"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Actual Buses
                  filteredBuses.map((bus) => (
                    <div key={bus.id} className="mobile-bus-card" onClick={() => setSelectedBus(bus)}>
                      <div className="bus-card-row1">
                        <span className="bus-brand-tag">{bus.brand}</span>
                        <div className="bus-rating">★ {bus.rating}</div>
                      </div>
                      <h4 className="bus-card-title">{bus.name}</h4>
                      <div className="bus-card-times">
                        <div className="time-group">
                          <span className="time">{bus.departure}</span>
                          <span className="station">{origin}</span>
                        </div>
                        <div className="duration-arrow">
                          <span>{bus.duration}</span>
                          <div className="arrow-line"></div>
                        </div>
                        <div className="time-group">
                          <span className="time">{bus.arrival}</span>
                          <span className="station">{destination}</span>
                        </div>
                      </div>
                      <div className="bus-card-footer">
                        <span className="bus-seat-type">{bus.type}</span>
                        <div className="bus-price-action">
                          <span className="price">₹{bus.fare}</span>
                          <button className="btn-select-seats">Book Tickets</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : !isBookingSuccess ? (
            <div className="seat-selection-container">
              <div className="seat-layout-header">
                <div>
                  <h4>{selectedBus.name}</h4>
                  <span className="seat-summary">{selectedSeats.length} Seats Selected: {selectedSeats.join(', ') || 'None'}</span>
                </div>
                <button className="btn-reset-seats" aria-label="Reset Seats" onClick={() => setSelectedSeats([])}><RotateCcw size={16} /></button>
              </div>

              <div className="seat-legend">
                <div className="legend-item"><div className="legend-box available"></div><span>Available</span></div>
                <div className="legend-item"><div className="legend-box selected"></div><span>Selected</span></div>
                <div className="legend-item"><div className="legend-box booked"></div><span>Booked</span></div>
              </div>

              <div className="seat-bus-body">
                <div className="driver-cabin">
                  <div className="steering-wheel"></div>
                </div>
                <div className="seats-scroller">
                  {renderSeatGrid()}
                </div>
              </div>

              <div className="seat-checkout-bar">
                <div className="checkout-summary">
                  <span className="label">Total Price</span>
                  <span className="total-fare">₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</span>
                </div>
                <button
                  className="btn-primary-modern checkout-btn"
                  disabled={selectedSeats.length === 0}
                  onClick={() => handleCheckout(selectedBus)}
                >
                  {t.confirmBooking}
                </button>
              </div>
            </div>
          ) : (
            <div className="booking-success-view">
              <div className="success-icon-animation">
                <CheckCircle2 size={80} color="var(--primary)" className="bounce-in" />
              </div>
              <h2>{t.paymentSuccess}</h2>
              <p>Your tickets have been sent to your email and are now saved in the <strong>My Tickets</strong> section.</p>
              
              <div className="success-ticket-preview">
                <div className="preview-row">
                  <span>Bus</span>
                  <strong>{selectedBus.name}</strong>
                </div>
                <div className="preview-row">
                  <span>Route</span>
                  <strong>{origin} → {destination}</strong>
                </div>
                <div className="preview-row">
                  <span>Seats</span>
                  <strong>{selectedSeats.join(', ')}</strong>
                </div>
                <div className="preview-row">
                  <span>Total Paid</span>
                  <strong>₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</strong>
                </div>
              </div>

              <button className="btn-primary-modern" style={{ width: '100%' }} onClick={() => {
                setIsBookingSuccess(false);
                setSelectedBus(null);
                setSelectedSeats([]);
                setIsSearching(false);
                setHasActivatedWebApp(true);
                setActiveMobileTab('tickets');
              }}>
                Go to My Tickets
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sort Bottom Sheet */}
      {showSortSheet && (
        <div className="mobile-bottom-sheet-overlay" onClick={() => setShowSortSheet(false)}>
          <div className="mobile-bottom-sheet-content fade-up" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Sort By</h3>
              <button className="sheet-close" onClick={() => setShowSortSheet(false)}><X size={20} /></button>
            </div>
            <div className="sheet-body">
              {['Relevance', 'Price: Low to High', 'Departure: Earliest First', 'Rating: High to Low'].map(opt => (
                <div key={opt} className="sheet-radio-row" onClick={() => { setSortBy(opt); setShowSortSheet(false); }}>
                  <span className={sortBy === opt ? 'active-text' : ''}>{opt}</span>
                  <div className={`radio-circle ${sortBy === opt ? 'selected' : ''}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filters Bottom Sheet */}
      {showFilterSheet && (
        <div className="mobile-bottom-sheet-overlay" onClick={() => setShowFilterSheet(false)}>
          <div className="mobile-bottom-sheet-content fade-up" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Filters</h3>
              <button className="sheet-close" onClick={() => setShowFilterSheet(false)}><X size={20} /></button>
            </div>
            <div className="sheet-body">
              <div className="sheet-filter-group">
                <h4>Departure Time</h4>
                {['Before 6 AM', '6 AM to 12 PM', '12 PM to 6 PM', 'After 6 PM'].map(time => (
                  <label key={time} className="checkbox-label" style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    <input type="checkbox" checked={selectedDepTimes.includes(time)} onChange={() => handleCheckboxChange(setSelectedDepTimes, selectedDepTimes, time)} /> {time}
                  </label>
                ))}
              </div>
              <div className="sheet-filter-group" style={{ marginTop: '16px' }}>
                <h4>Bus Type</h4>
                {['AC Sleeper', 'Non-AC Sleeper', 'AC Semi-Sleeper', 'Seater'].map(type => (
                  <label key={type} className="checkbox-label" style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    <input type="checkbox" checked={selectedBusTypes.includes(type)} onChange={() => handleCheckboxChange(setSelectedBusTypes, selectedBusTypes, type)} /> {type}
                  </label>
                ))}
              </div>
            </div>
            <div className="sheet-footer">
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setSelectedBusTypes([]); setSelectedDepTimes([]); }}>Clear All</button>
              <button className="btn-primary-modern" style={{ flex: 2 }} onClick={() => setShowFilterSheet(false)}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearchResults;
