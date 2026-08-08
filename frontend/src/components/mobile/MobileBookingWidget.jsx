import React, { useState } from 'react';
import { Bus, Ticket, MapPin, ArrowRightLeft, Calendar, Search } from 'lucide-react';
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
      return d.toISOString().split('T')[0]; // Simple YYYY-MM-DD for native date picker fallback
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-[24px] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] w-full mx-auto relative z-20">
      
      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-white/10 pb-2">
        <button className="text-emerald-500 font-bold border-b-2 border-emerald-500 pb-2 tracking-wide transition-colors text-sm flex items-center gap-2">
          <Bus size={18} /> Book Bus Ticket
        </button>
        <button 
          className="text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white pb-2 tracking-wide transition-colors text-sm flex items-center gap-2"
          onClick={() => alert('Link Ticket Booking requires sign in')}
        >
          <Ticket size={18} /> Link Ticket
        </button>
      </div>

      <div className="flex flex-col gap-6 relative">
        {/* FROM Field */}
        <div className="relative border-b-2 border-gray-200 dark:border-white/20 pb-2 focus-within:border-emerald-500 transition-colors">
          <label className="block text-[10px] text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2 font-bold">From</label>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-gray-400 dark:text-white/40" />
            <input
              id="mobile-origin-input"
              aria-label="Departure City"
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              onFocus={() => setIsOriginFocused(true)}
              onBlur={() => setTimeout(() => setIsOriginFocused(false), 200)}
              placeholder="Departure City"
              className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 p-0"
            />
          </div>
          {isOriginFocused && origin && filteredOriginCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
              {filteredOriginCities.map(city => (
                <div 
                  key={city} 
                  className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-white border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => { setOrigin(city); setIsOriginFocused(false); }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button (Absolute positioned between From and To for mobile) */}
        <div className="absolute right-0 top-[60px] translate-y-[-50%] z-40">
          <button
            className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-white/20 rounded-full p-2 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:border-emerald-500 transition-all group flex-shrink-0 shadow-sm"
            onClick={() => {
              const temp = origin;
              setOrigin(destination);
              setDestination(temp);
            }}
          >
            <ArrowRightLeft size={16} className="text-gray-500 dark:text-white/60 group-hover:text-emerald-500 transition-colors rotate-90" />
          </button>
        </div>

        {/* TO Field */}
        <div className="relative border-b-2 border-gray-200 dark:border-white/20 pb-2 focus-within:border-emerald-500 transition-colors">
          <label className="block text-[10px] text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2 font-bold">To</label>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-gray-400 dark:text-white/40" />
            <input
              id="mobile-destination-input"
              aria-label="Destination City"
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              onFocus={() => setIsDestFocused(true)}
              onBlur={() => setTimeout(() => setIsDestFocused(false), 200)}
              placeholder="Destination City"
              className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 p-0"
            />
          </div>
          {isDestFocused && destination && filteredDestCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
              {filteredDestCities.map(city => (
                <div 
                  key={city} 
                  className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-white border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => { setDestination(city); setIsDestFocused(false); }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DATE Field */}
        <div className="relative border-b-2 border-gray-200 dark:border-white/20 pb-2 focus-within:border-emerald-500 transition-colors">
          <label className="block text-[10px] text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2 font-bold">Date</label>
          <div className="flex items-center gap-2 relative">
            <Calendar size={18} className="text-gray-400 dark:text-white/40" />
            <input
              id="mobile-date-input"
              aria-label="Journey Date"
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="bg-transparent border-none w-full text-gray-900 dark:text-white text-base font-medium focus:ring-0 focus:outline-none p-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:dark:invert"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="bg-emerald-700 text-white h-14 px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg shadow-emerald-700/30 group w-full mt-2"
        >
          <span>Search</span>
          <Search size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default MobileBookingWidget;
