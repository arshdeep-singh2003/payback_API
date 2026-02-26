const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { createPayment, getPayments, updatePayment, deletePayment } = require('../controllers/paymentController');

// POST /api/payments - Protected
router.post('/', [
  authMiddleware,
  body('iou_id').isInt().withMessage('Valid IOU ID is required'),
  body('payment_amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0')
], createPayment);

// GET /api/payments?iou_id=:id - Protected
router.get('/', [
  authMiddleware,
  query('iou_id').isInt().withMessage('Valid IOU ID is required')
], getPayments);

// PUT /api/payments/:id - Protected
router.put('/:id', [
  authMiddleware,
  body('payment_amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0')
], updatePayment);

// DELETE /api/payments/:id - Protected
router.delete('/:id', authMiddleware, deletePayment);

module.exports = router;
