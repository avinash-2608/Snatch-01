require('dotenv').config();
// Trigger nodemon restart for env hooks
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const offerRoutes = require('./routes/offerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const requestRoutes = require('./routes/requestRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const splitRoutes = require('./routes/splitRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/offers', offerRoutes);
app.use('/admin', adminRoutes);
app.use('/requests', requestRoutes);
app.use('/ai', aiRoutes);
app.use('/payment', paymentRoutes);
app.use('/splits', splitRoutes);
app.use('/api/messages', messageRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Snatch API' });
});

// Global error handling middleware (4 params required for Express error handler)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server immediately
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
