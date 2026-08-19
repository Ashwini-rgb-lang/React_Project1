require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const bookingsRouter = require('./routes/bookings');
const contactRouter = require('./routes/contact');
const carTypesRouter = require('./routes/carTypes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car_rental';
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');

// --- Middleware ---
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting on write-heavy public endpoints (bookings/contact forms)
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/bookings', formLimiter);
app.use('/api/contact', formLimiter);

// --- Routes ---
app.use('/api/bookings', bookingsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/car-types', carTypesRouter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Krishna Car Travels API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong on the server' });
});

// --- Start server after DB connects ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
