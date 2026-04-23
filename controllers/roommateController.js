const pool = require('../database/db');

const getMyRoommates = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.created_at
       FROM Roommates r
       JOIN Users u ON u.user_id = r.roommate_user_id
       WHERE r.user_id = $1
       ORDER BY u.name ASC`,
      [req.user.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get roommates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addRoommate = async (req, res) => {
  const { roommate_user_id } = req.body;
  const userId = req.user.userId;

  if (!roommate_user_id) {
    return res.status(400).json({ success: false, message: 'roommate_user_id is required' });
  }
  if (parseInt(roommate_user_id) === userId) {
    return res.status(400).json({ success: false, message: 'Cannot add yourself as a roommate' });
  }

  try {
    const userCheck = await pool.query('SELECT user_id FROM Users WHERE user_id = $1', [roommate_user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await pool.query(
      `INSERT INTO Roommates (user_id, roommate_user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, roommate_user_id) DO NOTHING
       RETURNING id`,
      [userId, roommate_user_id]
    );

    res.status(201).json({ success: true, message: 'Roommate added' });
  } catch (error) {
    console.error('Add roommate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeRoommate = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM Roommates WHERE user_id = $1 AND roommate_user_id = $2 RETURNING id',
      [req.user.userId, req.params.roommate_user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Roommate not found' });
    }

    res.json({ success: true, message: 'Roommate removed' });
  } catch (error) {
    console.error('Remove roommate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMyRoommates, addRoommate, removeRoommate };
