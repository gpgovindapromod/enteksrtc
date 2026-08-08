import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Bus, MapPin, Filter, X, ArrowLeftRight, Calendar, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowDownWideNarrow, RotateCcw, CheckCircle2, Moon, Sun } from 'lucide-react';
import { getFilteredAndSortedBuses, generateSeatLayoutData } from '../../services/busService';

const DesktopSearchResults = ({ 
  onBack, 
  theme,
  toggleTheme,
  origin, 
  setOrigin, 
  destination, 
  setDestination, 
  journeyDate, 
  setJourneyDate,
  selectedBus,
  setSelectedBus,
  selectedSeats,
  setSelectedSeats,
  isBookingSuccess,
  setIsBookingSuccess,
  handleCheckout,
  setShowDesktopTicketsModal,
  t = {}
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filteredBuses, setFilteredBuses] = useState([]);
  
  // Filter States
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [selectedDepTimes, setSelectedDepTimes] = useState([]);
  const [sortBy, setSortBy] = useState('Relevance');

  // Fetch buses asynchronously
  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const buses = await getFilteredAndSortedBuses({
          selectedBusTypes,
          selectedDepTimes,
          sortBy,
          origin,
          destination,
          date: journeyDate
        });
        setFilteredBuses(buses);
      } catch (error) {
        console.error("Failed to fetch buses", error);
        setFilteredBuses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuses();
  }, [selectedBusTypes, selectedDepTimes, sortBy, origin, destination, journeyDate]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleCheckboxChange = (setter, stateList, value) => {
    if (stateList.includes(value)) {
      setter(stateList.filter(item => item !== value));
    } else {
      setter([...stateList, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedBusTypes([]);
    setSelectedDepTimes([]);
    setSortBy('Relevance');
  };

  const seatGridData = generateSeatLayoutData();

  const renderSeatGrid = () => {
    return seatGridData.map((row) => (
      <div key={row.rowId} className="seat-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
        {row.seats.map((seat, idx) => {
          if (seat.isAisle) {
            return <div key={seat.key} className="seat-aisle" style={{ width: '20px' }}></div>;
          }
          const isSelected = selectedSeats.includes(seat.seatLabel);
          let seatBg = 'var(--white)';
          let seatColor = 'var(--dark)';
          let seatBorder = '1px solid var(--gray-light)';
          
          if (seat.isBooked) {
            seatBg = 'var(--gray-light)';
            seatColor = 'var(--gray)';
          } else if (isSelected) {
            seatBg = 'var(--primary)';
            seatColor = 'white';
            seatBorder = '1px solid var(--primary)';
          }

          return (
            <button
              key={seat.seatId}
              disabled={seat.isBooked}
              onClick={() => {
                if (isSelected) {
                  setSelectedSeats(selectedSeats.filter(s => s !== seat.seatLabel));
                } else {
                  setSelectedSeats([...selectedSeats, seat.seatLabel]);
                }
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: seatBorder,
                background: seatBg,
                color: seatColor,
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {seat.seatLabel}
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="desktop-search-results-page">
      <div className="container">
        
        {/* Old Header Removed */}

        {/* Unified Search Header */}
        <div className="unified-search-header glass-widget">
          
          {/* Top Row: Brand & Actions */}
          <div className="ush-top-row">
            <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={onBack}>
              <img src="/assets/images/ksrtc_logo.png" alt="KSRTC" className="ksrtc-logo-small" width="40" height="40" />
              <div className="brand-text-minimal">
                <span className="brand-title">Ente KSRTC</span>
                <span className="brand-tag">Premium Journey</span>
              </div>
            </div>
            
            <div className="ush-actions">
              <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="btn-secondary-modern" onClick={onBack}>Back to Home</button>
            </div>
          </div>

          {/* Bottom Row: Search Modification */}
          <div className="modify-search-bar ush-bottom-row">
            
            <div className="modify-input-group">
              <div className="modify-label">Travelling From</div>
              <div className="modify-input-row">
                <input 
                  type="text" 
                  className="modify-value-input" 
                  value={origin || ''} 
                  onChange={(e) => setOrigin(e.target.value)} 
                  placeholder="Origin" 
                />
                <X size={16} className="modify-clear" onClick={() => setOrigin('')} />
              </div>
            </div>

            <button className="modify-swap-btn" onClick={handleSwap}>
              <ArrowLeftRight size={18} />
            </button>

            <div className="modify-input-group">
              <div className="modify-label">Going To</div>
              <div className="modify-input-row">
                <input 
                  type="text" 
                  className="modify-value-input" 
                  value={destination || ''} 
                  onChange={(e) => setDestination(e.target.value)} 
                  placeholder="Destination" 
                />
                <X size={16} className="modify-clear" onClick={() => setDestination('')} />
              </div>
            </div>

            <div className="modify-input-group date-group">
              <div className="modify-label">Journey Date</div>
              <div className="modify-input-row">
                <Calendar size={16} className="modify-icon" />
                <input 
                  type="date" 
                  className="modify-value-input" 
                  value={journeyDate || ''} 
                  onChange={(e) => setJourneyDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="modify-input-group date-group">
              <div className="modify-label">Return Date (Optional)</div>
              <div className="modify-input-row">
                <Calendar size={16} className="modify-icon" />
                <input type="date" className="modify-value-input" placeholder="Choose Date" />
              </div>
            </div>

            <button className="btn-modify-submit">MODIFY</button>
          </div>

        </div>

        <div className="desktop-search-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-card">
              <div className="filter-header">
                <h3><Filter size={18} /> Filters</h3>
                <button className="clear-filters-btn" onClick={clearAllFilters}>Clear All</button>
              </div>

              <div className="filter-group">
                <h4>Departure Time</h4>
                {['Before 6 AM', '6 AM to 12 PM', '12 PM to 6 PM', 'After 6 PM'].map(time => (
                  <label key={time} className="checkbox-label">
                    <input type="checkbox" checked={selectedDepTimes.includes(time)} onChange={() => handleCheckboxChange(setSelectedDepTimes, selectedDepTimes, time)} /> {time}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h4>Bus Type</h4>
                {['AC Sleeper', 'Non-AC Sleeper', 'AC Semi-Sleeper', 'Seater'].map(type => (
                  <label key={type} className="checkbox-label">
                    <input type="checkbox" checked={selectedBusTypes.includes(type)} onChange={() => handleCheckboxChange(setSelectedBusTypes, selectedBusTypes, type)} /> {type}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Results Column */}
          <main className="results-main">
            <div className="results-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>Showing <strong>{filteredBuses.length}</strong> buses</span>
                <div className="trip-pill" style={{ background: 'var(--primary-light)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '500', color: 'var(--primary)' }}>
                  {origin || 'Origin'} → {destination || 'Destination'} (03 Aug)
                </div>
              </div>
              <div className="sort-by">
                <label>Sort by:</label>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Departure: Earliest First</option>
                  <option>Rating: High to Low</option>
                </select>
              </div>
            </div>

            <div className="desktop-buses-list">
              {isLoading ? (
                // Render Skeleton Loaders
                [1, 2, 3, 4].map((item) => (
                  <div key={item} className="desktop-bus-card skeleton-card">
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
              ) : selectedBus ? (
                !isBookingSuccess ? (
                  /* Seat Selection & Checkout Layout */
                  <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--gray-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--gray-light)', paddingBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedBus.name}</h3>
                        <span style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>{selectedSeats.length} Seats Selected: {selectedSeats.join(', ') || 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => setSelectedSeats([])} style={{ background: 'transparent', border: '1px solid var(--gray-light)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                          <RotateCcw size={14} /> Reset
                        </button>
                        <button onClick={() => setSelectedBus(null)} style={{ background: 'transparent', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                          ✕ Back to Buses
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                      {/* Left Column: Seat Grid */}
                      <div style={{ flex: 1, minWidth: '280px', background: 'var(--light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--gray-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', background: 'var(--white)', border: '1px solid var(--gray-light)', borderRadius: '4px' }}></div> Available</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '4px' }}></div> Selected</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', background: 'var(--gray-light)', borderRadius: '4px' }}></div> Booked</div>
                        </div>

                        <div style={{ border: '2px solid var(--gray-light)', borderRadius: '16px', padding: '20px 12px', background: 'var(--white)', position: 'relative' }}>
                          <div style={{ textAlign: 'right', marginBottom: '12px', fontSize: '0.75rem', color: 'var(--gray)', fontWeight: 'bold' }}>STEERING ☸</div>
                          {renderSeatGrid()}
                        </div>
                      </div>

                      {/* Right Column: Order Summary & Action */}
                      <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px' }}>Fare Breakdown</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-light)' }}>
                            <span>Base Fare per Seat</span>
                            <strong>₹{selectedBus.fare}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-light)' }}>
                            <span>Selected Seats ({selectedSeats.length})</span>
                            <strong>{selectedSeats.join(', ') || '-'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            <span>Total Price</span>
                            <span>₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          disabled={selectedSeats.length === 0}
                          onClick={() => handleCheckout(selectedBus)}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: selectedSeats.length === 0 ? 'var(--gray-light)' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
                            marginTop: '24px'
                          }}
                        >
                          Confirm & Pay ₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Booking Confirmation Screen */
                  <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '16px', border: '1px solid var(--gray-light)', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <CheckCircle2 size={72} color="var(--primary)" style={{ margin: '0 auto 16px auto' }} />
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>Booking Confirmed!</h2>
                    <p style={{ color: 'var(--gray)', marginBottom: '24px' }}>Your ticket has been booked successfully and added to <strong>My Tickets</strong>.</p>
                    
                    <div style={{ maxWidth: '400px', margin: '0 auto 24px auto', padding: '16px', background: 'var(--light)', borderRadius: '12px', textAlign: 'left', border: '1px solid var(--gray-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Bus</span><strong>{selectedBus.name}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Route</span><strong>{origin} → {destination}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Seats</span><strong>{selectedSeats.join(', ')}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-light)', paddingTop: '8px' }}><span>Total Paid</span><strong style={{ color: 'var(--primary)' }}>₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</strong></div>
                    </div>

                    <button 
                      onClick={() => {
                        setIsBookingSuccess(false);
                        setSelectedBus(null);
                        setSelectedSeats([]);
                        setShowDesktopTicketsModal(true);
                      }}
                      style={{
                        padding: '12px 28px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      View My Boarding Passes
                    </button>
                  </div>
                )
              ) : (
                // Actual Buses List
                filteredBuses.length > 0 ? filteredBuses.map((bus) => (
                  <div key={bus.id} className="desktop-bus-card">
                    <div className="bus-card-main-info">
                      <div className="bus-details">
                        <span className="bus-brand-tag">{bus.brand}</span>
                        <h4 className="bus-card-title">{bus.name}</h4>
                        <span className="bus-seat-type">{bus.type}</span>
                      </div>
                      
                      <div className="bus-times-wrapper">
                        <div className="time-col">
                          <span className="time">{bus.departure}</span>
                          <span className="station">{origin || 'Origin'}</span>
                        </div>
                        <div className="duration-col">
                          <span className="duration">{bus.duration}</span>
                          <div className="arrow-line"></div>
                        </div>
                        <div className="time-col">
                          <span className="time">{bus.arrival}</span>
                          <span className="station">{destination || 'Dest'}</span>
                        </div>
                      </div>

                      <div className="bus-action-col">
                        <div className="bus-rating">★ {bus.rating}</div>
                        <span className="price">₹{bus.fare}</span>
                        <button className="btn-select-seats" onClick={() => setSelectedBus(bus)}>Book Tickets</button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="no-buses-found" style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
                    <Bus size={48} color="var(--gray)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                    <h3>No buses found</h3>
                    <p style={{ color: 'var(--gray)', marginTop: '8px' }}>Try adjusting your filters to see more results.</p>
                    <button className="btn-primary" style={{ marginTop: '16px' }} onClick={clearAllFilters}>Clear All Filters</button>
                  </div>
                )
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DesktopSearchResults;
