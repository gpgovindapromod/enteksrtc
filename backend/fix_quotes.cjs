const fs = require('fs');
const file = 'C:/Users/HP/Desktop/B-tech/S5/AWT/project/EnteKsrtc/backend/controllers/trip/tripController.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/console\.time\("([^"]+)"\)/g, 'console.time(`$1`)');
content = content.replace(/console\.timeEnd\("([^"]+)"\)/g, 'console.timeEnd(`$1`)');
fs.writeFileSync(file, content);
