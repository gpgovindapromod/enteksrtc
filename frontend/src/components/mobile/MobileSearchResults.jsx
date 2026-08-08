import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Info, SlidersHorizontal, ArrowDownWideNarrow, X, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import MobileBookingWidget from './MobileBookingWidget';
import { useBusSearch } from '../../hooks/useBusSearch';
import { useTheme } from '../../context/ThemeContext';

const MobileSearchResults = ({
  isSearching,
  setIsSearching,
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
  setHasActivatedWebApp,
  setActiveMobileTab,
  t
}) => {
  const { theme } = useTheme();
  
  const {
    isLoading,
    filteredBuses,
    selectedBusTypes,
    setSelectedBusTypes,
    selectedDepTimes,
    setSelectedDepTimes,
    sortBy,
    setSortBy,
    handleCheckboxChange,
    clearAllFilters,
    seatGridData
  } = useBusSearch({
    initialOrigin: origin,
    initialDestination: destination,
    initialJourneyDate: journeyDate,
    setOrigin,
    setDestination,
    setJourneyDate,
    isSearching
  });

  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [tripType, setTripType] = useState('one-way');

  if (!isSearching) return null;

  const renderSeatGrid = () => {
    return seatGridData.map((row) => (
      <div key={row.rowId} className="flex gap-2 mb-2 justify-center">
        {row.seats.map((seat) => {
          if (seat.isAisle) {
            return <div key={seat.key} style={{ width: '20px' }}></div>;
          }
          const isSelected = selectedSeats.includes(seat.seatLabel);
          let seatBg = 'bg-white dark:bg-slate-800';
          let seatColor = 'text-gray-900 dark:text-white';
          let seatBorder = 'border-gray-200 dark:border-white/10';

          if (seat.isBooked) {
            seatBg = 'bg-gray-200 dark:bg-white/5';
            seatColor = 'text-gray-400 dark:text-gray-500';
            seatBorder = 'border-transparent';
          } else if (isSelected) {
            seatBg = 'bg-emerald-500';
            seatColor = 'text-white';
            seatBorder = 'border-emerald-500';
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
              className={`w-9 h-9 rounded-lg border ${seatBorder} ${seatBg} ${seatColor} font-bold text-xs flex items-center justify-center transition-colors ${seat.isBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500'}`}
            >
              {seat.seatLabel}
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <div className={`fixed inset-0 z-[100] ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-gray-50 dark:bg-slate-950 flex flex-col font-inter">
        
        {/* Header */}
        <header 
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-4 py-4 flex justify-between items-center cursor-pointer transition-colors z-20"
          onClick={() => setIsModifyOpen(!isModifyOpen)}
        >
          <div className="flex items-center gap-4">
            <button 
              className="text-gray-700 dark:text-white"
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsSearching(false); 
                setSelectedBus(null); 
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg font-outfit leading-tight">{origin} to {destination}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{journeyDate} • {selectedSeats.length > 0 ? `${selectedSeats.length} seats` : 'Select Bus'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
            <span>Modify</span>
            {isModifyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </header>

        {isModifyOpen && (
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-white/10 p-4 shadow-xl z-10 animate-fade-in-up">
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
                setIsModifyOpen(false);
              }}
              t={t}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 p-4 pb-24">
          {!selectedBus ? (
            <>
              {/* Filters Bar */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                <button className="flex-shrink-0 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-700 dark:text-white flex items-center gap-2 shadow-sm" onClick={() => setShowSortSheet(true)}>
                  <ArrowDownWideNarrow size={14} className="text-emerald-500" /> Sort By
                </button>
                <button className="flex-shrink-0 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-700 dark:text-white flex items-center gap-2 shadow-sm" onClick={() => setShowFilterSheet(true)}>
                  <SlidersHorizontal size={14} className="text-emerald-500" /> Filters
                </button>
                {(selectedBusTypes.length > 0 || selectedDepTimes.length > 0) && (
                  <button className="flex-shrink-0 px-4 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold flex items-center gap-2" onClick={clearAllFilters}>
                    <X size={14} /> Clear {selectedBusTypes.length + selectedDepTimes.length}
                  </button>
                )}
              </div>
              
              <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-sm font-bold mb-6">
                <Info size={16} /> {filteredBuses.length} Services found for your route.
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  // Skeleton Loaders
                  [1, 2, 3].map((item) => (
                    <div key={item} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl h-48 animate-pulse shadow-sm"></div>
                  ))
                ) : (
                  // Actual Buses matching Desktop Aesthetic
                  filteredBuses.map((bus) => (
                    <div key={bus.id} className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-emerald-500/50 transition-all shadow-sm flex flex-col" onClick={() => setSelectedBus(bus)}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">
                            ★ {bus.rating}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-emerald-500 font-bold">
                            <Clock size={14} /> On Time
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500">{bus.brand}</span>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">{bus.name}</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{bus.type}</p>
                      </div>
                      
                      {/* Timeline */}
                      <div className="flex items-center gap-4 py-2 mb-4">
                        <div className="text-center shrink-0">
                          <div className="text-xl font-bold font-outfit text-gray-900 dark:text-white">{bus.departure}</div>
                          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest max-w-[80px] truncate mt-1">{origin || 'Origin'}</div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-2">
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">{bus.duration}</span>
                          <div className="w-full h-px bg-gray-300 dark:bg-white/20 relative">
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-gray-400 dark:border-white/40 bg-white dark:bg-slate-900"></div>
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500 mt-2 tracking-widest uppercase">DIRECT</span>
                        </div>

                        <div className="text-center shrink-0">
                          <div className="text-xl font-bold font-outfit text-gray-900 dark:text-white">{bus.arrival}</div>
                          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest max-w-[80px] truncate mt-1">{destination || 'Destination'}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end pt-4 border-t border-gray-100 dark:border-white/10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500">Starting From</span>
                          <span className="text-2xl font-black font-outfit text-emerald-500">₹{bus.fare}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-full">18 Seats left</span>
                          <button className="bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">Book</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : !isBookingSuccess ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden flex flex-col h-full">
              <div className="p-5 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-outfit">{selectedBus.name}</h3>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{selectedSeats.length} Seats: {selectedSeats.join(', ') || 'None'}</span>
                </div>
                <button className="p-2.5 bg-gray-200 dark:bg-white/5 rounded-xl text-gray-700 dark:text-white active:scale-95" onClick={() => setSelectedSeats([])}>
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="flex justify-center gap-6 p-4 text-xs font-bold text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-emerald-500 rounded"></div> Selected</div>
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-gray-300 dark:bg-slate-700 rounded"></div> Booked</div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-950">
                <div className="border-2 border-gray-200 dark:border-white/10 rounded-3xl p-6 bg-white dark:bg-slate-900 max-w-[280px] mx-auto shadow-inner relative pb-10">
                   <div className="text-right mb-6 text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest border-b border-gray-100 dark:border-slate-800 pb-2">STEERING ☸</div>
                   {renderSeatGrid()}
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Price</span>
                  <span className="text-2xl font-bold text-emerald-500 font-outfit">₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</span>
                </div>
                <button
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all ${selectedSeats.length === 0 ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-emerald-500 text-white active:scale-95 shadow-xl shadow-emerald-500/30'}`}
                  disabled={selectedSeats.length === 0}
                  onClick={() => handleCheckout(selectedBus)}
                >
                  Confirm & Pay ₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-white/10 text-center shadow-2xl mt-8">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Your tickets are confirmed and saved in the <strong>My Tickets</strong> section.</p>
              
              <div className="bg-gray-50 dark:bg-slate-950 rounded-xl p-5 text-left border border-gray-200 dark:border-white/5 shadow-inner mb-8 space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Bus</span><strong className="text-gray-900 dark:text-white text-right">{selectedBus.name}</strong></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Route</span><strong className="text-gray-900 dark:text-white text-right">{origin} → {destination}</strong></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Seats</span><strong className="text-gray-900 dark:text-white text-right">{selectedSeats.join(', ')}</strong></div>
                <div className="flex justify-between border-t border-gray-200 dark:border-white/10 pt-4 text-base"><span className="font-bold text-gray-900 dark:text-white">Total Paid</span><strong className="text-emerald-500 text-lg font-bold">₹{(selectedSeats.length * selectedBus.fare).toLocaleString()}</strong></div>
              </div>

              <button className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform" onClick={() => {
                setIsBookingSuccess(false);
                setSelectedBus(null);
                setSelectedSeats([]);
                setIsSearching(false);
                setHasActivatedWebApp(true);
                setActiveMobileTab('tickets');
              }}>
                View My Boarding Passes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sort Bottom Sheet */}
      {showSortSheet && (
        <div className="absolute inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end" onClick={() => setShowSortSheet(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 animate-fade-in-up border-t border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">Sort By</h3>
              <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 dark:text-gray-400" onClick={() => setShowSortSheet(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {['Relevance', 'Price: Low to High', 'Departure: Earliest First', 'Rating: High to Low'].map(opt => (
                <div key={opt} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 cursor-pointer active:scale-95 transition-transform border border-transparent hover:border-gray-200 dark:hover:border-white/10" onClick={() => { setSortBy(opt); setShowSortSheet(false); }}>
                  <span className={`text-sm font-bold ${sortBy === opt ? 'text-emerald-500' : 'text-gray-700 dark:text-white'}`}>{opt}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sortBy === opt ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    {sortBy === opt && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters Bottom Sheet */}
      {showFilterSheet && (
        <div className="absolute inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end" onClick={() => setShowFilterSheet(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 h-[80vh] flex flex-col animate-fade-in-up border-t border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">Filters</h3>
              <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 dark:text-gray-400" onClick={() => setShowFilterSheet(false)}><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Departure Time</h4>
                <div className="space-y-3">
                  {['Before 6 AM', '6 AM to 12 PM', '12 PM to 6 PM', 'After 6 PM'].map(time => (
                    <label key={time} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                      <span className="text-sm font-medium text-gray-700 dark:text-white">{time}</span>
                      <input type="checkbox" checked={selectedDepTimes.includes(time)} onChange={() => handleCheckboxChange(setSelectedDepTimes, selectedDepTimes, time)} className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900" />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Bus Type</h4>
                <div className="space-y-3">
                  {['AC Sleeper', 'Non-AC Sleeper', 'AC Semi-Sleeper', 'Seater'].map(type => (
                    <label key={type} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                      <span className="text-sm font-medium text-gray-700 dark:text-white">{type}</span>
                      <input type="checkbox" checked={selectedBusTypes.includes(type)} onChange={() => handleCheckboxChange(setSelectedBusTypes, selectedBusTypes, type)} className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900" />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex gap-4 mt-4">
              <button className="flex-1 py-4 font-bold text-gray-700 dark:text-white bg-gray-100 dark:bg-white/5 rounded-xl" onClick={clearAllFilters}>Clear All</button>
              <button className="flex-[2] py-4 font-bold text-white bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30" onClick={() => setShowFilterSheet(false)}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearchResults;
