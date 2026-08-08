import React from 'react';
import Masonry from '../Masonry';

const GallerySection = React.memo(({ images }) => (
  <section className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Gallery</div>
      <h2 className="text-3xl font-black font-outfit text-slate-900 dark:text-white mb-8">KSRTC Moments</h2>
      <div className="relative">
        <Masonry
          items={images}
          ease="power3.out"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover={true}
          hoverScale={1.05}
          blurToFocus={true}
          colorShiftOnHover={false}
        />
      </div>
    </div>
  </section>
));

export default GallerySection;
