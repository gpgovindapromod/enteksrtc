import RecurringSchedule from '../../database/models/RecurringSchedule.js';

export const createRecurringSchedule = async (req, res) => {
  try {
    const { routeId, busId, departureTime, operatingDays, offsets } = req.body;

    if (!routeId || !busId || !departureTime || !offsets) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Construct stops array from offsets
    // offsets format: [{ routeStopId, offsetMinutes }]
    const stops = offsets.map(o => ({
      routeStopId: o.routeStopId,
      offsetMinutes: o.offsetMinutes
    }));

    const schedule = new RecurringSchedule({
      routeId,
      busId,
      departureTime,
      operatingDays: operatingDays || [0, 1, 2, 3, 4, 5, 6],
      stops,
      createdBy: req.user.id || req.user._id
    });

    await schedule.save();

    res.status(201).json({ success: true, message: 'Recurring schedule created', schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecurringSchedules = async (req, res) => {
  try {
    const schedules = await RecurringSchedule.find()
      .populate('routeId busId')
      .sort({ createdAt: -1 });
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRecurringSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const updates = req.body;

    const schedule = await RecurringSchedule.findByIdAndUpdate(scheduleId, updates, { returnDocument: 'after' });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    res.json({ success: true, message: 'Schedule updated', schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
