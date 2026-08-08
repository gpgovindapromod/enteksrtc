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
  { name: 'ksrtc_logo.png', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLWQfS0R2m1lTTNcpBqGKE8oBi2RxmC27R_wcpV3v8BQ&s=10' },
  { name: 'app_store.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg' },
  { name: 'google_icon.svg', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
  { name: 'kerala_tourism.webp', url: 'https://banner2.cleanpng.com/20181120/jiq/kisspng-kerala-logo-gods-own-country-vector-graphics-clip-1713920244732.webp' },
  { name: 'hero_bg.jpg', url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=800&auto=format&fit=crop' },
  { name: 'gallery_1.jpg', url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=60&w=400&auto=format&fit=crop' },
  { name: 'gallery_2.jpg', url: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=60&w=400&auto=format&fit=crop' },
  { name: 'gallery_3.jpg', url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?q=60&w=400&auto=format&fit=crop' },
  { name: 'gallery_4.jpg', url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=60&w=400&auto=format&fit=crop' },
  { name: 'gallery_5.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/K.S.R.T.C.Bus.jpg?_=20110514164313' },
  { name: 'gallery_6.jpg', url: 'https://vadakkus.com/wp-content/uploads/2024/10/KSRTC-Fast-Passenger-UPI-payment-scaled.jpg' },
  { name: 'gallery_7.jpg', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=60&w=400&auto=format&fit=crop' },
  { name: 'gallery_8.jpg', url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=60&w=400&auto=format&fit=crop' },
  { name: 'gallery_9.jpg', url: 'https://www.tickettogetlost.com/wp-content/uploads/2023/04/Kerala-KSRTC-SWIFT-Super-Fast-Bus-Timings-from-Thiruvananthapuram-Parassala-and-Neyyattinkara.jpg' },
  { name: 'gallery_10.jpg', url: 'https://i.pinimg.com/736x/84/da/68/84da6820c103d0dd0457d54cd8209d24.jpg' },
  { name: 'route_kanyakumari.jpg', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-iwwYU0S8HeV3fxaQoFhyVbMXlnsZCM3e17kLqjVHIUjEnZT_T54woKQ&s=10&q=60&w=400&auto=format&fit=crop' },
  { name: 'route_palakkad.jpg', url: 'https://www.holidify.com/images/bgImages/PALAKKAD.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'route_palani.jpg', url: 'https://c9admin.cottage9.com/uploads/5704/palani-murugan-temple.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'route_bangalore.jpg', url: 'https://static.toiimg.com/photo/54559212.cms?q=60&w=400&auto=format&fit=crop' },
  { name: 'route_coimbatore.jpg', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1AEn2xeDFITPhGG09_u1X70naWQlouSnnHv653OTmqw&s=10&q=60&w=400&auto=format&fit=crop' },
  { name: 'route_kannur.jpg', url: 'https://client-websites.blr1.cdn.digitaloceanspaces.com/frenzyholidays/wp-content/uploads/2025/07/01040344/Hidden-Places-in-Kannur-4.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'route_munnar.jpg', url: 'https://assets.onlineksrtcswift.com/img/theme64/top-destination/munnar.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'route_mangalore.jpg', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJQagrNXvzzfYN0YF803hMfCsgQWNwSk62vmfMxilRJQ&s=10&q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_alleppey.jpg', url: 'https://hblimg.mmtcdn.com/content/hubble/img/desttvimg/mmt/destination/m_Alleppey_tv_destination_img_1_l_645_859.jpg?im=Resize=(412,412)&q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_kochi.jpg', url: 'https://assets.cntraveller.in/photos/6780d2480354c3ddddbf9994/master/w_1600%2Cc_limit/GettyImages-2171350077.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_kottarakkara.jpg', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHr7ZQSELvk-I21KZmAw46mnzb4KCVEr2dYYeMLCuIdbw3ceSfTZU4qoY&s=10&q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_gavi.jpg', url: 'https://www.keralatourism.org/images/destination/mobile/gavi20131127164933_355_1.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_kovalam.jpg', url: 'https://hblimg.mmtcdn.com/content/hubble/img/kovalam/mmt/destination/m_Kovalam_activity_beach_l_383_614.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_kozhikode.jpg', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdJS_hkbzYE9e9fEGgWn8ca-AuZax0KvhYSpM6ucxJmA&s=10&q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_wayanad.jpg', url: 'https://assets.cntraveller.in/photos/666d21d4b9bacccca58f2f7b/2:3/w_2176,h_3264,c_limit/wayanad.jpg?q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_vagamon.jpg', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ8ebwmUpnQ33zJ1BHnc72v88grw_UTGLh9-2wlGmazg&s=10&q=60&w=400&auto=format&fit=crop' },
  { name: 'dest_varkala.jpg', url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/832651196.jpg?k=ea4095c0b933b0ca23a5d14a99d5839adb5f21976f1eeaa8643107617689b536&o=&q=60&w=400&auto=format&fit=crop' },
  { name: 'test_1.jpg', url: 'https://www.justkerala.in/wp-content/uploads/2012/12/ksrtc-bus-service.jpg' },
  { name: 'test_2.jpg', url: 'https://fottam.com/wp-content/uploads/2016/02/Kerala-KSRTC-New-Scania-Metrolink-Bus.jpg' },
];

const destDir = path.join(__dirname, 'frontend', 'src', 'assets', 'images');

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
