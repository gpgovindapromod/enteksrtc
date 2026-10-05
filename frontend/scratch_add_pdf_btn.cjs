const fs = require('fs');

// --- DESKTOP ---
{
  const file = 'src/components/desktop/DesktopSearchResults.jsx';
  let c = fs.readFileSync(file, 'utf8');

  // Add Download import if not there
  if (!c.includes('Download')) {
    c = c.replace(
      "Moon, Sun } from 'lucide-react';",
      "Moon, Sun, Download } from 'lucide-react';"
    );
  }
  // Add pdfUtils import if not there
  if (!c.includes("pdfUtils")) {
    c = c.replace(
      "import { useBookingStore } from '../../store/useBookingStore';",
      "import { useBookingStore } from '../../store/useBookingStore';\nimport { downloadTicketPDF } from '../../utils/pdfUtils';"
    );
  }
  // Add id to the ticket summary div
  c = c.replace(
    'className="max-w-md mx-auto mb-8 p-6 bg-gray-50 dark:bg-slate-950 rounded-2xl text-left border border-gray-200 dark:border-white/5 shadow-inner space-y-3 text-sm"',
    'id="desktop-ticket-summary" className="max-w-md mx-auto mb-8 p-6 bg-gray-50 dark:bg-slate-950 rounded-2xl text-left border border-gray-200 dark:border-white/5 shadow-inner space-y-3 text-sm"'
  );
  // Replace "View My Boarding Passes" button with two-button row
  const oldButton = `                  <button
                    onClick={() => {
                      setIsBookingSuccess(false);
                      setSelectedBus(null);
                      setSelectedSeats([]);
                      setShowDesktopTicketsModal(true);
                    }}
                    className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
                  >
                    View My Boarding Passes
                  </button>`;
  const newButtons = `                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
                    <button
                      onClick={() => downloadTicketPDF('desktop-ticket-summary', \`KSRTC-Ticket-\${confirmed?.bookingNumber || 'booking'}.pdf\`)}
                      className="px-8 py-4 bg-slate-700 dark:bg-white/10 text-white rounded-xl font-bold text-base hover:scale-105 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                      <Download size={18} /> Download PDF
                    </button>
                  </div>`;
  c = c.replace(oldButton, newButtons);
  fs.writeFileSync(file, c);
  console.log('Desktop: PDF button added');
}

// --- MOBILE ---
{
  const file = 'src/components/mobile/MobileSearchResults.jsx';
  let c = fs.readFileSync(file, 'utf8');

  // Add imports
  if (!c.includes('Download')) {
    c = c.replace(
      "Clock } from 'lucide-react';",
      "Clock, Download } from 'lucide-react';"
    );
  }
  if (!c.includes("pdfUtils")) {
    const lastImport = "import SeatGrid from '../shared/SeatGrid';";
    c = c.replace(
      lastImport,
      lastImport + "\nimport { downloadTicketPDF } from '../../utils/pdfUtils';"
    );
  }
  // Add id to the booking summary div
  c = c.replace(
    'className="bg-gray-50 dark:bg-slate-950 rounded-xl p-5 text-left border border-gray-200 dark:border-white/5 shadow-inner mb-8 space-y-4 text-sm"',
    'id="mobile-ticket-summary" className="bg-gray-50 dark:bg-slate-950 rounded-xl p-5 text-left border border-gray-200 dark:border-white/5 shadow-inner mb-8 space-y-4 text-sm"'
  );
  // Replace "View My Boarding Passes" with two-button layout
  const oldButton = `              <button className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform" onClick={() => {
                setIsBookingSuccess(false);
                setSelectedBus(null);
                setSelectedSeats([]);
                setIsSearching(false);
                setHasActivatedWebApp(true);
                setActiveMobileTab('tickets');
              }}>
                View My Boarding Passes
              </button>`;
  const newButtons = `              <div className="flex flex-col gap-3">
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
                <button
                  className="w-full bg-slate-800 dark:bg-white/10 text-white font-bold py-4 rounded-xl border border-white/10 active:scale-95 transition-transform flex items-center justify-center gap-2"
                  onClick={() => downloadTicketPDF('mobile-ticket-summary', 'KSRTC-Ticket.pdf')}
                >
                  <Download size={18} /> Download PDF
                </button>
              </div>`;
  c = c.replace(oldButton, newButtons);
  fs.writeFileSync(file, c);
  console.log('Mobile: PDF button added');
}
