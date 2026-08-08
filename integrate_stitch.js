const fs = require('fs');
const path = require('path');

const appJsxPath = 'c:\\Users\\HP\\Desktop\\B-tech\\S5\\AWT\\project\\EnteKsrtc\\frontend\\src\\App.jsx';
let appJsx = fs.readFileSync(appJsxPath, 'utf8');

const stitchJsxPath = 'temp_jsx.txt';
let stitchJsx = fs.readFileSync(stitchJsxPath, 'utf8');

// The block to replace is from <nav className={`modern-navbar ... to </footer>
const startIndex = appJsx.indexOf('<nav className={`modern-navbar');
const endIndex = appJsx.indexOf('</footer>', startIndex) + 9;

if (startIndex === -1 || endIndex < 9) {
  console.error("Could not find the target replacement block in App.jsx");
  process.exit(1);
}

// We need to inject React state logic into the Stitch JSX before inserting it
// 1. Theme toggle: <span className="material-symbols-outlined">dark_mode</span> -> 
// <span className="material-symbols-outlined" onClick={toggleTheme}>{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
stitchJsx = stitchJsx.replace('<span className="material-symbols-outlined">dark_mode</span>', 
  '<span className="material-symbols-outlined" onClick={toggleTheme}>{theme === "dark" ? "light_mode" : "dark_mode"}</span>');

// 2. Navbar scrolling logic
// container.classList.add('bg-surface/80'...
stitchJsx = stitchJsx.replace(
  '<nav className="fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 py-4" id="navbar">',
  '<nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 ${isScrolled ? "py-2" : "py-4"}`} id="navbar">'
);

stitchJsx = stitchJsx.replace(
  '<div className="flex justify-between items-center px-6 h-20 max-w-container-max mx-auto transition-all duration-500 ease-in-out w-full" id="navbar-container">',
  '<div className={`flex justify-between items-center px-6 h-20 mx-auto transition-all duration-500 ease-in-out ${isScrolled ? "bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border border-white/10 shadow-lg rounded-full max-w-4xl" : "w-full max-w-container-max"}`} id="navbar-container">'
);

// 3. Login Modal trigger
stitchJsx = stitchJsx.replace(
  '<!-- Right Actions -->',
  '{/* Right Actions */}'
);
// wait, we can just replace the manage booking button if it exists, or just add a Login button next to Theme Toggle
stitchJsx = stitchJsx.replace(
  '<div className="cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-300 text-on-surface-variant hover:text-primary">',
  `
    {isUserLoggedIn ? (
      <button className="text-sm font-medium text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-primary/10" onClick={() => setIsUserLoggedIn(false)}>Logout</button>
    ) : (
      <button className="text-sm font-medium bg-primary text-on-primary px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all" onClick={() => setShowLoginModal(true)}>Login</button>
    )}
    <div className="cursor-pointer active:scale-95 hover:scale-105 transition-transform duration-300 text-on-surface-variant hover:text-primary">
  `
);

// 4. Hero Background using heroImages and currentSlide
const heroBgMatch = stitchJsx.match(/style="background-image: url\('([^']+)'\)"/);
if (heroBgMatch) {
  stitchJsx = stitchJsx.replace(
    /<div className="w-full h-full bg-cover bg-center scale-105" style="background-image: url\('[^']+'\)"><\/div>/,
    `
      {heroImages.map((img, index) => (
        <div
          key={index}
          className={\`w-full h-full absolute inset-0 bg-cover bg-center transition-opacity duration-1000 scale-105 \${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}\`}
          style={{ backgroundImage: \`url(\${img})\` }}
        />
      ))}
    `
  );
}

// 5. Booking Widget state binding
stitchJsx = stitchJsx.replace(
  '<input className="bg-transparent border-none w-full text-on-surface font-body-lg text-body-lg focus:ring-0 placeholder:text-outline/50 p-0" placeholder="Departure City" type="text"/>',
  '<input className="bg-transparent border-none w-full text-on-surface font-body-lg text-body-lg focus:ring-0 placeholder:text-outline/50 p-0" placeholder="Departure City" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} />'
);

stitchJsx = stitchJsx.replace(
  '<input className="bg-transparent border-none w-full text-on-surface font-body-lg text-body-lg focus:ring-0 placeholder:text-outline/50 p-0" placeholder="Destination City" type="text"/>',
  '<input className="bg-transparent border-none w-full text-on-surface font-body-lg text-body-lg focus:ring-0 placeholder:text-outline/50 p-0" placeholder="Destination City" type="text" value={destination} onChange={(e) => setDestination(e.target.value)} />'
);

stitchJsx = stitchJsx.replace(
  '<input className="bg-transparent border-none w-full text-on-surface font-body-lg text-body-lg focus:ring-0 p-0 [&::-webkit-calendar-picker-indicator]:invert-[0.8] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer" type="date"/>',
  '<input className="bg-transparent border-none w-full text-on-surface font-body-lg text-body-lg focus:ring-0 p-0 [&::-webkit-calendar-picker-indicator]:invert-[0.8] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer" type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} />'
);

stitchJsx = stitchJsx.replace(
  '<button className="bg-primary-container text-white h-14 px-8 rounded-lg font-headline-md text-headline-md flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] group w-full md:w-auto mt-4 md:mt-0">',
  '<button onClick={() => { setSelectedBus(null); setSelectedSeats([]); setIsBookingSuccess(false); setShowDesktopSearch(true); }} className="bg-primary-container text-white h-14 px-8 rounded-lg font-headline-md text-headline-md flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] group w-full md:w-auto mt-4 md:mt-0">'
);

// 6. Swap Origin/Destination
stitchJsx = stitchJsx.replace(
  '<div className="flex flex-col md:flex-row gap-gutter items-end">',
  `
  <div className="flex flex-col md:flex-row gap-gutter items-end relative">
    <button onClick={() => { const temp = origin; setOrigin(destination); setDestination(temp); }} className="absolute left-[31%] top-8 z-30 bg-surface border border-outline-variant rounded-full p-2 hover:bg-surface-variant transition-colors hidden md:flex" style={{ transform: 'translate(-50%, 0)' }}>
      <span className="material-symbols-outlined text-primary text-sm">swap_horiz</span>
    </button>
  `
);


const newAppJsx = appJsx.substring(0, startIndex) + stitchJsx + appJsx.substring(endIndex);
fs.writeFileSync(appJsxPath, newAppJsx);
console.log("Successfully integrated Stitch layout into App.jsx");
