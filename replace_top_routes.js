const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf8');

const startTag = '{/*  Top Routes  */}';
const endTag = '{/*  Popular Destinations Grid  */}';

const startIndex = appJsx.indexOf(startTag);
const endIndex = appJsx.indexOf(endTag, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find tags");
  process.exit(1);
}

const newTopRoutes = `
{/*  Top Routes  */}
<section className="max-w-container-max mx-auto px-edge-margin-mobile md:px-edge-margin-desktop py-stack-xl">
  <div className="flex justify-between items-end mb-stack-lg">
    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold">Top Routes</h2>
    <a className="text-primary hover:text-primary-fixed flex items-center gap-1 transition-colors" href="#">View All <span className="material-symbols-outlined text-sm">chevron_right</span></a>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
    {TopRoutes.map((route, idx) => (
      <div key={idx} className="bg-white dark:bg-surface-container-low/40 border border-outline-variant dark:border-white/5 rounded-xl overflow-hidden hover:shadow-xl dark:hover:bg-surface-container/60 transition-all duration-300 cursor-pointer group hover:-translate-y-1 flex flex-col shadow-sm">
        <div className="h-40 w-full overflow-hidden relative">
          <img src={route.img} alt={\`\${route.from} to \${route.to}\`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-3 left-3 text-white text-xs font-bold px-2.5 py-1 bg-primary/90 rounded-md shadow-md backdrop-blur-sm">
            {route.duration}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-transparent">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="font-headline-md text-body-lg font-bold text-on-surface">{route.from}</span>
            </div>
            <span className="material-symbols-outlined text-primary/70 group-hover:text-primary transition-colors">arrow_right_alt</span>
            <div className="flex flex-col text-right">
              <span className="font-headline-md text-body-lg font-bold text-on-surface">{route.to}</span>
            </div>
          </div>
          <div className="flex justify-between items-end pt-4 border-t border-outline-variant dark:border-white/5 mt-auto">
            <div className="flex flex-col">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Starting from</span>
              <span className="font-headline-md text-headline-md text-primary font-bold">{route.price}</span>
            </div>
            <button className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-sm text-sm font-bold active:scale-95">Book</button>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
`;

appJsx = appJsx.substring(0, startIndex) + newTopRoutes + appJsx.substring(endIndex);

fs.writeFileSync(appJsxPath, appJsx);
console.log("Successfully replaced Top Routes section");
