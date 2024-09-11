const userHandler = require('./handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.createUser = async (req, res, next) => {
    try {
        const { email, nickname, password } = req.body;

        // Check if all required fields are provided
        if (!email || !nickname || !password) {
            return res.status(400).json({ error: 'Email, nickname, and password are required.', errorCode:400.01});
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.',errorCode:400.02});
        }

        // Validate password length (minimum 6 characters)
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.',errorCode:400.03 });
        }
        // Check if the nickname is already taken
        const existingUser = await userHandler.findBynickname(nickname);
        if (existingUser) {
            return res.status(400).json({ error: 'Nickname is already taken.' ,errorCode:400.04});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await userHandler.createUser(email, hashedPassword, nickname);
        return res.status(201).json({ userId: result.id });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};





exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // Find the user by email
        const user = await userHandler.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Compare provided password with hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({ token });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


