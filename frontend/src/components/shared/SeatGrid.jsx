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
            const isHeld = seat.status === 'HELD';
            // If the seat is held and is in the user's active selectedSeats, keep it selectable/selected for that user
            const isBooked = seat.isBooked && !isSelected;

            let seatBg = 'bg-white dark:bg-slate-800';
            let seatColor = 'text-slate-700 dark:text-white';
            let seatBorder = 'border-slate-200 dark:border-slate-700';

            if (isSelected) {
              seatBg = 'bg-emerald-500';
              seatColor = 'text-white';
              seatBorder = 'border-emerald-500';
            } else if (isBooked) {
              if (isHeld) {
                seatBg = 'bg-amber-100 dark:bg-amber-950/40';
                seatColor = 'text-amber-700 dark:text-amber-400';
                seatBorder = 'border-amber-300 dark:border-amber-700/60';
              } else {
                seatBg = 'bg-slate-200 dark:bg-slate-800/50';
                seatColor = 'text-slate-400 dark:text-slate-600';
                seatBorder = 'border-transparent';
              }
            }

            const seatText = isSelected
              ? seat.seatLabel
              : isBooked
              ? (isHeld ? 'Held' : 'Sold')
              : seat.seatLabel;

            return (
              <button
                key={seat.seatId}
                disabled={isBooked}
                onClick={() => {
                  if (isSelected) {
                    setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatLabel));
                  } else {
                    setSelectedSeats([...selectedSeats, seat.seatLabel]);
                  }
                }}
                className={`${seatSizeClass} relative overflow-hidden rounded-md border ${seatBorder} ${seatBg} ${seatColor} font-bold ${textClass} flex flex-col items-center justify-center transition-colors ${
                  isBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500 shadow-sm'
                }`}
                title={`Seat ${seat.seatLabel}${isHeld ? ' (Held)' : isBooked ? ' (Sold)' : ''}`}
              >
                {seatText}
                {!isBooked && (
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
