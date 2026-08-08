const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf8');

// Fix style string for the bus icon
appJsx = appJsx.replace(
  'style="font-variation-settings: \'FILL\' 1;"',
  'style={{ fontVariationSettings: "\'FILL\' 1" }}'
);

// Fix style string for background images in the Destinations grid
appJsx = appJsx.replace(
  /style="background-image:\s*url\('([^']+)'\)"/g,
  'style={{ backgroundImage: `url(\'$1\')` }}'
);

fs.writeFileSync(appJsxPath, appJsx);
console.log("Successfully fixed JSX style string errors");
