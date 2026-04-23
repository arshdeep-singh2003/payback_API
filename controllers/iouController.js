const { validationResult } = require('express-validator');
const pool = require('../database/db');

/**
 * @desc    Get all IOUs where the authenticated user is lender or borrower
 * @route   GET /api/ious
 * @access  Protected
 */
const getAllIOUs = async (req, res) => {
  try {
    const userId = req.user.userId;

    // IOUs where this user is the lender (money owed TO them)
    const lenderResult = await pool.query(`
      SELECT
        i.iou_id, i.amount, i.reason, i.status, i.created_at,
        i.lender_id, i.borrower_id,
        u.name AS borrower_name,
        COALESCE(SUM(p.payment_amount), 0) AS total_paid,
        (i.amount - COALESCE(SUM(p.payment_amount), 0)) AS remaining_balance
      FROM IOURecords i
      JOIN Users u ON i.borrower_id = u.user_id
      LEFT JOIN Payments p ON i.iou_id = p.iou_id
      WHERE i.lender_id = $1
      GROUP BY i.iou_id, i.amount, i.reason, i.status, i.created_at, i.lender_id, i.borrower_id, u.name
      ORDER BY i.created_at DESC
    `, [userId]);

    // IOUs where this user is the borrower (money they OWE)
    const borrowerResult = await pool.query(`
      SELECT
        i.iou_id, i.amount, i.reason, i.status, i.created_at,
        i.lender_id, i.borrower_id,
        u.name AS lender_name,
        COALESCE(SUM(p.payment_amount), 0) AS total_paid,
        (i.amount - COALESCE(SUM(p.payment_amount), 0)) AS remaining_balance
      FROM IOURecords i
      JOIN Users u ON i.lender_id = u.user_id
      LEFT JOIN Payments p ON i.iou_id = p.iou_id
      WHERE i.borrower_id = $1
      GROUP BY i.iou_id, i.amount, i.reason, i.status, i.created_at, i.lender_id, i.borrower_id, u.name
      ORDER BY i.created_at DESC
    `, [userId]);

    // Calculate dashboard summary totals
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
          unpaidIOUsCount:
            lenderResult.rows.filter(iou => iou.status === 'Unpaid').length +
            borrowerResult.rows.filter(iou => iou.status === 'Unpaid').length
        }
      }
    });

  } catch (error) {
    console.error('Get IOUs error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching IOUs' });
  }
};

/**
 * @desc    Get a single IOU with full payment history
 * @route   GET /api/ious/:id
 * @access  Protected
 */
const getIOUById = async (req, res) => {
  try {
    const iouId = req.params.id;
    const userId = req.user.userId;

    // Join with Users table to get lender and borrower names
    const iouResult = await pool.query(`
      SELECT
        i.*,
        l.name AS lender_name, l.email AS lender_email,
        b.name AS borrower_name, b.email AS borrower_email
      FROM IOURecords i
      JOIN Users l ON i.lender_id = l.user_id
      JOIN Users b ON i.borrower_id = b.user_id
      WHERE i.iou_id = $1
    `, [iouId]);

    if (iouResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'IOU not found' });
    }

    const iou = iouResult.rows[0];

    // Only the lender or borrower can view this IOU
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this IOU'
      });
    }

    // Fetch all payments for this IOU
    const paymentsResult = await pool.query(
      'SELECT * FROM Payments WHERE iou_id = $1 ORDER BY payment_date DESC',
      [iouId]
    );

    const totalPaid = paymentsResult.rows.reduce(
      (sum, payment) => sum + parseFloat(payment.payment_amount), 0
    );
    const remainingBalance = parseFloat(iou.amount) - totalPaid;

    res.json({
      success: true,
      data: {
        iou: { ...iou, amount: parseFloat(iou.amount) },
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
    res.status(500).json({ success: false, message: 'Server error while fetching IOU details' });
  }
};

/**
 * @desc    Create a new IOU (authenticated user becomes the lender)
 * @route   POST /api/ious
 * @access  Protected
 */
const createIOU = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.userId;
    const { borrower_id, lender_id, amount, reason, role } = req.body;

    let finalLenderId, finalBorrowerId;

    if (role === 'borrower') {
      // Current user is the borrower — they owe money to lender_id
      if (!lender_id) {
        return res.status(400).json({ success: false, message: 'lender_id is required when role is borrower' });
      }
      finalLenderId = parseInt(lender_id);
      finalBorrowerId = userId;
    } else {
      // Default: current user is the lender — borrower_id owes them
      if (!borrower_id) {
        return res.status(400).json({ success: false, message: 'borrower_id is required' });
      }
      finalLenderId = userId;
      finalBorrowerId = parseInt(borrower_id);
    }

    if (finalLenderId === finalBorrowerId) {
      return res.status(400).json({ success: false, message: 'You cannot create an IOU with yourself' });
    }

    const otherUserId = role === 'borrower' ? finalLenderId : finalBorrowerId;
    const borrowerExists = await pool.query('SELECT user_id FROM Users WHERE user_id = $1', [otherUserId]);
    if (borrowerExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await pool.query(
      'INSERT INTO IOURecords (lender_id, borrower_id, amount, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [finalLenderId, finalBorrowerId, amount, reason]
    );

    res.status(201).json({
      success: true,
      message: 'IOU created successfully',
      data: { ...result.rows[0], amount: parseFloat(result.rows[0].amount) }
    });

  } catch (error) {
    console.error('Create IOU error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating IOU' });
  }
};

