const pool = require('../database/db');

/**
 * @desc    Get all registered users (password_hash is never returned)
 * @route   GET /api/users
 * @access  Protected
 */
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, created_at FROM Users ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
};

/**
 * @desc    Get a single user by ID (password_hash is never returned)
 * @route   GET /api/users/:id
 * @access  Protected
 */
const getUserById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, created_at FROM Users WHERE user_id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching user' });
  }
};

module.exports = { getAllUsers, getUserById };
