const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMyRoommates, addRoommate, removeRoommate } = require('../controllers/roommateController');

router.get('/', authMiddleware, getMyRoommates);
router.post('/', authMiddleware, addRoommate);
router.delete('/:roommate_user_id', authMiddleware, removeRoommate);

module.exports = router;
