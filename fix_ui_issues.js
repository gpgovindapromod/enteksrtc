const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf8');

// 1. Fix Navbar floating readability
appJsx = appJsx.replace(
  '"w-full max-w-container-max"',
  '"w-full max-w-container-max bg-black/20 backdrop-blur-md rounded-full border border-white/20 shadow-xl mt-4"'
);
appJsx = appJsx.replace(
  'text-on-surface hover:text-primary',
  'text-white hover:text-primary'
);
// replace multiple occurrences if they exist in the navbar
appJsx = appJsx.replace(/text-on-surface hover:text-primary/g, 'text-white hover:text-primary drop-shadow-md');
appJsx = appJsx.replace(/text-on-surface-variant hover:text-primary/g, 'text-white/80 hover:text-primary drop-shadow-md');


// 2. Fix Hero image overlay for text readability
appJsx = appJsx.replace(
  '<div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90 z-10 pointer-events-none"></div>',
  '<div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80 z-10 pointer-events-none mix-blend-multiply"></div>'
);

// 3. Redesign Footer
const footerStart = appJsx.indexOf('<footer');
const footerEnd = appJsx.indexOf('</footer>', footerStart) + 9;

if (footerStart !== -1 && footerEnd > 8) {
  const newFooter = `
<footer className="bg-slate-900 text-white w-full relative z-10 pt-20 pb-10 mt-20 border-t border-white/10">
  <div className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
      
      {/* Brand Column */}
      <div className="col-span-1 md:col-span-4 pr-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
          <div className="flex flex-col">
            <span className="font-headline-md text-2xl text-white font-black tracking-tight">Ente KSRTC</span>
            <span className="text-xs text-primary uppercase tracking-widest font-bold">Premium Journey</span>
          </div>
        </div>
        <p className="text-white/60 font-body-md text-sm leading-relaxed mb-8">
          Experience the pinnacle of mobility across God's Own Country. We connect communities, empower travelers, and deliver cinematic journeys with unparalleled comfort and safety.
        </p>
        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 shadow-lg">
            <span className="material-symbols-outlined text-sm">public</span>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 shadow-lg">
            <span className="material-symbols-outlined text-sm">share</span>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 shadow-lg">
            <span className="material-symbols-outlined text-sm">mail</span>
          </a>
        </div>
      </div>

      {/* Links Columns */}
      <div className="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Explore
          </h4>
          <ul className="space-y-4">
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Routes</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Fleet</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Offers</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-headline-md text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Support
          </h4>
          <ul className="space-y-4">
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Help Center</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Contact</a></li>
            <li><a className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group" href="#"><span className="material-symbols-outlined text-[10px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all">arrow_forward_ios</span> Grievances</a></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors duration-500"></div>
          <h4 className="font-headline-md text-lg font-bold text-white mb-2 relative z-10">Get the App</h4>
          <p className="text-xs text-white/60 mb-6 relative z-10">Book tickets instantly from your pocket.</p>
          <div className="flex flex-col gap-3 relative z-10">
            <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black py-2 px-4 rounded-xl transition-all text-sm font-bold border border-white/20">
              <span className="material-symbols-outlined text-lg">shop</span> Play Store
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black py-2 px-4 rounded-xl transition-all text-sm font-bold border border-white/20">
              <span className="material-symbols-outlined text-lg">apple</span> App Store
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-xs text-white/40 font-medium">
        &copy; {new Date().getFullYear()} Kerala State Road Transport Corporation. All rights reserved.
      </div>
      <div className="flex items-center gap-6 text-xs text-white/40 font-medium">
        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-primary transition-colors">Accessibility</a>
      </div>
    </div>
  </div>
</footer>
`;
  appJsx = appJsx.substring(0, footerStart) + newFooter + appJsx.substring(footerEnd);
}

fs.writeFileSync(appJsxPath, appJsx);
console.log("Successfully fixed readability and redesigned footer");
