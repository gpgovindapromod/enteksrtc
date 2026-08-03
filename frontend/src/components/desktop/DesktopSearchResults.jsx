import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Bus, MapPin, Filter, X, ArrowLeftRight, Calendar, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-react';

const MOCK_BUSES = [
  { id: 1, name: 'K-Swift Premium AC Sleeper (2+1)', brand: 'K-SWIFT', type: 'AC Sleeper', departure: '18:30', arrival: '08:45', duration: '14h 15m', fare: 1450, rating: 4.8 },
  { id: 2, name: 'Swift Deluxe Air Bus (2+2)', brand: 'K-SWIFT', type: 'AC Semi-Sleeper', departure: '06:00', arrival: '20:30', duration: '14h 30m', fare: 950, rating: 4.5 },
  { id: 3, name: 'Minnal Express (Non-AC Sleeper)', brand: 'KSRTC MINNAL', type: 'Non-AC Sleeper', departure: '20:00', arrival: '09:15', duration: '13h 15m', fare: 880, rating: 4.2 },
  { id: 4, name: 'KSRTC Super Fast (2+3)', brand: 'KSRTC', type: 'Non-AC Semi-Sleeper', departure: '22:15', arrival: '13:00', duration: '14h 45m', fare: 720, rating: 3.9 }
];

const DesktopSearchResults = ({ onBack, origin, setOrigin, destination, setDestination, journeyDate, setJourneyDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [selectedDepTimes, setSelectedDepTimes] = useState([]);
  const [sortBy, setSortBy] = useState('Relevance');

  // Simulate network request for the skeleton loader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Wait for 2 seconds to show skeletons
    return () => clearTimeout(timer);
  }, []);

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

  // Filter and Sort Logic
  const getFilteredAndSortedBuses = () => {
    let result = [...MOCK_BUSES];

    if (selectedBusTypes.length > 0) {
      result = result.filter(bus => {
        if (selectedBusTypes.includes('AC Sleeper') && bus.type === 'AC Sleeper') return true;
        if (selectedBusTypes.includes('Non-AC Sleeper') && bus.type === 'Non-AC Sleeper') return true;
        if (selectedBusTypes.includes('AC Semi-Sleeper') && bus.type === 'AC Semi-Sleeper') return true;
        if (selectedBusTypes.includes('Seater') && bus.type === 'Non-AC Semi-Sleeper') return true; // Mapping Seater to Non-AC Semi-Sleeper for mock
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

  return (
    <div className="desktop-search-results-page">
      <div className="container">
        
        {/* Old Header Removed */}

        {/* Extra Modify Search Panel */}
        <div className="desktop-modify-panel">
          
          {/* Top Row: Search Modification */}
          <div className="modify-search-bar">
            
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

          {/* Middle Row: Filters & Sort */}
          <div className="modify-filters-bar">
            <div className="left-filters">
              <button className="filter-dropdown outline" onClick={clearAllFilters}><SlidersHorizontal size={14} /> Clear All Filters </button>
            </div>
            <div className="right-sort">
              <span className="sort-label"><ArrowDownWideNarrow size={14} /> Sort By</span>
              <select className="sort-select" style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option style={{ color: 'black' }}>Relevance</option>
                  <option style={{ color: 'black' }}>Price: Low to High</option>
                  <option style={{ color: 'black' }}>Departure: Earliest First</option>
                  <option style={{ color: 'black' }}>Rating: High to Low</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Trip Pill */}
          <div className="modify-trip-pill-bar">
            <div className="trip-pill">
              Onward Trip: {origin || 'Kollam (2)'} - {destination || 'Kottarakkara'}, 03 Aug
            </div>
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
              <span>Showing <strong>{filteredBuses.length}</strong> buses found</span>
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
                ) : (
                  // Actual Buses
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
                        <button className="btn-select-seats">Book Tickets</button>
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
