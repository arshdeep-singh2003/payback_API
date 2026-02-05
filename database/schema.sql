-- PayBack Database Schema
-- PostgreSQL Database for Informal Roommate IOU Tracker

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS Payments CASCADE;
DROP TABLE IF EXISTS IOURecords CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Create Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create IOURecords table
CREATE TABLE IOURecords (
    iou_id SERIAL PRIMARY KEY,
    lender_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    borrower_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_users CHECK (lender_id != borrower_id)
);

-- Create Payments table
CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    iou_id INTEGER NOT NULL REFERENCES IOURecords(iou_id) ON DELETE CASCADE,
    payment_amount DECIMAL(10,2) NOT NULL CHECK (payment_amount > 0),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_ious_lender ON IOURecords(lender_id);
CREATE INDEX idx_ious_borrower ON IOURecords(borrower_id);
CREATE INDEX idx_payments_iou ON Payments(iou_id);
CREATE INDEX idx_users_email ON Users(email);

-- Sample data for testing (optional)
-- INSERT INTO Users (name, email, password_hash) VALUES
-- ('John Doe', 'john@example.com', '$2a$10$samplehash1'),
-- ('Jane Smith', 'jane@example.com', '$2a$10$samplehash2');

-- INSERT INTO IOURecords (lender_id, borrower_id, amount, reason, status) VALUES
-- (1, 2, 25.00, 'Lunch at restaurant', 'Unpaid'),
-- (2, 1, 15.50, 'Uber ride', 'Unpaid');

-- INSERT INTO Payments (iou_id, payment_amount) VALUES
-- (1, 10.00);
