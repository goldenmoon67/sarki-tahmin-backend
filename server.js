// server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json()); // Body parser

// Routes
app.use('/api/auth', authRoutes);

// Error Handling Middleware (should be last)
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
