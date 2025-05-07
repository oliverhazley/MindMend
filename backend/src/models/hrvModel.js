import promisePool from '../utils/database.js';

const addReading = async (userId, hrvValue) => {
  const [result] = await promisePool.query(
    `INSERT INTO hrv_readings (user_id, reading_time, hrv_value)
     VALUES (?, NOW(), ?)`,
    [userId, hrvValue]
  );

  if (!result.affectedRows) {
    throw new Error('Database insert failed');
  }

  return {
    hrvId: result.insertId
  };
};

const getReadings = async (userId) => {
  const [rows] = await promisePool.query(
    `SELECT reading_time, hrv_value
     FROM hrv_readings
     WHERE user_id = ?
     ORDER BY reading_time DESC`,
    [userId]
  );

  return rows;
};

export {
  addReading,
  getReadings
};