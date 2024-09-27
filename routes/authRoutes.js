// routes/authRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    body('nickname', 'Nickname is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  registerUser
);

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  loginUser
);

module.exports = router;
