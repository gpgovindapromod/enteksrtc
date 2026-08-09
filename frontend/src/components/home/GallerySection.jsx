import React from 'react';
import Masonry from '../Masonry';
import BorderGlow from '../BorderGlow';

const GallerySection = React.memo(({ images }) => (
  <section className="py-24 bg-transparent transition-colors relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 z-0"></div>
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">Gallery</div>
        <h2 className="text-4xl md:text-5xl font-black font-outfit text-slate-900 dark:text-white mb-4">KSRTC Moments</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Discover the beauty of Kerala through our premium fleet and breathtaking routes.</p>
      </div>
      
      <BorderGlow 
        glowColor="158 91 39" 
        colors={['#059669', '#10b981', '#34d399']} 
        backgroundColor="transparent"
        borderRadius={32} 
        glowRadius={40} 
        animated={true}
      >
        <div className="glass-panel rounded-[32px] p-4 md:p-8 relative z-10">
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
      </BorderGlow>
    </div>
  </section>
));

export default GallerySection;
