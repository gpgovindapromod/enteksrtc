const fs = require('fs');
let c = fs.readFileSync('src/components/mobile/MobileTicketsTab.jsx', 'utf8');
c = c.replace(/\s*\{\/\* QR Code Modal Popup \*\/\}/, '\n      )}\n      {/* QR Code Modal Popup */}');
fs.writeFileSync('src/components/mobile/MobileTicketsTab.jsx', c);
