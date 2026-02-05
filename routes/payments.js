const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const pool = require('../database/db');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/payments
 * @desc    Record a payment on an IOU
 * @access  Protected
 */
router.post('/', [
  authMiddleware,
  body('iou_id').isInt().withMessage('Valid IOU ID is required'),
  body('payment_amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const userId = req.user.userId;
    const { iou_id, payment_amount } = req.body;

    // Check if IOU exists
    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iou_id]
    );

    if (iouResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'IOU not found' 
      });
    }

    const iou = iouResult.rows[0];

    // Only lender or borrower can add payments
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to add payments to this IOU' 
      });
    }

    // Calculate current balance
    const paymentsResult = await pool.query(
      'SELECT COALESCE(SUM(payment_amount), 0) as total_paid FROM Payments WHERE iou_id = $1',
      [iou_id]
    );

    const totalPaid = parseFloat(paymentsResult.rows[0].total_paid);
    const remainingBalance = parseFloat(iou.amount) - totalPaid;

    // Check if payment amount exceeds remaining balance
    if (parseFloat(payment_amount) > remainingBalance) {
      return res.status(400).json({ 
        success: false, 
        message: `Payment amount ($${payment_amount}) exceeds remaining balance ($${remainingBalance.toFixed(2)})` 
      });
    }

    // Add payment
    const result = await pool.query(
      'INSERT INTO Payments (iou_id, payment_amount) VALUES ($1, $2) RETURNING *',
      [iou_id, payment_amount]
    );

    // Check if IOU is now fully paid
    const newRemainingBalance = remainingBalance - parseFloat(payment_amount);
    
    if (newRemainingBalance <= 0) {
      // Automatically mark IOU as Paid
      await pool.query(
        'UPDATE IOURecords SET status = $1 WHERE iou_id = $2',
        ['Paid', iou_id]
      );
    }

    res.status(201).json({
      success: true,
      message: newRemainingBalance <= 0 ? 'Payment recorded and IOU marked as Paid' : 'Payment recorded successfully',
      data: {
        payment: {
          ...result.rows[0],
          payment_amount: parseFloat(result.rows[0].payment_amount)
        },
        newRemainingBalance: newRemainingBalance.toFixed(2),
        iouFullyPaid: newRemainingBalance <= 0
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while recording payment' 
    });
  }
});

/**
 * @route   GET /api/payments?iou_id=:id
 * @desc    Get all payments for a specific IOU
 * @access  Protected
 */
router.get('/', [
  authMiddleware,
  query('iou_id').isInt().withMessage('Valid IOU ID is required')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const userId = req.user.userId;
    const { iou_id } = req.query;

    // Check if IOU exists and user is authorized
    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iou_id]
    );

    if (iouResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'IOU not found' 
      });
    }

    const iou = iouResult.rows[0];

    // Only lender or borrower can view payments
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to view payments for this IOU' 
      });
    }

    // Get payments
    const paymentsResult = await pool.query(
      'SELECT * FROM Payments WHERE iou_id = $1 ORDER BY payment_date DESC',
      [iou_id]
    );

    // Calculate totals
    const totalPaid = paymentsResult.rows.reduce(
      (sum, payment) => sum + parseFloat(payment.payment_amount), 
      0
    );
    const remainingBalance = parseFloat(iou.amount) - totalPaid;

    res.json({
      success: true,
      data: {
        payments: paymentsResult.rows.map(p => ({
          ...p,
          payment_amount: parseFloat(p.payment_amount)
        })),
        summary: {
          iouAmount: parseFloat(iou.amount),
          totalPaid: totalPaid.toFixed(2),
          remainingBalance: remainingBalance.toFixed(2),
          paymentsCount: paymentsResult.rows.length
        }
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching payments' 
    });
  }
});

module.exports = router;
