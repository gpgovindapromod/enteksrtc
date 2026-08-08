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
  const [localOrigin, setLocalOrigin] = useState(origin);
  const [localDestination, setLocalDestination] = useState(destination);
  const [localDate, setLocalDate] = useState(journeyDate);
  const [errorMsg, setErrorMsg] = useState('');

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
    const temp = localOrigin;
    setLocalOrigin(localDestination);
    setLocalDestination(temp);
  };

  const handleModify = () => {
    if (!localOrigin.trim()) { setErrorMsg("Please enter a departure city."); return; }
    if (!localDestination.trim()) { setErrorMsg("Please enter a destination city."); return; }
    if (localOrigin.trim().toLowerCase() === localDestination.trim().toLowerCase()) { setErrorMsg("Origin and destination cannot be the same."); return; }
    if (!localDate) { setErrorMsg("Please select a journey date."); return; }

    const selectedDate = new Date(localDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setErrorMsg("Journey date cannot be in the past."); return; }

    setErrorMsg('');
    setOrigin(localOrigin);
    setDestination(localDestination);
    setJourneyDate(localDate);
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
    <div className={`min-h-screen font-inter ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>

      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-white/10 px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={onBack}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <Bus size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-outfit text-emerald-500 leading-tight">Ente KSRTC</h1>
              <p className="text-[10px] tracking-widest uppercase opacity-60">Premium Journey</p>
            </div>
          </div>

          {/* Search Bar - Compact */}
          <div className="hidden lg:flex flex-col relative">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-white/10 relative z-10">
              <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-300 dark:border-white/10">
                <span className="text-xs opacity-50 block uppercase tracking-wide">From</span>
                <input
                  value={localOrigin}
                  onChange={(e) => setLocalOrigin(e.target.value)}
                  placeholder="Origin"
                  className="bg-transparent border-none outline-none text-sm font-bold w-24 text-gray-900 dark:text-white"
                />
              </div>
              <button onClick={handleSwap} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-emerald-500">
                <ArrowLeftRight size={16} />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-300 dark:border-white/10">
                <span className="text-xs opacity-50 block uppercase tracking-wide">To</span>
                <input
                  value={localDestination}
                  onChange={(e) => setLocalDestination(e.target.value)}
                  placeholder="Destination"
                  className="bg-transparent border-none outline-none text-sm font-bold w-24 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-300 dark:border-white/10">
                <span className="text-xs opacity-50 block uppercase tracking-wide">Date</span>
                <input
                  type="date"
                  value={localDate}
                  onChange={(e) => setLocalDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-bold w-32 text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert cursor-pointer"
                />
              </div>
              <button onClick={handleModify} className="px-6 py-2 bg-emerald-500 text-white rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
                Modify
              </button>
            </div>
            {errorMsg && (
              <div className="absolute -bottom-6 left-4 text-xs font-bold text-red-500 animate-fade-in-up">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-white"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={onBack} className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-white shadow-sm">
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="sticky top-28 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-none backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                <Filter size={18} className="text-emerald-500" />
                Filters
              </div>
              <button onClick={clearAllFilters} className="text-xs font-bold text-emerald-500 hover:underline">Reset</button>
            </div>

            <div className="space-y-8">
              {/* Departure Time */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-white/50 mb-4 uppercase tracking-wider">Departure Time</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Before 6 AM', '6 AM to 12 PM', '12 PM to 6 PM', 'After 6 PM'].map((time) => (
                    <button
                      key={time}
                      onClick={() => handleCheckboxChange(setSelectedDepTimes, selectedDepTimes, time)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedDepTimes.includes(time)
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bus Type */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-white/50 mb-4 uppercase tracking-wider">Bus Type</h3>
                <div className="space-y-3">
                  {['AC Sleeper', 'Non-AC Sleeper', 'AC Semi-Sleeper', 'Seater'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBusTypes.includes(type)}
                        onChange={() => handleCheckboxChange(setSelectedBusTypes, selectedBusTypes, type)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Promo Card */}
            <div className="mt-8 relative rounded-2xl overflow-hidden group cursor-pointer aspect-video lg:aspect-square shadow-lg">
              <img src="/assets/images/premium_hero_1.jpg" alt="Explore Fleet" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-5">
                <p className="font-bold text-sm text-white drop-shadow-md">Explore K-Swift Fleet</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Results List */}
        <div className="flex-1 space-y-6">

          {/* List Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">{filteredBuses.length} Buses Found</h2>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] uppercase tracking-wider font-bold">
                {origin || 'Origin'} → {destination || 'Destination'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 dark:text-white/50">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-800 dark:text-white py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option className="text-gray-900">Relevance</option>
                  <option className="text-gray-900">Price: Low to High</option>
                  <option className="text-gray-900">Departure: Earliest First</option>
                  <option className="text-gray-900">Rating: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Skeleton Loaders */}
          {isLoading ? (
            [1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl h-48 w-full shadow-sm"></div>
            ))
          ) : selectedBus ? (
            !isBookingSuccess ? (
              /* Seat Selection Layout */
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">{selectedBus.name}</h3>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{selectedSeats.length} Seats Selected: {selectedSeats.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button onClick={() => setSelectedSeats([])} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                      <RotateCcw size={14} /> Reset
                    </button>
                    <button onClick={() => setSelectedBus(null)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white transition-colors">
                      ✕ Back to Buses
                    </button>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Seat Grid */}
                  <div className="flex-1 bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-200 dark:border-white/5">
                    <div className="flex justify-center gap-6 mb-6 text-xs font-bold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded"></div> Available</div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded"></div> Selected</div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-300 dark:bg-slate-700 rounded"></div> Booked</div>
                    </div>

                    <div className="border-2 border-gray-200 dark:border-white/10 rounded-3xl p-6 bg-white dark:bg-slate-900 relative max-w-sm mx-auto shadow-inner">
                      <div className="text-right mb-4 text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest">STEERING ☸</div>
                      {renderSeatGrid()}
                    </div>
                  </div>

                  {/* Right Column: Order Summary & Action */}
                  <div className="w-full lg:w-[320px] flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold font-outfit text-gray-900 dark:text-white mb-4">Fare Breakdown</h4>
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Base Fare per Seat</span>
                        <strong className="text-gray-900 dark:text-white">₹{selectedBus.fare}</strong>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Selected Seats ({selectedSeats.length})</span>
                        <strong className="text-gray-900 dark:text-white">{selectedSeats.join(', ') || '-'}</strong>
                      </div>
                      <div className="flex justify-between py-4 text-xl font-bold text-emerald-500">
                        <span>Total Price</span>
                        <span>₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      disabled={selectedSeats.length === 0}
                      onClick={() => handleCheckout(selectedBus)}
                      className={`w-full py-4 rounded-xl font-bold text-base mt-8 shadow-xl transition-all ${selectedSeats.length === 0
                          ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                          : 'bg-emerald-500 text-white hover:scale-105 active:scale-95 shadow-emerald-500/30'
                        }`}
                    >
                      Confirm & Pay ₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Booking Confirmation Screen */
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-gray-200 dark:border-white/10 text-center shadow-2xl max-w-2xl mx-auto">
                <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Your ticket has been booked successfully and added to <strong>My Tickets</strong>.</p>

                <div className="max-w-md mx-auto mb-8 p-6 bg-gray-50 dark:bg-slate-950 rounded-2xl text-left border border-gray-200 dark:border-white/5 shadow-inner">
                  <div className="flex justify-between mb-3 text-sm"><span className="text-gray-500 dark:text-gray-400">Bus</span><strong className="text-gray-900 dark:text-white text-right">{selectedBus.name}</strong></div>
                  <div className="flex justify-between mb-3 text-sm"><span className="text-gray-500 dark:text-gray-400">Route</span><strong className="text-gray-900 dark:text-white text-right">{origin} → {destination}</strong></div>
                  <div className="flex justify-between mb-4 text-sm"><span className="text-gray-500 dark:text-gray-400">Seats</span><strong className="text-gray-900 dark:text-white text-right">{selectedSeats.join(', ')}</strong></div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-white/10 pt-4 text-lg"><span className="font-bold text-gray-900 dark:text-white">Total Paid</span><strong className="text-emerald-500">₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</strong></div>
                </div>

                <button
                  onClick={() => {
                    setIsBookingSuccess(false);
                    setSelectedBus(null);
                    setSelectedSeats([]);
                    setShowDesktopTicketsModal(true);
                  }}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
                >
                  View My Boarding Passes
                </button>
              </div>
            )
          ) : (
            // Actual Buses List
            filteredBuses.length > 0 ? filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col md:flex-row shadow-sm"
              >
                {/* Left Section: Branding & Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">
                      ★ {bus.rating}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                      <Clock size={14} />
                      On Time
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">{bus.name}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{bus.type}</p>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-4 py-3">
                    <div className="text-center shrink-0">
                      <div className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">{bus.departure}</div>
                      <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest max-w-[100px] truncate mt-1">{origin || 'Origin'}</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">{bus.duration}</span>
                      <div className="w-full h-px bg-gray-300 dark:bg-white/20 relative">
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-gray-400 dark:border-white/40 bg-white dark:bg-slate-900"></div>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 mt-2 tracking-widest uppercase">DIRECT</span>
                    </div>

                    <div className="text-center shrink-0">
                      <div className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">{bus.arrival}</div>
                      <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest max-w-[100px] truncate mt-1">{destination || 'Destination'}</div>
                    </div>
                  </div>
                </div>

                {/* Right Section: Price & CTA */}
                <div className="w-full md:w-[240px] md:border-l border-gray-200 dark:border-white/10 md:ml-8 md:pl-8 mt-6 md:mt-0 flex flex-col justify-center items-center md:items-end gap-1">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500">Starting From</p>
                  <div className="text-4xl font-black font-outfit text-emerald-500 mb-1">
                    ₹{bus.fare.toLocaleString()}
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full">18 Seats left</p>

                  <button onClick={() => setSelectedBus(bus)} className="w-full bg-emerald-500 text-white font-bold text-sm py-4 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                    Book Tickets
                  </button>
                </div>
              </div>
            )) : (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-12 text-center rounded-2xl shadow-sm">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bus size={40} className="text-gray-400 dark:text-white/30" />
                </div>
                <h3 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-2">No buses found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Try adjusting your filters or changing the route to see more results.</p>
                <button className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-transform" onClick={clearAllFilters}>Clear All Filters</button>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default DesktopSearchResults;
