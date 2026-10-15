import Stop from '../../database/models/Stop.js';

let cachedStops = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const getCachedStops = async () => {
  const now = Date.now();
  if (cachedStops && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedStops;
  }
  cachedStops = await Stop.find()
    .select('_id stopName district')
    .lean();
  lastCacheTime = now;
  return cachedStops;
};

export const searchStops = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, stops: [] });
    }

    const stops = await getCachedStops();
    const queryLower = q.toLowerCase();
    
    const matched = stops
      .filter(s => s.stopName && s.stopName.toLowerCase().includes(queryLower))
      .slice(0, 10);
      
    res.json({ success: true, stops: matched });
  } catch (error) {
    console.error('Error searching stops:', error);
    res.status(500).json({ success: false, message: 'Failed to search stops' });
  }
};

