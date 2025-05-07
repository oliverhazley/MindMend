import * as hrvModel from '../models/hrvModel.js';

export async function addHRVReading(req, res) {
  try {
    const {user_id, hrv_value} = req.body;

    // Validate input
    if (!user_id || typeof hrv_value !== 'number' || isNaN(hrv_value)) {
      return res.status(400).json({
        message: 'Invalid input: user_id and hrv_value required'
      });
    }

    const result = await hrvModel.addReading(user_id, hrv_value);

    return res.json({
      message: 'HRV reading stored',
      hrv_id: result.hrvId
    });
  } catch (err) {
    console.error('addHRVReading error:', err);
    res.status(500).json({
      message: 'Server error storing HRV',
      error: err.message
    });
  }
}

export async function getHRVReadings(req, res) {
  try {
    const {user_id} = req.query;

    if (!user_id) {
      return res.status(400).json({message: 'Missing user_id in query'});
    }

    const readings = await hrvModel.getReadings(user_id);
    res.json(readings);
  } catch (err) {
    console.error('getHRVReadings error:', err);
    res.status(500).json({message: 'Server error fetching HRV readings'});
  }
}