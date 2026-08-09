import React from 'react';

const DestinationsSection = React.memo(({ destinations }) => (
  <section className="py-16 bg-transparent transition-colors">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Destinations</div>
      <h2 className="text-3xl font-black font-outfit text-slate-900 dark:text-white mb-8">Popular Destinations from <span className="text-emerald-500">Trivandrum</span></h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {destinations.map((dest, idx) => (
          <div key={idx} className="relative w-48 h-64 shrink-0 rounded-2xl overflow-hidden group snap-start cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
            <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" width="300" height="200" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg drop-shadow-md">{dest.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

export default DestinationsSection;
