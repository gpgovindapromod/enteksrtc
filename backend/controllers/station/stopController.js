import Stop from '../../database/models/Stop.js';

export const searchStops = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, stops: [] });
    }

    const regex = new RegExp(q, 'i');
    
    const stops = await Stop.find({ stopName: regex })
      .select('_id stopName district')
      .limit(10)
      .lean();
      
    res.json({ success: true, stops });
  } catch (error) {
    console.error('Error searching stops:', error);
    res.status(500).json({ success: false, message: 'Failed to search stops' });
  }
};
