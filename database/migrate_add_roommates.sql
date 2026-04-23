-- Migration: Add Roommates table
-- Run this once against your existing database (does NOT drop existing tables)

CREATE TABLE IF NOT EXISTS Roommates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    roommate_user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, roommate_user_id),
    CONSTRAINT no_self_roommate CHECK (user_id != roommate_user_id)
);

CREATE INDEX IF NOT EXISTS idx_roommates_user ON Roommates(user_id);
