require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const iouRoutes = require('./routes/ious');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const roommateRoutes = require('./routes/roommates');
const setupRoutes = require('./routes/setup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PayBack API - Informal Roommate IOU Tracker',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: {
        list: 'GET /api/users',
        details: 'GET /api/users/:id'
      },
      ious: {
        list: 'GET /api/ious',
        details: 'GET /api/ious/:id',
        create: 'POST /api/ious',
        update: 'PUT /api/ious/:id',
        patch_status: 'PATCH /api/ious/:id',
        delete: 'DELETE /api/ious/:id'
      },
      payments: {
        list: 'GET /api/payments?iou_id=:id',
        create: 'POST /api/payments',
        update: 'PUT /api/payments/:id',
        delete: 'DELETE /api/payments/:id'
      }
    },
    documentation: 'See payback-collection.json for Postman collection'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ious', iouRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/setup', setupRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
