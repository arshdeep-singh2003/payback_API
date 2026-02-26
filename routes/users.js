const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getAllUsers, getUserById } = require('../controllers/userController');

// GET /api/users - Protected
router.get('/', authMiddleware, getAllUsers);

// GET /api/users/:id - Protected
router.get('/:id', authMiddleware, getUserById);

module.exports = router;
