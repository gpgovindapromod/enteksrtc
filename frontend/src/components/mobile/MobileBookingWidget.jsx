import React from 'react';
import { Bus, Ticket, MapPin, ArrowRightLeft, Calendar } from 'lucide-react';

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
        <div className="bwm-input-box">
          <MapPin size={22} className="bwm-input-icon" />
          <div className="bwm-input-details">
            <span className="bwm-input-label">Travelling From</span>
            <input
              list="mobile-origin-options"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="bwm-input-field"
              placeholder="Select Origin"
            />
            <datalist id="mobile-origin-options">
              <option value="Bangalore">Bangalore</option>
              <option value="Trivandrum">Trivandrum</option>
              <option value="Kochi">Kochi</option>
              <option value="Calicut">Calicut</option>
              <option value="Thrissur">Thrissur</option>
            </datalist>
          </div>
        </div>

        <button
          className="bwm-route-swap-btn"
          onClick={() => {
            const temp = origin;
            setOrigin(destination);
            setDestination(temp);
          }}
        >
          <ArrowRightLeft size={18} style={{ transform: 'rotate(90deg)' }} />
        </button>

        <div className="bwm-input-box">
          <MapPin size={22} className="bwm-input-icon" />
          <div className="bwm-input-details">
            <span className="bwm-input-label">Going To</span>
            <input
              list="mobile-dest-options"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bwm-input-field"
              placeholder="Select Destination"
            />
            <datalist id="mobile-dest-options">
              <option value="Bangalore">Bangalore</option>
              <option value="Trivandrum">Trivandrum</option>
              <option value="Kochi">Kochi</option>
              <option value="Calicut">Calicut</option>
              <option value="Thrissur">Thrissur</option>
              <option value="Tirunelveli">Tirunelveli</option>
            </datalist>
          </div>
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
