// routes/roomRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { createRoom } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a room
router.post(
  '/create',
  authMiddleware,
  [
    body('roomType')
      .isIn(['public', 'private'])
      .withMessage('Room type must be either public or private'),
    body('category', 'Category is required').not().isEmpty(),
    body('songSkipTime')
      .isInt({ min: 5, max: 120 })
      .withMessage('Song skip time must be between 5 and 120 seconds'),
    body('pointLimit')
      .isInt({ min: 1, max: 50 })
      .withMessage('Point limit must be between 1 and 50'),
    body('competitionType')
      .isIn(['multiple-choice', 'text'])
      .withMessage('Competition type must be either multiple-choice or text')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createRoom
);

module.exports = router;
