const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../database/db');

// GET /api/setup?key=payback2024
// One-time endpoint: creates Roommates table + seeds test users
router.get('/', async (req, res) => {
  if (req.query.key !== 'payback2024') {
    return res.status(403).json({ success: false, message: 'Invalid key' });
  }

  const results = [];

  try {
    // 1. Create Roommates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Roommates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
        roommate_user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, roommate_user_id),
        CONSTRAINT no_self_roommate CHECK (user_id != roommate_user_id)
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_roommates_user ON Roommates(user_id)`);
    results.push('Roommates table created (or already existed)');

    // 2. Insert test users (skip if email already exists)
    const testUsers = [
      { name: 'John Doe',       email: 'john@example.com',   password: 'Test@123' },
      { name: 'Jane Smith',     email: 'jane@example.com',   password: 'Test@123' },
      { name: 'Mike Johnson',   email: 'mike@example.com',   password: 'Test@123' },
      { name: 'Sarah Williams', email: 'sarah@example.com',  password: 'Test@123' },
    ];

    const insertedUsers = [];
    for (const u of testUsers) {
      const hash = await bcrypt.hash(u.password, 10);
      const r = await pool.query(
        `INSERT INTO Users (name, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING user_id, name, email`,
        [u.name, u.email, hash]
      );
      insertedUsers.push(r.rows[0]);
      results.push(`User ready: ${r.rows[0].name} (id ${r.rows[0].user_id})`);
    }

    // 3. Add test users as roommates for every existing non-test user
    const realUsers = await pool.query(
      `SELECT user_id, name FROM Users
       WHERE email NOT IN ('john@example.com','jane@example.com','mike@example.com','sarah@example.com')
       ORDER BY user_id ASC`
    );

    for (const owner of realUsers.rows) {
      for (const roommate of insertedUsers) {
        await pool.query(
          `INSERT INTO Roommates (user_id, roommate_user_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [owner.user_id, roommate.user_id]
        );
      }
      results.push(`Roommates added for: ${owner.name}`);
    }

    return res.json({
      success: true,
      message: 'Setup complete',
      details: results,
      testAccounts: testUsers.map(u => ({ email: u.email, password: u.password }))
    });

  } catch (err) {
    console.error('Setup error:', err);
    return res.status(500).json({ success: false, message: err.message, completedSteps: results });
  }
});

module.exports = router;
