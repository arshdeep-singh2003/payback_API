const { validationResult } = require('express-validator');
const pool = require('../database/db');

/**
 * @desc    Record a payment on an IOU
 * @route   POST /api/payments
 * @access  Protected
 */
const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.userId;
    const { iou_id, payment_amount } = req.body;

    // Verify IOU exists
    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iou_id]
    );
    if (iouResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'IOU not found' });
    }

    const iou = iouResult.rows[0];

    // Only lender or borrower can add payments
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add payments to this IOU'
      });
    }

    // Calculate current remaining balance
    const paymentsResult = await pool.query(
      'SELECT COALESCE(SUM(payment_amount), 0) AS total_paid FROM Payments WHERE iou_id = $1',
      [iou_id]
    );

    const totalPaid = parseFloat(paymentsResult.rows[0].total_paid);
    const remainingBalance = parseFloat(iou.amount) - totalPaid;

    // Prevent overpayment
    if (parseFloat(payment_amount) > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment amount ($${payment_amount}) exceeds remaining balance ($${remainingBalance.toFixed(2)})`
      });
    }

    // Insert payment - iou_id is a Foreign Key to IOURecords (One-to-Many)
    const result = await pool.query(
      'INSERT INTO Payments (iou_id, payment_amount) VALUES ($1, $2) RETURNING *',
      [iou_id, payment_amount]
    );

    const newRemainingBalance = remainingBalance - parseFloat(payment_amount);

    // Auto-mark IOU as Paid when fully settled
    if (newRemainingBalance <= 0) {
      await pool.query(
        "UPDATE IOURecords SET status = 'Paid' WHERE iou_id = $1",
        [iou_id]
      );
    }

    res.status(201).json({
      success: true,
      message: newRemainingBalance <= 0
        ? 'Payment recorded and IOU marked as Paid'
        : 'Payment recorded successfully',
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
    res.status(500).json({ success: false, message: 'Server error while recording payment' });
  }
};

/**
 * @desc    Get all payments for a specific IOU
 * @route   GET /api/payments?iou_id=:id
 * @access  Protected
 */
const getPayments = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.userId;
    const { iou_id } = req.query;

    // Verify IOU exists and user is authorized
    const iouResult = await pool.query(
      'SELECT * FROM IOURecords WHERE iou_id = $1',
      [iou_id]
    );
    if (iouResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'IOU not found' });
    }

    const iou = iouResult.rows[0];

    // Only lender or borrower can view payments
    if (iou.lender_id !== userId && iou.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view payments for this IOU'
      });
    }

    const paymentsResult = await pool.query(
      'SELECT * FROM Payments WHERE iou_id = $1 ORDER BY payment_date DESC',
      [iou_id]
    );

    const totalPaid = paymentsResult.rows.reduce(
      (sum, payment) => sum + parseFloat(payment.payment_amount), 0
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
    res.status(500).json({ success: false, message: 'Server error while fetching payments' });
  }
};

/**
 * @desc    Update an existing payment amount
 * @route   PUT /api/payments/:id
 * @access  Protected
 */
const updatePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const paymentId = req.params.id;
    const userId = req.user.userId;
    const { payment_amount } = req.body;

    // Join with IOURecords to get authorization info and IOU amount in one query
    const paymentResult = await pool.query(
      `SELECT p.*, i.lender_id, i.borrower_id, i.amount AS iou_amount
       FROM Payments p
       JOIN IOURecords i ON p.iou_id = i.iou_id
       WHERE p.payment_id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Only lender or borrower can update this payment
    if (payment.lender_id !== userId && payment.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this payment'
      });
    }

    // Calculate max allowed: IOU total minus all OTHER payments on this IOU
    const otherPayments = await pool.query(
      'SELECT COALESCE(SUM(payment_amount), 0) AS total FROM Payments WHERE iou_id = $1 AND payment_id != $2',
      [payment.iou_id, paymentId]
    );

    const otherTotal = parseFloat(otherPayments.rows[0].total);
    const maxAllowed = parseFloat(payment.iou_amount) - otherTotal;

    if (parseFloat(payment_amount) > maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Payment amount exceeds remaining balance ($${maxAllowed.toFixed(2)})`
      });
    }

    const result = await pool.query(
      'UPDATE Payments SET payment_amount = $1 WHERE payment_id = $2 RETURNING *',
      [payment_amount, paymentId]
    );

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: {
        ...result.rows[0],
        payment_amount: parseFloat(result.rows[0].payment_amount)
      }
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating payment' });
  }
};

/**
 * @desc    Delete a payment record
 *          Resets IOU status to Unpaid if it was previously marked Paid
 * @route   DELETE /api/payments/:id
 * @access  Protected
 */
const deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.userId;

    // Join with IOURecords to get authorization info in one query
    const paymentResult = await pool.query(
      `SELECT p.*, i.lender_id, i.borrower_id
       FROM Payments p
       JOIN IOURecords i ON p.iou_id = i.iou_id
       WHERE p.payment_id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Only lender or borrower can delete this payment
    if (payment.lender_id !== userId && payment.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this payment'
      });
    }

    await pool.query('DELETE FROM Payments WHERE payment_id = $1', [paymentId]);

    // If IOU was marked Paid, reset it to Unpaid since a payment was removed
    await pool.query(
      "UPDATE IOURecords SET status = 'Unpaid' WHERE iou_id = $1 AND status = 'Paid'",
      [payment.iou_id]
    );

    res.json({ success: true, message: 'Payment deleted successfully' });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting payment' });
  }
};

module.exports = { createPayment, getPayments, updatePayment, deletePayment };
