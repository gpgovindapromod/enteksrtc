import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stop from './database/models/Stop.js';
import Depot from './database/models/Depot.js';
import Bus from './database/models/Bus.js';
import Route from './database/models/Route.js';
import RouteStop from './database/models/RouteStop.js';
import Trip from './database/models/Trip.js';
import TripStop from './database/models/TripStop.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const cities = [
  "Trivandrum", "Neyyattinkara", "Nedumangad", "Attingal", "Kollam",
  "Karunagappally", "Kottarakkara", "Pathanamthitta", "Adoor", "Chengannur",
  "Thiruvalla", "Kottayam", "Pala", "Ernakulam", "Aluva",
  "Perumbavoor", "Muvattupuzha", "Thrissur", "Palakkad", "Kozhikode",
  "Vadakara", "Kannur", "Thalassery", "Kasaragod", "Mananthavady"
];

const categories = [
  "Ordinary", "City Fast", "Fast Passenger", "Super Fast", "Express", 
  "Super Deluxe", "Luxury", "Multi Axle Volvo", "Low Floor AC"
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDatabase = async () => {
  try {
    const args = process.argv.slice(2);
    const dbNameOverride = args[0]; // e.g. 'test' or 'ente_ksrtc'

    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enteksrtc';
    
    // If a DB override is provided via CLI argument, append/replace it
    if (dbNameOverride) {
      if (mongoUri.includes('mongodb.net')) {
         if (mongoUri.includes('.net/')) {
           mongoUri = mongoUri.replace(/\.net\/[^?]+/, `.net/${dbNameOverride}`);
         } else {
           mongoUri = mongoUri.replace('.net', `.net/${dbNameOverride}`);
         }
      } else if (mongoUri.includes('127.0.0.1:27017')) {
         if (mongoUri.includes('27017/')) {
           mongoUri = mongoUri.replace(/27017\/[^?]+/, `27017/${dbNameOverride}`);
         } else {
           mongoUri = mongoUri.replace('27017', `27017/${dbNameOverride}`);
         }
      }
    }

    console.log(`Connecting to ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing data...');
    await Stop.deleteMany();
    await Depot.deleteMany();
    await Bus.deleteMany();
    await Route.deleteMany();
    await RouteStop.deleteMany();
    await Trip.deleteMany();
    await TripStop.deleteMany();

    // 1. Create Stops
    console.log('Creating Stops...');
    const stopsData = cities.map(city => ({
      stopName: city,
      district: city, // mock
      state: "Kerala"
    }));
    const stops = await Stop.insertMany(stopsData);

    // 2. Create Depots
    console.log('Creating Depots...');
    const depotsData = cities.map((city, index) => ({
      depotCode: `DPT-${index + 1}`,
      depotName: `${city} Depot`,
      address: `${city} Main Road`,
      city: city,
      district: city,
      state: "Kerala",
      pincode: `6000${index + 10}`,
      phone: `98765432${index.toString().padStart(2, '0')}`,
      email: `${city.toLowerCase()}@ksrtc.com`,
      totalPlatforms: getRandomInt(5, 20),
      isActive: true
    }));
    const depots = await Depot.insertMany(depotsData);

    // 3. Create Buses
    console.log('Creating 150 Buses...');
    const busesData = [];
    for (let i = 1; i <= 150; i++) {
      const category = getRandomElement(categories);
      let capacity = 50;
      if (category.includes('Volvo') || category.includes('Super Deluxe')) capacity = 40;
      if (category.includes('Ordinary')) capacity = 60;

      busesData.push({
        busNumber: `KL-15-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        registrationNumber: `KSRTC-${1000 + i}`,
        busType: category,
        category: category,
        totalSeats: capacity, // using capacity as standard
        capacity: capacity,
        depotId: getRandomElement(depots)._id,
        status: 'ACTIVE'
      });
    }
    const buses = await Bus.insertMany(busesData);

    // 4. Create 100 Routes & RouteStops
    console.log('Creating 100 Routes and RouteStops...');
    const routesData = [];
    const routeStopsData = [];
    let routeCounter = 1;

    for (let i = 0; i < 100; i++) {
      // Pick random stops (at least 4, max 8)
      const stopCount = getRandomInt(4, 8);
      const routePath = [];
      let currentDistance = 0;

      // Select unique stops for this route
      const availableStops = [...stops].sort(() => 0.5 - Math.random());
      
      for(let s = 0; s < stopCount; s++) {
         routePath.push({
            stop: availableStops[s],
            distance: currentDistance
         });
         currentDistance += getRandomInt(15, 60); // Add 15-60km per stop
      }

      const source = routePath[0];
      const destination = routePath[routePath.length - 1];

      const routeId = new mongoose.Types.ObjectId();
      routesData.push({
        _id: routeId,
        routeNumber: `RT-${routeCounter++}`,
        routeName: `${source.stop.stopName} to ${destination.stop.stopName}`,
        sourceStop: source.stop._id,
        destinationStop: destination.stop._id,
        totalDistance: destination.distance
      });

      // Build RouteStops
      routePath.forEach((pt, idx) => {
        routeStopsData.push({
          _id: new mongoose.Types.ObjectId(),
          routeId: routeId,
          stopId: pt.stop._id,
          sequence: idx + 1,
          distanceFromSource: pt.distance
        });
      });
    }

    const routes = await Route.insertMany(routesData);
    await RouteStop.insertMany(routeStopsData);

    // 5. Create 3000 Trips (30 days * 100 routes * 1-3 buses/route/day)
    console.log('Creating ~3000 Trips and their TripStops...');
    const tripsData = [];
    const tripStopsData = [];
    
    // Starting date: tomorrow
    const baseDate = new Date();
    baseDate.setHours(0,0,0,0);
    baseDate.setDate(baseDate.getDate() + 1);

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const journeyDate = new Date(baseDate);
      journeyDate.setDate(journeyDate.getDate() + dayOffset);

      routes.forEach(route => {
        const routeStops = routeStopsData.filter(rs => rs.routeId.toString() === route._id.toString());
        routeStops.sort((a, b) => a.sequence - b.sequence);
        const firstRs = routeStops[0];
        const lastRs = routeStops[routeStops.length - 1];
        const totalDistance = lastRs.distanceFromSource - firstRs.distanceFromSource;

        // 1 to 3 trips per route per day
        const tripsToday = getRandomInt(1, 3);
        
        for (let t = 0; t < tripsToday; t++) {
           const bus = getRandomElement(buses);
           
           // Spread them across the day
           const depTime = new Date(journeyDate);
           depTime.setHours(getRandomInt(5, 20), getRandomInt(0, 59), 0, 0);

           const arrTime = new Date(depTime);
           arrTime.setHours(depTime.getHours() + getRandomInt(2, 6)); // Rough estimate

           const tripId = new mongoose.Types.ObjectId();

           tripsData.push({
             _id: tripId,
             busId: bus._id,
             routeId: route._id,
             departureDate: depTime,
             arrivalDate: arrTime,
             status: 'SCHEDULED'
           });

           const elapsedDuration = arrTime.getTime() - depTime.getTime();

           routeStops.forEach(rs => {
             let stopTime;
             if (rs.sequence === firstRs.sequence) {
               stopTime = new Date(depTime);
             } else if (rs.sequence === lastRs.sequence) {
               stopTime = new Date(arrTime);
             } else {
               const stopProgress = totalDistance === 0 ? 0 : (rs.distanceFromSource - firstRs.distanceFromSource) / totalDistance;
               stopTime = new Date(depTime.getTime() + (elapsedDuration * stopProgress));
             }

             tripStopsData.push({
               tripId: tripId,
               routeStopId: rs._id,
               arrivalTime: stopTime,
               departureTime: stopTime,
               platform: `P-${getRandomInt(1, 5)}`
             });
           });
        }
      });
    }

    // Insert Trips in batches to avoid memory overflow
    const batchSize = 1000;
    for (let i = 0; i < tripsData.length; i += batchSize) {
      await Trip.insertMany(tripsData.slice(i, i + batchSize));
    }

    console.log(`Creating ${tripStopsData.length} TripStops...`);
    const tsBatchSize = 5000;
    for (let i = 0; i < tripStopsData.length; i += tsBatchSize) {
      await TripStop.insertMany(tripStopsData.slice(i, i + tsBatchSize));
    }

    console.log('====================================');
    console.log(`Depots created: ${depots.length}`);
    console.log(`Buses created: ${buses.length}`);
    console.log(`Routes created: ${routes.length}`);
    console.log(`RouteStops created: ${routeStopsData.length}`);
    console.log(`Trips created: ${tripsData.length}`);
    console.log(`TripStops created: ${tripStopsData.length}`);
    console.log('====================================');
    console.log('Seeding Complete! You can test passenger search now.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
