const fs = require('fs');
const file = 'C:\\Users\\HP\\Desktop\\B-tech\\S5\\AWT\\project\\EnteKsrtc\\frontend\\src\\components\\desktop\\dashboards\\PassengerDashboardWidgets.jsx';

let lines = fs.readFileSync(file, 'utf8').split('\n');

const newModalLines = `      {/* Ticket Details Modal */}
      {expandedTicketId !== null && recentTrips[expandedTicketId] && (() => {
        const trip = recentTrips[expandedTicketId];
        const isCancelled = trip.bookingStatus === 'CANCELLED';
        
        // Helper to format date just in case
        const safeFormatDate = (dateStr) => {
          if (!dateStr) return '';
          try {
            return new Intl.DateTimeFormat('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }).format(new Date(dateStr));
          } catch (e) {
            return dateStr;
          }
        };

        return (
          <div className="fixed inset-0 z-[99990] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setExpandedTicketId(null)}>
            {/* The Ticket Itself */}
            <div className={\`relative max-w-4xl w-full flex flex-col md:flex-row transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl \${isCancelled ? 'opacity-80 grayscale' : ''}\`} onClick={e => e.stopPropagation()}>
              
              {/* Left Main Section (Route & Passengers) */}
              <div className="bg-white dark:bg-slate-50 w-full md:w-2/3 p-0 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden relative">
                
                {/* Header Strip */}
                <div className="bg-red-700 text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-700 text-xs font-bold shadow-sm">KSRTC</div>
                    <div>
                      <h2 className="font-bold text-sm leading-tight tracking-wide">KERALA STATE ROAD</h2>
                      <h2 className="font-bold text-sm leading-tight tracking-wide">TRANSPORT CORPORATION</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-red-100 uppercase tracking-widest">E-Ticket</div>
                    <div className="font-bold text-lg">{trip.bookingNumber || trip.id?.substring(0, 8).toUpperCase() || 'N/A'}</div>
                  </div>
                </div>

                {/* Sub Header */}
                <div className="bg-[#2e7d32] text-white px-6 py-2 flex justify-between items-center text-xs font-semibold">
                  <span>{trip.busType || 'Fast Passenger'}</span>
                  <span>Trip Code: {trip.tripCode || 'N/A'}</span>
                </div>

                {/* Body Content */}
                <div className="p-8">
                  {/* Route Timeline */}
                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 mb-8">
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-[#2e7d32] rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                      <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Boarding</h3>
                      <p className="text-xl font-bold text-slate-900">{trip.boardingStopName || trip.from || 'Origin'}</p>
                      <p className="text-sm text-slate-600 font-medium">{trip.time || '21:30'} • {safeFormatDate(trip.date)}</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-red-500 rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                      <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Dropping</h3>
                      <p className="text-xl font-bold text-slate-900">{trip.droppingStopName || trip.to || 'Destination'}</p>
                      <p className="text-sm text-slate-600 font-medium">Est. {trip.dropTime || '05:30'} • {safeFormatDate(trip.date)}</p>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Passenger Details</h3>
                    <div className="space-y-3">
                      {(trip.passengers && trip.passengers.length > 0) ? trip.passengers.map((p, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-bold text-slate-900">{p.passengerName}</p>
                            <p className="text-xs text-slate-500">{p.age} Yrs • {p.gender}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 uppercase font-bold">Seat</span>
                            <p className="font-bold text-[#2e7d32] text-lg">{p.seatNo}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="flex justify-between items-center">
                           <div>
                            <p className="font-bold text-slate-900">{user?.name || 'Passenger'}</p>
                            <p className="text-xs text-slate-500">Adult</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 uppercase font-bold">Seats</span>
                            <p className="font-bold text-[#2e7d32] text-lg">{trip.seats?.join(', ') || 'N/A'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Perforation Divider (Desktop only) */}
              <div className="hidden md:flex flex-col items-center justify-between w-4 bg-slate-100 relative">
                 <div className="w-6 h-6 bg-slate-900/60 rounded-full absolute -top-3 left-1/2 -translate-x-1/2"></div>
                 <div className="w-[2px] h-full border-l-2 border-dashed border-slate-300"></div>
                 <div className="w-6 h-6 bg-slate-900/60 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2"></div>
              </div>

              {/* Right Sidebar Section (QR & Fare) */}
              <div className="bg-slate-100 dark:bg-slate-200 w-full md:w-1/3 p-8 flex flex-col justify-between rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">
                
                {/* Close Button Mobile/Desktop absolute */}
                <button onClick={() => setExpandedTicketId(null)} className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-slate-600 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                <div>
                  <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-6 text-center">Boarding Pass QR</h3>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 w-48 h-48 mx-auto cursor-pointer hover:shadow-md transition-shadow" onClick={() => { if(!isCancelled) setQrPopup(trip.qrCode || trip.id); }}>
                    <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${trip.qrCode || trip.bookingNumber || trip.id}\`} alt="QR Code" className={\`w-full h-full \${isCancelled ? 'opacity-30 grayscale' : ''}\`} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-widest text-center">Click to Enlarge</p>
                </div>

                <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-300">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Fare</p>
                      <p className="text-3xl font-black text-[#2e7d32] tracking-tight">₹{trip.totalFare}</p>
                    </div>
                    <div className={\`px-3 py-1 rounded-full text-xs font-bold \${trip.bookingStatus === 'Confirmed' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-red-100 text-red-700'}\`}>
                      {trip.bookingStatus}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {trip.id && !isCancelled && (
                      <>
                        <button
                          onClick={() => downloadTicketPDF(trip, user, 'KSRTC_Ticket_' + (trip.bookingNumber || trip.id) + '.pdf')}
                          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Download PDF
                        </button>
                        <button 
                          onClick={async () => {
                            if(window.confirm('Are you sure you want to cancel this ticket?')) {
                              try {
                                await cancelBooking(trip._id);
                                alert('Booking cancelled');
                                getMyBookings().then(setActiveBookings);
                                setExpandedTicketId(null);
                              } catch (error) {
                                alert('Cancel failed');
                              }
                            }
                          }}
                          className="w-full py-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-bold transition-colors text-sm"
                        >
                          Cancel Ticket
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}`.split('\n');

// Replace lines 144 to 251 (0-indexed line 144 to line 251 inclusive)
// That's 144 to 252 for slice.
const before = lines.slice(0, 144);
const after = lines.slice(252);
lines = [...before, ...newModalLines, ...after];

// Also add imports
if (!lines.find(l => l.includes('import { downloadTicketPDF }'))) {
  lines.splice(6, 0, "import { downloadTicketPDF } from '../../../utils/pdfUtils';");
  lines.splice(7, 0, "import { useAuthStore } from '../../../store/useAuthStore';");
  
  // replace lucide import
  for(let i=0; i<10; i++) {
    if (lines[i].includes('Ticket } from')) {
      lines[i] = lines[i].replace("Ticket }", "Ticket, Download }");
    }
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log("Replaced perfectly");
