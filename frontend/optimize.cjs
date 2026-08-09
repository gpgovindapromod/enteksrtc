const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'public', 'assets', 'images');

async function processImages() {
  const files = fs.readdirSync(imagesDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      // Don't touch ksrtc_logo.png as it might need transparency and original resolution
      if (file === 'ksrtc_logo.png') continue;

      const oldPath = path.join(imagesDir, file);
      const name = path.basename(file, ext);
      const newPath = path.join(imagesDir, `${name}.webp`);
      
      console.log(`Processing ${file}...`);
      
      try {
        let pipeline = sharp(oldPath);
        
        // Resize based on file name prefix
        if (name.startsWith('premium_hero') || name === 'hero_bg' || name.startsWith('dest_wayanad')) {
          pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
        } else if (name.startsWith('route_') || name.startsWith('dest_') || name.startsWith('gallery_')) {
          pipeline = pipeline.resize({ width: 800, withoutEnlargement: true });
        }
        
        await pipeline
          .webp({ quality: 80, effort: 6 })
          .toFile(newPath);
          
        // Delete original file
        fs.unlinkSync(oldPath);
        console.log(`Successfully converted ${file} to ${name}.webp and deleted original.`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }
  
  console.log("Image optimization complete.");
}

processImages();
