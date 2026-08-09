import React from 'react';

const Marquee = () => {
  return (
    <div className="w-full bg-primary/5 border-y border-primary/10 py-8 overflow-hidden relative flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent dark:from-slate-950 dark:via-transparent z-10 w-32 pointer-events-none left-0"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-white via-transparent to-transparent dark:from-slate-950 dark:via-transparent z-10 w-32 pointer-events-none right-0 ml-auto"></div>
      
      <div className="flex whitespace-nowrap animate-marquee">
        {/* We repeat the items enough times to fill the screen and allow seamless scrolling */}
        {[...Array(16)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 mx-8 shrink-0">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
            <span className="font-outfit text-3xl font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-80">Ente KSRTC</span>
            <span className="w-2 h-2 rounded-full bg-primary/30 mx-6"></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
