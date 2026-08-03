import React, { useState } from 'react';
import { Bus, Ticket, MapPin, ArrowRightLeft, Calendar, X, Search } from 'lucide-react';
import { filterCities } from '../../services/busService';

const MobileBookingWidget = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  journeyDate,
  setJourneyDate,
  tripType,
  setTripType,
  onSearch,
  t
}) => {
  const [isOriginFocused, setIsOriginFocused] = useState(false);
  const [isDestFocused, setIsDestFocused] = useState(false);

  const filteredOriginCities = filterCities(origin);
  const filteredDestCities = filterCities(destination);

  const getQuickDates = () => {
    const dates = [];
    const baseDate = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(baseDate.getDate() + i);
      const dateVal = String(d.getDate()).padStart(2, '0');
      const dayLabel = i === 0 ? 'TODAY' : days[d.getDay()];
      const fullDateString = d.toISOString().split('T')[0];
      dates.push({ dateVal, dayLabel, fullDateString });
    }
    return dates;
  };

  const formatDisplayDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="booking-widget-mobile">
      <div className="bwm-top-tabs">
        <button className="bwm-top-tab active">
          <Bus size={18} className="tab-icon" />
          <span>Book Bus Ticket</span>
        </button>
        <button className="bwm-top-tab" onClick={() => alert('Link Ticket Booking requires sign in')}>
          <Ticket size={18} className="tab-icon" />
          <span>Link Ticket Booking</span>
        </button>
      </div>

      <div className="bwm-trip-types">
        <button
          className={`bwm-trip-type ${tripType === 'one-way' ? 'active' : ''}`}
          onClick={() => setTripType('one-way')}
        >
          ONE WAY
        </button>
        <button
          className={`bwm-trip-type ${tripType === 'round' ? 'active' : ''}`}
          onClick={() => setTripType('round')}
        >
          ROUND TRIP
        </button>
      </div>

      <div className="bwm-route-wrapper">
        <div className="bwm-input-box" style={{ position: 'relative' }}>
          <MapPin size={22} className="bwm-input-icon" />
          <div className="bwm-input-details">
            <span className="bwm-input-label">Travelling From</span>
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              onFocus={() => setIsOriginFocused(true)}
              onBlur={() => setTimeout(() => setIsOriginFocused(false), 200)}
              placeholder="Select Origin"
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--dark)', width: '100%', padding: 0 }}
            />
          </div>
          {isOriginFocused && origin && filteredOriginCities.length > 0 && (
            <div 
              className="inline-city-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--white)',
                border: '1px solid var(--gray-light)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 9999,
                maxHeight: '220px',
                overflowY: 'auto',
                marginTop: '4px'
              }}
            >
              {filteredOriginCities.map(city => (
                <div 
                  key={city} 
                  className="inline-city-option"
                  style={{
                    padding: '12px 16px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--gray-light)',
                    backgroundColor: 'var(--white)',
                    color: 'var(--dark)'
                  }}
                  onClick={() => { setOrigin(city); setIsOriginFocused(false); }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="bwm-route-swap-btn"
          onClick={() => {
            const temp = origin;
            setOrigin(destination);
            setDestination(temp);
          }}
          aria-label="Swap Origin and Destination"
        >
          <ArrowRightLeft size={18} style={{ transform: 'rotate(90deg)' }} />
        </button>

        <div className="bwm-input-box" style={{ position: 'relative' }}>
          <MapPin size={22} className="bwm-input-icon" />
          <div className="bwm-input-details">
            <span className="bwm-input-label">Going To</span>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              onFocus={() => setIsDestFocused(true)}
              onBlur={() => setTimeout(() => setIsDestFocused(false), 200)}
              placeholder="Select Destination"
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--dark)', width: '100%', padding: 0 }}
            />
          </div>
          {isDestFocused && destination && filteredDestCities.length > 0 && (
            <div 
              className="inline-city-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--white)',
                border: '1px solid var(--gray-light)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 9999,
                maxHeight: '220px',
                overflowY: 'auto',
                marginTop: '4px'
              }}
            >
              {filteredDestCities.map(city => (
                <div 
                  key={city} 
                  className="inline-city-option"
                  style={{
                    padding: '12px 16px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--gray-light)',
                    backgroundColor: 'var(--white)',
                    color: 'var(--dark)'
                  }}
                  onClick={() => { setDestination(city); setIsDestFocused(false); }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bwm-input-box date-box">
        <Calendar size={22} className="bwm-input-icon" />
        <div className="bwm-input-details">
          <span className="bwm-input-label">Journey Date</span>
          <span className="bwm-input-value">{formatDisplayDate(journeyDate)}</span>
        </div>
        <span className="bwm-select-date-link">Select Date</span>
        <input
          type="date"
          value={journeyDate}
          onChange={(e) => setJourneyDate(e.target.value)}
          className="bwm-hidden-date-picker"
          aria-label="Journey Date"
        />
      </div>

      <div className="bwm-quick-dates">
        {getQuickDates().map((qd, index) => {
          const isSelected = journeyDate === qd.fullDateString;
          return (
            <button
              key={index}
              className={`bwm-quick-date-card ${isSelected ? 'active' : ''}`}
              onClick={() => setJourneyDate(qd.fullDateString)}
            >
              <span className="qd-num">{qd.dateVal}</span>
              <span className="qd-day">{qd.dayLabel}</span>
            </button>
          );
        })}
      </div>

      <button className="bwm-search-btn" onClick={onSearch}>
        {t.searchBuses.toUpperCase()}
      </button>
    </div>
  );
};

export default MobileBookingWidget;
