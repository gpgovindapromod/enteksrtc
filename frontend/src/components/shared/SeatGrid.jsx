import React from 'react';
import { CircleDot } from 'lucide-react'; // For steering wheel

const SeatGrid = ({ seatGridData, selectedSeats, setSelectedSeats, seatSizeClass = 'w-10 h-10', textClass = 'text-xs', gapClass = 'gap-2 mb-2' }) => {
  return (
    <div className="flex flex-col">
      {seatGridData.map((row) => (
        <div key={row.rowId} className={`flex ${row.rowId === 'row-3' ? 'my-4' : gapClass}`}>
          {row.seats.map((seat) => {
            if (seat.isDriver) {
              return (
                <div key={seat.key} className={`${seatSizeClass} rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500`} title="Driver">
                  <CircleDot size={20} />
                </div>
              );
            }
            if (seat.isEmpty || seat.isAisle) {
              return <div key={seat.key} className={`${seatSizeClass}`}></div>;
            }

            const isSelected = selectedSeats.includes(seat.seatLabel);
            let seatBg = 'bg-white dark:bg-slate-800';
            let seatColor = 'text-slate-700 dark:text-white';
            let seatBorder = 'border-slate-200 dark:border-slate-700';

            if (seat.isBooked) {
              seatBg = 'bg-slate-200 dark:bg-slate-800/50';
              seatColor = 'text-slate-400 dark:text-slate-600';
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
                    setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatLabel));
                  } else {
                    setSelectedSeats([...selectedSeats, seat.seatLabel]);
                  }
                }}
                className={`${seatSizeClass} relative overflow-hidden rounded-md border ${seatBorder} ${seatBg} ${seatColor} font-bold ${textClass} flex flex-col items-center justify-center transition-colors ${
                  seat.isBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500 shadow-sm'
                }`}
                title={`Seat ${seat.seatLabel}`}
              >
                {seat.isBooked ? 'Sold' : seat.seatLabel}
                {!seat.isBooked && (
                  <div className={`absolute right-0 top-0 bottom-0 w-1 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SeatGrid;
