import React from 'react';
import { ArrowLeft, ChevronRight, Quote, User } from 'lucide-react';

const TestimonialsSection = React.memo(({ testimonials }) => {
  const scrollContainerRef = React.useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-transparent transition-colors relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Testimonial</div>
            <h2 className="text-3xl md:text-4xl font-black font-outfit text-slate-900 dark:text-white">Client Feedback</h2>
          </div>
          {/* Navigation Buttons for Desktop */}
          <div className="hidden md:flex gap-3">
            <button 
              onClick={scrollLeft}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full w-12 h-12 flex items-center justify-center shadow-sm text-emerald-500 hover:scale-105 active:scale-95 transition-all"
              aria-label="Previous testimonials"
            >
              <ArrowLeft size={24} />
            </button>
            <button 
              onClick={scrollRight}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full w-12 h-12 flex items-center justify-center shadow-sm text-emerald-500 hover:scale-105 active:scale-95 transition-all"
              aria-label="Next testimonials"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
        >
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="w-[85vw] md:w-[400px] shrink-0 snap-center">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-3xl p-8 h-full shadow-sm relative group hover:shadow-xl transition-all flex flex-col">
                <Quote className="absolute top-6 right-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors" size={64} />
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-8 relative z-10 text-base md:text-lg leading-relaxed flex-1">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 mt-auto relative z-10">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white font-outfit">{testimonial.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Traveller</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default TestimonialsSection;
