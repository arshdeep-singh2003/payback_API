const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../database/db');
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/ious
 * @desc    Get all IOUs where user is lender or borrower
 * @access  Protected
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get IOUs where user is lender
    const lenderResult = await pool.query(`
      SELECT 
        i.iou_id, 
        i.amount, 
        i.reason, 
        i.status, 
        i.created_at,
        i.lender_id,
        i.borrower_id,
        u.name as borrower_name,
        COALESCE(SUM(p.payment_amount), 0) as total_paid,
        (i.amount - COALESCE(SUM(p.payment_amount), 0)) as remaining_balance
      FROM IOURecords i
      JOIN Users u ON i.borrower_id = u.user_id
      LEFT JOIN Payments p ON i.iou_id = p.iou_id
      WHERE i.lender_id = $1
      GROUP BY i.iou_id, i.amount, i.reason, i.status, i.created_at, i.lender_id, i.borrower_id, u.name
      ORDER BY i.created_at DESC
    `, [userId]);

    // Get IOUs where user is borrower
    const borrowerResult = await pool.query(`
      SELECT 
        i.iou_id, 
        i.amount, 
        i.reason, 
        i.status, 
        i.created_at,
        i.lender_id,
        i.borrower_id,
        u.name as lender_name,
        COALESCE(SUM(p.payment_amount), 0) as total_paid,
        (i.amount - COALESCE(SUM(p.payment_amount), 0)) as remaining_balance
      FROM IOURecords i
      JOIN Users u ON i.lender_id = u.user_id
      LEFT JOIN Payments p ON i.iou_id = p.iou_id
      WHERE i.borrower_id = $1
      GROUP BY i.iou_id, i.amount, i.reason, i.status, i.created_at, i.lender_id, i.borrower_id, u.name
      ORDER BY i.created_at DESC
    `, [userId]);

    // Calculate dashboard totals
    const owedToMe = lenderResult.rows
      .filter(iou => iou.status === 'Unpaid')
      .reduce((sum, iou) => sum + parseFloat(iou.remaining_balance), 0);

    const iOwe = borrowerResult.rows
      .filter(iou => iou.status === 'Unpaid')
      .reduce((sum, iou) => sum + parseFloat(iou.remaining_balance), 0);

    res.json({
      success: true,
      data: {
        owedToMe: lenderResult.rows,
        iOwe: borrowerResult.rows,
        summary: {
          totalOwedToMe: owedToMe.toFixed(2),
          totalIOwe: iOwe.toFixed(2),
          unpaidIOUsCount: lenderResult.rows.filter(iou => iou.status === 'Unpaid').length +
                          borrowerResult.rows.filter(iou => iou.status === 'Unpaid').length
        }
      }
    });

  } catch (error) {
    console.error('Get IOUs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching IOUs' 
    });
  }
});

/**
 * @route   GET /api/ious/:id
 * @desc    Get single IOU details with payment history
 * @access  Protected
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const iouId = req.params.id;
    const userId = req.user.userId;

    // Get IOU details
    const iouResult = await pool.query(`
      SELECT 
        i.*,
        l.name as lender_name,
        l.email as lender_email,
        b.name as borrower_name,
        b.email as borrower_email
      FROM IOURecords i
      JOIN Users l ON i.lender_id = l.user_id
      JOIN Users b ON i.borrower_id = b.user_id
      WHERE i.iou_id = $1
    `, [iouId]);

    if (iouResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'IOU not found' 
      });
    }

    const iou = iouResult.rows[0];

    // Check authorization (user must be lender or borrower)
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to view this IOU' 
      });
    }

    // Get payment history
    const paymentsResult = await pool.query(
      'SELECT * FROM Payments WHERE iou_id = $1 ORDER BY payment_date DESC',
      [iouId]
    );

    // Calculate remaining balance
    const totalPaid = paymentsResult.rows.reduce(
      (sum, payment) => sum + parseFloat(payment.payment_amount), 
      0
    );
    const remainingBalance = parseFloat(iou.amount) - totalPaid;

    res.json({
      success: true,
      data: {
        iou: {
          ...iou,
          amount: parseFloat(iou.amount)
        },
        payments: paymentsResult.rows.map(p => ({
          ...p,
          payment_amount: parseFloat(p.payment_amount)
        })),
        summary: {
          totalPaid: totalPaid.toFixed(2),
          remainingBalance: remainingBalance.toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error('Get IOU details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching IOU details' 
    });
  }
});

/**
 * @route   POST /api/ious
 * @desc    Create a new IOU
 * @access  Protected
 */
router.post('/', [
  authMiddleware,
  body('borrower_id').isInt().withMessage('Valid borrower ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
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

    const lenderId = req.user.userId;
    const { borrower_id, amount, reason } = req.body;

    // Prevent self-debt
    if (lenderId === parseInt(borrower_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot create an IOU with yourself' 
      });
    }

    // Check if borrower exists
    const borrowerExists = await pool.query(
      'SELECT user_id FROM Users WHERE user_id = $1',
      [borrower_id]
    );

    if (borrowerExists.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Borrower not found' 
      });
    }

    // Create IOU
    const result = await pool.query(
      'INSERT INTO IOURecords (lender_id, borrower_id, amount, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [lenderId, borrower_id, amount, reason]
    );

    res.status(201).json({
      success: true,
      message: 'IOU created successfully',
      data: {
        ...result.rows[0],
        amount: parseFloat(result.rows[0].amount)
      }
    });

  } catch (error) {
    console.error('Create IOU error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating IOU' 
    });
  }
});

/**
 * @route   PATCH /api/ious/:id
 * @desc    Update IOU status (mark as Paid)
 * @access  Protected
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const iouId = req.params.id;
    const userId = req.user.userId;
    const { status } = req.body;

    // Validate status
    if (!status || !['Unpaid', 'Paid'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be "Unpaid" or "Paid"' 
      });
    }

    // Check if IOU exists and user is authorized
    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iouId]
    );

    if (iouResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'IOU not found' 
      });
    }

    const iou = iouResult.rows[0];

    // Only lender or borrower can update status
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this IOU' 
      });
    }

    // Update status
    const result = await pool.query(
      'UPDATE IOURecords SET status = $1 WHERE iou_id = $2 RETURNING *',
      [status, iouId]
    );

    res.json({
      success: true,
      message: 'IOU status updated successfully',
      data: {
        ...result.rows[0],
        amount: parseFloat(result.rows[0].amount)
      }
    });

  } catch (error) {
    console.error('Update IOU error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating IOU' 
    });
  }
});

/**
 * @route   DELETE /api/ious/:id
 * @desc    Delete an IOU (only if no payments exist and user is lender)
 * @access  Protected
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const iouId = req.params.id;
    const userId = req.user.userId;

    // Check if IOU exists
    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iouId]
    );

    if (iouResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'IOU not found' 
      });
    }

    const iou = iouResult.rows[0];

    // Only lender can delete
    if (iou.lender_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the lender can delete this IOU' 
      });
    }

    // Check if payments exist
    const paymentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM Payments WHERE iou_id = $1',
      [iouId]
    );

    if (parseInt(paymentsResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete IOU with existing payments' 
      });
    }

    // Delete IOU
    await pool.query('DELETE FROM IOURecords WHERE iou_id = $1', [iouId]);

    res.json({
      success: true,
      message: 'IOU deleted successfully'
    });

  } catch (error) {
    console.error('Delete IOU error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting IOU' 
    });
  }
});

module.exports = router;