/**
 * @desc    Update an IOU (amount, reason, status) - only lender can update
 * @route   PUT /api/ious/:id
 * @access  Protected
 */
const updateIOU = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const iouId = req.params.id;
    const userId = req.user.userId;
    const { amount, reason, status } = req.body;

    // Require at least one field to update
    if (amount === undefined && reason === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (amount, reason, status) is required'
      });
    }

    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iouId]
    );
    if (iouResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'IOU not found' });
    }

    const iou = iouResult.rows[0];

    // Only the lender can fully update an IOU
    if (iou.lender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the lender can update this IOU'
      });
    }

    // Build dynamic SET clause to only update provided fields
    const updates = [];
    const values = [];
    let idx = 1;

    if (amount !== undefined) { updates.push(`amount = $${idx++}`); values.push(amount); }
    if (reason !== undefined) { updates.push(`reason = $${idx++}`); values.push(reason); }
    if (status !== undefined) { updates.push(`status = $${idx++}`); values.push(status); }

    values.push(iouId);

    const result = await pool.query(
      `UPDATE IOURecords SET ${updates.join(', ')} WHERE iou_id = $${idx} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'IOU updated successfully',
      data: { ...result.rows[0], amount: parseFloat(result.rows[0].amount) }
    });

  } catch (error) {
    console.error('Update IOU error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating IOU' });
  }
};

/**
 * @desc    Quickly toggle IOU status between Unpaid and Paid
 * @route   PATCH /api/ious/:id
 * @access  Protected
 */
const patchIOU = async (req, res) => {
  try {
    const iouId = req.params.id;
    const userId = req.user.userId;
    const { status } = req.body;

    if (!status || !['Unpaid', 'Paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "Unpaid" or "Paid"'
      });
    }

    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iouId]
    );
    if (iouResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'IOU not found' });
    }

    const iou = iouResult.rows[0];

    // Both lender and borrower can update status
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this IOU'
      });
    }

    const result = await pool.query(
      'UPDATE IOURecords SET status = $1 WHERE iou_id = $2 RETURNING *',
      [status, iouId]
    );

    res.json({
      success: true,
      message: 'IOU status updated successfully',
      data: { ...result.rows[0], amount: parseFloat(result.rows[0].amount) }
    });

  } catch (error) {
    console.error('Patch IOU error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating IOU' });
  }
};

/**
 * @desc    Delete an IOU - only lender can delete
 *          Associated payments are removed automatically via ON DELETE CASCADE FK constraint
 * @route   DELETE /api/ious/:id
 * @access  Protected
 */
const deleteIOU = async (req, res) => {
  try {
    const iouId = req.params.id;
    const userId = req.user.userId;

    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iouId]
    );
    if (iouResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'IOU not found' });
    }

    const iou = iouResult.rows[0];

    // Only the lender can delete the IOU
    if (iou.lender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the lender can delete this IOU'
      });
    }

    // ON DELETE CASCADE on the Payments FK automatically removes associated payments
    await pool.query('DELETE FROM IOURecords WHERE iou_id = $1', [iouId]);

    res.json({ success: true, message: 'IOU deleted successfully' });

  } catch (error) {
    console.error('Delete IOU error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting IOU' });
  }
};

module.exports = { getAllIOUs, getIOUById, createIOU, updateIOU, patchIOU, deleteIOU };
