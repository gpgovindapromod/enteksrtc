const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf8');

// Fix Navbar
appJsx = appJsx.replace(
  'isScrolled ? "bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border border-white/10',
  'isScrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10'
);

// Fix Booking Widget
appJsx = appJsx.replace(
  'className="bg-surface-container/60 backdrop-blur-[24px] border border-white/10 rounded-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"',
  'className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-[24px] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"'
);

// Also fix the tabs border inside widget
appJsx = appJsx.replace(
  '<div className="flex gap-8 mb-6 border-b border-white/10 pb-2">',
  '<div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-white/10 pb-2">'
);

fs.writeFileSync(appJsxPath, appJsx);
console.log("Successfully fixed navbar and widget transparency");
