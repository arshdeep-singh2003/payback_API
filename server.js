require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const iouRoutes = require('./routes/ious');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
      ious: {
        list: 'GET /api/ious',
        details: 'GET /api/ious/:id',
        create: 'POST /api/ious',
        update: 'PATCH /api/ious/:id',
        delete: 'DELETE /api/ious/:id'
      },
      payments: {
        create: 'POST /api/payments',
        list: 'GET /api/payments?iou_id=:id'
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ious', iouRoutes);
app.use('/api/payments', paymentRoutes);

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

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║   💰 PayBack API Server Running 💰     ║
║                                        ║
║   Port: ${PORT.toString().padEnd(32)}║
║   Environment: ${process.env.NODE_ENV?.padEnd(23) || 'development'.padEnd(23)}║
║                                        ║
║   Ready to track IOUs! 🎯              ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
