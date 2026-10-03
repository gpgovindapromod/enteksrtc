export const FARE_CONFIG = {
  'Ordinary': { ratePaise: 100, minFarePaise: 1000 }, // 1000 paise = 10 Rs
  'City Fast': { ratePaise: 103, minFarePaise: 1200 },
  'Fast Passenger': { ratePaise: 105, minFarePaise: 1500 },
  'Super Fast': { ratePaise: 108, minFarePaise: 2200 },
  'Express': { ratePaise: 110, minFarePaise: 2800 },
  'Super Air Express': { ratePaise: 115, minFarePaise: 3500 },
  'Super Deluxe': { ratePaise: 120, minFarePaise: 4000 },
  'Luxury': { ratePaise: 150, minFarePaise: 6000 },
  'Single Axle': { ratePaise: 181, minFarePaise: 6000 },
  'Multi Axle Volvo': { ratePaise: 225, minFarePaise: 10000 },
  'Low Floor AC': { ratePaise: 175, minFarePaise: 2600 },
  'Low Floor Non-AC': { ratePaise: 100, minFarePaise: 1000 },
};

/**
 * Normalizes service category to match config keys.
 * Handles defaults.
 */
export const getFareConfig = (serviceCategory) => {
  if (!serviceCategory) return FARE_CONFIG['Ordinary'];
  
  // Try direct match
  if (FARE_CONFIG[serviceCategory]) return FARE_CONFIG[serviceCategory];

  // Try some standard mappings based on text
  const category = serviceCategory.toLowerCase();
  if (category.includes('multi axle') || category.includes('scania') || category.includes('volvo')) return FARE_CONFIG['Multi Axle Volvo'];
  if (category.includes('single axle')) return FARE_CONFIG['Single Axle'];
  if (category.includes('luxury') || category.includes('hi-tech')) return FARE_CONFIG['Luxury'];
  if (category.includes('deluxe') || category.includes('semi sleeper') || category.includes('minnal')) return FARE_CONFIG['Super Deluxe'];
  if (category.includes('super air express')) return FARE_CONFIG['Super Air Express'];
  if (category.includes('express')) return FARE_CONFIG['Express'];
  if (category.includes('super fast')) return FARE_CONFIG['Super Fast'];
  if (category.includes('fast passenger') || category.includes('lsfp')) return FARE_CONFIG['Fast Passenger'];
  if (category.includes('city fast')) return FARE_CONFIG['City Fast'];
  if (category.includes('low floor ac')) return FARE_CONFIG['Low Floor AC'];
  if (category.includes('low floor')) return FARE_CONFIG['Low Floor Non-AC'];

  return FARE_CONFIG['Ordinary'];
};

/**
 * Calculates fare strictly based on distance and service type.
 * @param {Number} distanceKm 
 * @param {String} serviceCategory 
 * @returns {Number} Final fare in whole Rupees
 */
export const calculateFare = (distanceKm, serviceCategory) => {
  const config = getFareConfig(serviceCategory);
  
  const calculatedFarePaise = distanceKm * config.ratePaise;
  const finalFarePaise = Math.max(calculatedFarePaise, config.minFarePaise);
  
  // Return converted to Rupees and rounded
  return Math.ceil(finalFarePaise / 100);
};
