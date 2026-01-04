const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX_REQUESTS,
});
app.use('/api/', limiter);

// Import route handlers
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const agencyRoutes = require('./routes/agency.routes');
const countryGuideRoutes = require('./routes/countryGuide.routes');
const calculatorRoutes = require('./routes/calculator.routes');
const agencyReviewRoutes = require('./routes/agencyReview.routes');
const agencyComplaintRoutes = require('./routes/agencyComplaint.routes');
const workerProfileRoutes = require('./routes/workerProfile.routes');

// ===== API ROUTES (Register BEFORE error handling) =====
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/countries', countryGuideRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/agencies', agencyReviewRoutes);
app.use('/api/agencies', agencyComplaintRoutes);
app.use('/api/workers', workerProfileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// ===== ERROR HANDLING (Must be LAST) =====
const errorMiddleware = require('./middleware/error.middleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;