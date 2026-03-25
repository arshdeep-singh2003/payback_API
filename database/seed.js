const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await pool.query('DELETE FROM Payments');
    await pool.query('DELETE FROM IOURecords');
    await pool.query('DELETE FROM Users');

    const salt = await bcrypt.genSalt(10);
    
    const users = [
      {
        name: 'Arshdeep Singh',
        email: 'arshdeep@example.com',
        password: 'Test@123'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@123'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Test@123'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'Test@123'
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: 'Test@123'
      }
    ];

    const userIds = [];
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, salt);
      const result = await pool.query(
        'INSERT INTO Users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
        [user.name, user.email, passwordHash]
      );
      userIds.push(result.rows[0].user_id);
    }

    const ious = [
      { lender: 0, borrower: 1, amount: 50.00, reason: 'Lunch at restaurant' },
      { lender: 1, borrower: 0, amount: 25.50, reason: 'Uber ride to airport' },
      { lender: 0, borrower: 2, amount: 100.00, reason: 'Gaming console repair' },
      { lender: 2, borrower: 0, amount: 75.00, reason: 'Electricity bill payment' },
      { lender: 1, borrower: 3, amount: 150.00, reason: 'Trip expenses splitting' },
      { lender: 3, borrower: 1, amount: 45.00, reason: 'Movie tickets and snacks' },
      { lender: 0, borrower: 4, amount: 80.00, reason: 'Month rent coverage' },
      { lender: 4, borrower: 0, amount: 60.00, reason: 'Groceries shopping' }
    ];

    const iouIds = [];
    for (const iou of ious) {
      const result = await pool.query(
        'INSERT INTO IOURecords (lender_id, borrower_id, amount, reason, status) VALUES ($1, $2, $3, $4, $5) RETURNING iou_id',
        [userIds[iou.lender], userIds[iou.borrower], iou.amount, iou.reason, 'Unpaid']
      );
      iouIds.push(result.rows[0].iou_id);
    }

    const payments = [
      { iouIndex: 0, amount: 25.00 },
      { iouIndex: 1, amount: 25.50 },
      { iouIndex: 2, amount: 50.00 },
      { iouIndex: 3, amount: 75.00 },
      { iouIndex: 4, amount: 75.00 },
      { iouIndex: 5, amount: 45.00 },
      { iouIndex: 6, amount: 40.00 },
      { iouIndex: 7, amount: 60.00 }
    ];

    for (const payment of payments) {
      await pool.query(
        'INSERT INTO Payments (iou_id, payment_amount) VALUES ($1, $2)',
        [iouIds[payment.iouIndex], payment.amount]
      );
    }

    console.log('Database seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
