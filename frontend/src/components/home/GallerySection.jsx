import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Camera, MapPin, Maximize2, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Moments' },
  { id: 'scenic', label: 'Scenic Ghats' },
  { id: 'coastal', label: 'Coastal & Heritage' },
  { id: 'fleet', label: 'Premium Fleet' },
];

const GallerySection = React.memo(({ images = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredImages = useMemo(() => {
    if (activeFilter === 'all') return images;
    return images.filter(img => img.category === activeFilter);
  }, [images, activeFilter]);

  const currentIndex = useMemo(() => {
    if (!selectedPhoto) return -1;
    return filteredImages.findIndex(img => img.id === selectedPhoto.id);
  }, [filteredImages, selectedPhoto]);

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < filteredImages.length - 1) {
      setSelectedPhoto(filteredImages[currentIndex + 1]);
    } else if (filteredImages.length > 0) {
      setSelectedPhoto(filteredImages[0]);
    }
  }, [currentIndex, filteredImages]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedPhoto(filteredImages[currentIndex - 1]);
    } else if (filteredImages.length > 0) {
      setSelectedPhoto(filteredImages[filteredImages.length - 1]);
    }
  }, [currentIndex, filteredImages]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, handleNext, handlePrev]);

  return (
    <section className="py-24 bg-transparent text-slate-900 dark:text-white relative overflow-hidden transition-colors">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Curated Visual Journey
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-outfit tracking-tight mb-4 text-slate-900 dark:text-white">
            Kerala in Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 dark:from-emerald-400 dark:via-teal-300 dark:to-green-400">Frame</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
            From the misty curves of the Western Ghats to sun-drenched backwaters — glimpse the incredible routes and heritage behind every KSRTC journey.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-8">
            {CATEGORIES.map((cat) => {
              const count = cat.id === 'all' 
                ? images.length 
                : images.filter(img => img.category === cat.id).length;
              const isActive = activeFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-400 shadow-lg shadow-emerald-600/25 dark:shadow-emerald-500/25 scale-105'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-black/25 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento / Asymmetric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-[240px] md:auto-rows-[280px]">
          {filteredImages.map((item, index) => {
            // Apply editorial spans to create an asymmetric bento layout
            const isFeatured = item.featured || index === 0;
            const spanClass = isFeatured
              ? 'sm:col-span-2 sm:row-span-2'
              : (index % 5 === 2)
              ? 'lg:col-span-2'
              : '';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-slate-900/60 shadow-lg dark:shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/40 ${spanClass}`}
              >
                {/* Background Image with smooth hover zoom */}
                <img
                  src={item.img}
                  alt={item.title || 'KSRTC Moment'}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Dark Vignette Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20 opacity-80 group-hover:opacity-90 transition-opacity"></div>

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  {item.tag && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-black/50 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                      {item.tag}
                    </span>
                  )}
                </div>

                {/* Top Right Quick Expand Icon */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Content Info */}
                <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 z-10 transition-transform duration-300">
                  <h3 className={`font-bold font-outfit text-white leading-snug group-hover:text-emerald-300 transition-colors ${
                    isFeatured ? 'text-2xl md:text-3xl mb-1.5' : 'text-lg md:text-xl mb-1'
                  }`}>
                    {item.title || 'KSRTC Express'}
                  </h3>

                  {item.location && (
                    <p className="flex items-center gap-1.5 text-xs md:text-sm text-slate-300/90 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Subtext */}
        <div className="mt-12 text-center flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
          <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Click any photograph to view in full resolution</span>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center bg-slate-950/80 border border-white/15 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-emerald-500 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Nav Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-emerald-500 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-emerald-500 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Full-size Image Container */}
            <div className="w-full flex-1 min-h-[300px] max-h-[70vh] flex items-center justify-center bg-black/40 overflow-hidden p-2">
              <img
                src={selectedPhoto.img}
                alt={selectedPhoto.title || 'Gallery Preview'}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Metadata Footer */}
            <div className="w-full p-6 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {selectedPhoto.tag && (
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {selectedPhoto.tag}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Photo {currentIndex + 1} of {filteredImages.length}
                  </span>
                </div>
                <h4 className="text-2xl font-bold font-outfit text-white">
                  {selectedPhoto.title}
                </h4>
                {selectedPhoto.location && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-300 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{selectedPhoto.location}</span>
                  </p>
                )}
              </div>

              <div className="text-xs text-slate-500">
                Use <kbd className="px-2 py-1 rounded bg-white/10 text-slate-300 font-mono">←</kbd> <kbd className="px-2 py-1 rounded bg-white/10 text-slate-300 font-mono">→</kbd> keys or navigation buttons
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

export default GallerySection;
