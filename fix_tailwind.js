const fs = require('fs');
const path = require('path');

const tailwindPath = path.join(__dirname, 'frontend', 'tailwind.config.js');
let tailwindConfig = fs.readFileSync(tailwindPath, 'utf8');

// Replace the hardcoded colors with CSS variables that change based on theme
tailwindConfig = tailwindConfig.replace('"on-surface": "#dde4dd"', '"on-surface": "var(--dark)"');
tailwindConfig = tailwindConfig.replace('"on-surface-variant": "#bbcabf"', '"on-surface-variant": "var(--gray)"');
tailwindConfig = tailwindConfig.replace('"background": "#0e1511"', '"background": "var(--light)"');
tailwindConfig = tailwindConfig.replace('"surface": "#0e1511"', '"surface": "var(--light)"');
tailwindConfig = tailwindConfig.replace('"surface-container-low": "#161d19"', '"surface-container-low": "var(--white)"');
tailwindConfig = tailwindConfig.replace('"outline": "#86948a"', '"outline": "var(--gray-border)"');
tailwindConfig = tailwindConfig.replace('"outline-variant": "#3c4a42"', '"outline-variant": "var(--gray-border)"');
tailwindConfig = tailwindConfig.replace('"surface-container": "#1a211d"', '"surface-container": "var(--white)"');
tailwindConfig = tailwindConfig.replace('"surface-container-highest": "#2f3632"', '"surface-container-highest": "var(--gray-light)"');
tailwindConfig = tailwindConfig.replace('"surface-variant": "#2f3632"', '"surface-variant": "var(--gray-light)"');


fs.writeFileSync(tailwindPath, tailwindConfig);
console.log("Successfully updated tailwind.config.js for mode shifting");
