// hrvController.js
import promisePool from "../utils/database.js";


export async function addHRVReading(req, res) {
  try {
    const { user_id, hrv_value } = req.body;

    // Validate input
    if (!user_id || typeof hrv_value !== 'number' || isNaN(hrv_value)) {
      return res.status(400).json({
        message: "Invalid input: user_id and hrv_value required"
      });
    }

    // Insert with  error handling
    const [result] = await promisePool.query(
      `INSERT INTO hrv_readings (user_id, reading_time, hrv_value)
       VALUES (?, NOW(), ?)`,
      [user_id, hrv_value]
    );

    if (!result.affectedRows) {
      throw new Error("Database insert failed");
    }

    return res.json({
      message: "HRV reading stored",
      hrv_id: result.insertId
    });
  } catch (err) {
    console.error("addHRVReading error:", err);
    res.status(500).json({
      message: "Server error storing HRV",
      error: err.message
    });
  }
}

export async function getHRVReadings(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id in query" });
    }

    const [rows] = await promisePool.query(
      `SELECT reading_time, hrv_value
       FROM hrv_readings
       WHERE user_id = ?
       ORDER BY reading_time DESC`,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("getHRVReadings error:", err);
    res.status(500).json({ message: "Server error fetching HRV readings" });
  }
}


