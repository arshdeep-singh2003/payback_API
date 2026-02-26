const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { getAllIOUs, getIOUById, createIOU, updateIOU, patchIOU, deleteIOU } = require('../controllers/iouController');

// GET /api/ious - Protected
router.get('/', authMiddleware, getAllIOUs);

// GET /api/ious/:id - Protected
router.get('/:id', authMiddleware, getIOUById);

// POST /api/ious - Protected
router.post('/', [
  authMiddleware,
  body('borrower_id').isInt().withMessage('Valid borrower ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
], createIOU);

// PUT /api/ious/:id - Protected (full update)
router.put('/:id', [
  authMiddleware,
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty'),
  body('status').optional().isIn(['Unpaid', 'Paid']).withMessage('Status must be "Unpaid" or "Paid"')
], updateIOU);

// PATCH /api/ious/:id - Protected (quick status-only update)
router.patch('/:id', authMiddleware, patchIOU);

// DELETE /api/ious/:id - Protected
router.delete('/:id', authMiddleware, deleteIOU);

module.exports = router;
