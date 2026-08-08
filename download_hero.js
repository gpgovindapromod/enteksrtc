const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const images = [
  { name: 'premium_hero_1.jpg', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop' },
  { name: 'premium_hero_2.jpg', url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1600&auto=format&fit=crop' },
  { name: 'premium_hero_3.jpg', url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=1600&auto=format&fit=crop' },
  { name: 'premium_hero_4.jpg', url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1600&auto=format&fit=crop' },
];

const destDir = path.join(__dirname, 'frontend', 'public', 'assets', 'images');

async function downloadAll() {
  for (const img of images) {
    try {
      console.log(`Downloading ${img.name}...`);
      await download(img.url, path.join(destDir, img.name));
    } catch (e) {
      console.error(`Failed to download ${img.name}: ${e.message}`);
    }
  }
  console.log('Done!');
}

downloadAll();
