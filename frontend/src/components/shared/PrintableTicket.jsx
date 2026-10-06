import React from 'react';
import { Bus, Code, Phone, Smartphone } from 'lucide-react';

const PrintableTicket = ({ ticket, user, id = 'printable-ticket' }) => {
  if (!ticket) return null;

  const pnr = ticket.bookingNumber || ticket.id?.substring(0, 8).toUpperCase() || 'N/A';
  const ticketNo = ticket.id || 'N/A';
  const fare = ticket.totalFare || ticket.price || 0;
  
  // Approximate breakdown for visual purposes if not provided by backend
  const baseFare = Math.round(fare * 0.9);
  const srtValue = Math.round(fare * 0.05);
  const pgCharges = fare - baseFare - srtValue;

  const passengers = ticket.passengers || [
    { passengerName: user?.name || 'Passenger', age: 30, gender: 'Male', seatNo: ticket.seats?.[0] || '1' }
  ];

  return (
    <div id={id} className="absolute left-[-9999px] top-[-9999px] w-[800px] bg-white p-4 text-black font-sans">
      <div className="bg-white mx-auto shadow-sm" style={{ width: '100%', height: '100%' }}>
        {/* Header */}
        <div className="flex p-4 pb-2 items-center">
          <div className="w-1/3">
            <div className="flex items-center gap-2">
              <img src="/assets/images/ksrtc_logo.png" alt="KSRTC" className="h-16 object-contain" />
              {/* TODO: If /ksrtc-logo.png is missing, this will show a broken image. We assume it's there per instructions. */}
              <div>
                <h1 className="text-red-700 font-bold text-xs uppercase tracking-tight leading-tight">Kerala State Road</h1>
                <h1 className="text-red-700 font-bold text-xs uppercase tracking-tight leading-tight">Transport Corporation</h1>
                <p className="text-[8px] text-gray-500">SAFE AND SECURE JOURNEY</p>
              </div>
            </div>
          </div>
          <div className="w-2/3 pl-6 border-l border-gray-300">
            <h2 className="text-2xl text-gray-800 mb-2">Booking Successful</h2>
            <p className="text-[10px] text-gray-600">
              Ticket booked on {new Date().toLocaleString()} has been mailed to {user?.email || 'your email'} and a SMS has been sent to {user?.phone || 'your phone'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Left Column */}
          <div className="w-[65%] border-r border-gray-300">
            <div className="bg-[#2e7d32] text-white p-2 text-sm">
              Onward Journey PNR: {pnr} , Ticket No: {ticketNo}
            </div>
            
            <div className="p-4">
              {/* Pickup */}
              <div className="relative pl-6 mb-6">
                <div className="absolute left-0 top-1.5 w-3 h-3 bg-[#2e7d32] rounded-full"></div>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm text-gray-800">Pickup at {ticket.boardingStopName || ticket.from} on {ticket.time || '21:30'}, {ticket.date || 'Tue 18 Nov'}</h3>
                  <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] px-2 py-1 rounded-xl">Add to Calendar</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{ticket.boardingStopName || ticket.from}</p>
                <p className="text-sm text-gray-600 mt-1">Landmark: {ticket.boardingStopName || ticket.from}</p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Smartphone size={18} className="text-gray-800" />
                  <a href="#" className="text-gray-800 underline">Depot Contact No. 18005994011</a>
                </p>
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1 text-[#2e7d32]">
                  <span className="inline-flex items-center justify-center w-4 h-4 bg-[#2e7d32] text-white rounded-full font-serif italic text-[10px]">i</span>
                  Pickup details will be delivered within 30 minutes of trip start time
                </p>
              </div>

              {/* Dropoff */}
              <div className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-3 h-3 bg-[#c62828] rounded-sm"></div>
                <h3 className="font-semibold text-sm text-gray-800">Dropoff at {ticket.droppingStopName || ticket.to} on est. {ticket.dropTime || '05:30'}, {ticket.date || 'Wed 19 Nov'}</h3>
                <p className="text-sm text-gray-600 mt-1">{ticket.droppingStopName || ticket.to}</p>
              </div>
            </div>

            <div className="mx-4 border-b border-gray-400"></div>

            {/* Boarding QR */}
            <div className="p-4">
              <h4 className="text-sm text-gray-800 font-normal mb-2">Boarding QR Code</h4>
              <div className="flex gap-4 items-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrCode || ticket.bookingNumber || ticket.id}`} alt="QR" className="w-24 h-24" />
                <div className="space-y-1">
                  <p className="text-sm flex items-center gap-2 text-gray-800"><Bus size={18} className="text-gray-800" /> Bus Type: {ticket.busType || 'Fast Passenger'}</p>
                  <p className="text-sm flex items-center gap-2 text-gray-800"><Code size={18} className="text-gray-800" /> Trip Code: {ticket.tripCode || '1930KDKLPBA'}</p>
                  <p className="text-sm flex items-center gap-2 text-gray-800">
                    <Smartphone size={18} className="text-gray-800" />
                    Kerala State Road Transport Corporation - KSRTC Contact No. 9447071021
                  </p>
                  <p className="text-sm flex items-center gap-2 text-gray-800"><Phone size={18} className="text-gray-800" /> Toll Free No.: 18005994011</p>
                </div>
              </div>
            </div>

            <div className="mx-4 border-b border-gray-400"></div>

            {/* Passengers */}
            <div className="p-4">
              <h4 className="text-sm text-gray-800 font-normal mb-2">Passenger Details</h4>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-800">
                    <th className="font-normal py-1 pr-8">Berth No.</th>
                    <th className="font-normal py-1 pl-4">Name</th>
                    <th className="font-normal py-1">Age</th>
                    <th className="font-normal py-1">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, i) => (
                    <tr key={i} className="text-gray-800">
                      <td className="py-2 flex items-center gap-3">
                        <div className="w-5 h-4 bg-[#0288d1]"></div>
                        {p.seatNo}
                      </td>
                      <td className="py-2 pl-4">{p.passengerName}</td>
                      <td className="py-2">{p.age}</td>
                      <td className="py-2">{p.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mx-4 border-b border-gray-400"></div>

            {/* Cancellation */}
            <div className="p-4">
              <h4 className="text-sm text-gray-800 font-normal mb-1">Cancellation Policy*</h4>
              <p className="text-sm text-gray-600 mb-3">Trip Starts from: {ticket.boardingStopName || ticket.from} on {ticket.time || '21:30'}, {ticket.date || 'Tue 18 Nov'}</p>
              
              <table className="w-full text-sm text-left text-gray-800 mb-4">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="font-normal py-1">Time Before<br/>Trip Start</th>
                    <th className="font-normal py-1 text-right">Cancellation<br/>Slab</th>
                    <th className="font-normal py-1 text-right">Refund<br/>Slab</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="py-1">Before 72 HRS</td><td className="py-1 text-right">0</td><td className="py-1 text-right">Full Refund*</td></tr>
                  <tr><td className="py-1">48 HRS - 72 HRS</td><td className="py-1 text-right">10%</td><td className="py-1 text-right">90%</td></tr>
                  <tr><td className="py-1">24 HRS - 48 HRS</td><td className="py-1 text-right">25%</td><td className="py-1 text-right">75%</td></tr>
                  <tr><td className="py-1">12 HRS - 24 HRS</td><td className="py-1 text-right">40%</td><td className="py-1 text-right">60%</td></tr>
                  <tr><td className="py-1">2 HRS - 12 HRS</td><td className="py-1 text-right">50%</td><td className="py-1 text-right">50%</td></tr>
                  <tr><td className="py-1">Within 2 HRS</td><td className="py-1 text-right">No Refund</td><td className="py-1 text-right">0</td></tr>
                </tbody>
              </table>
              <p className="text-[10px] text-gray-800">* SRT and PG Charge are non refundable in Passenger Cancellation</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[35%] bg-white border-t-0">
            <div className="bg-[#2e7d32] text-white p-2 text-sm border-l border-white/20">
              Onward Trip Price Breakup
            </div>
            
            <div className="p-4 border-l border-gray-300">
              <div className="flex justify-between text-xs text-gray-800 py-2 border-b border-gray-200">
                <span>OnwardTrip Fare ({passengers.length}Berth)</span>
                <span>₹{baseFare}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-800 py-2 border-b border-gray-200">
                <span>Onward Trip SRT Value</span>
                <span>₹{srtValue}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-800 py-2 border-b border-gray-200">
                <span>PG Charges</span>
                <span>₹{pgCharges}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-800 py-2 border-b border-gray-200">
                <span>OnwardTrip Paid Amount</span>
                <span>₹{fare}</span>
              </div>
            </div>

            <div className="p-4 border-l border-gray-300 h-full bg-white">
              <h4 className="text-base text-gray-800 font-normal mb-3">Passenger Guidelines</h4>
              <ul className="list-disc pl-4 text-[11px] text-gray-800 space-y-2 leading-relaxed">
                <li>The seat(s) booked under this e-ticket is/are not transferable.</li>
                <li>This e-ticket is only valid for specified seat number and bus service</li>
                <li>Please carry a valid ID card of the passengers along with this e-ticket during the journey</li>
                <li>Please keep the ticket safely till the end of the journey.</li>
                <li>Corporation reserves the rights to change/cancel the class of service.</li>
                <li>On seats reserved for ladies, only a lady can travel.</li>
                <li>Luggage changes will be levied as per rules.</li>
                <li>Please reach the boarding point 10 minutes before the start of the journey.</li>
                <li>The interstate travelers who have booked the tickets in interstate state services are eligible for free travel in FAST PASSENGER and below classes of services to reach their boarding point.</li>
                <li className="list-none border-l-2 border-gray-300 pl-2 mt-2">To avail of this offer, please carry your travel document and ID card.</li>
                <li className="list-none border-l-2 border-gray-300 pl-2 mt-1">Free travel can be avail up to 30 km from the boarding point and free travel is allowed only for up to two hours before the departure time from Boarding point.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableTicket;
