import React from 'react';

const SeatGrid = ({ seatGridData, selectedSeats, setSelectedSeats, seatSizeClass = 'w-10 h-10', textClass = 'text-xs', gapClass = 'gap-2 mb-2' }) => {
  return (
    <>
      {seatGridData.map((row) => (
        <div key={row.rowId} className={`flex justify-center ${gapClass}`}>
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
                    setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatLabel));
                  } else {
                    setSelectedSeats([...selectedSeats, seat.seatLabel]);
                  }
                }}
                className={`${seatSizeClass} rounded-lg border ${seatBorder} ${seatBg} ${seatColor} font-bold ${textClass} flex items-center justify-center transition-colors ${
                  seat.isBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500'
                }`}
              >
                {seat.seatLabel}
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default SeatGrid;
