// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
exports.registerUser = async (req, res) => {
    const { nickname, email, password } = req.body;
  
    try {
      // Check if the email or nickname already exists
      let user = await User.findOne({ $or: [{ email }, { nickname }] });
      if (user) {
        if (user.email === email) {
          return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
        } else if (user.nickname === nickname) {
          return res.status(400).json({ errors: [{ msg: 'Nickname already exists' }] });
        }
      }
  
      // Create a new user
      user = new User({
        nickname,
        email,
        password: await bcrypt.hash(password, 10), // Encrypt password
      });
  
      await user.save();
  
      // Create and return JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      if (error.code === 11000) {
        if (error.keyPattern.email) {
          return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
        }
        if (error.keyPattern.nickname) {
          return res.status(400).json({ errors: [{ msg: 'Nickname already exists' }] });
        }
      }
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  };
// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }
  
      // Return JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  };
  