// emergencyController.js — crisis helpline contacts. Deliberately public,
// no authentication required — a person in crisis should never have to
// register or log in first to find a number to call.

const pool = require('../config/db');

async function getEmergencyContacts(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, phone, description, hours, region FROM emergency_contacts ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get emergency contacts error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching emergency contacts.' });
  }
}

module.exports = { getEmergencyContacts };
