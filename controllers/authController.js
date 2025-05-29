// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // bcryptjs is used in the User model for hashing passwords
// bcryptjs might be needed if you do comparisons outside the model, but matchPassword handles it.

// Helper function to generate token
const generateToken = (id) => {

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Or your preferred expiration
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username, email, and password' });
        }
        // More validation can be added here (e.g., password length, email format using validator)

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ success: false, message: 'Username is already taken' });
        }
        console.log('Attempting to create user with:', { username, email }); // Add this log

        user = await User.create({
            username,
            email,
            password, // Password will be hashed by the pre-save hook
        });

            console.log('User created successfully in DB:', user._id); // Add this log

        const token = generateToken(user._id);

        // To avoid sending password back, even hashed one from the create operation's immediate return
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('!!!!!!!!!! ERROR DURING USER CREATION PROCESS !!!!!!!!!!!');
        console.error(error); // THIS IS THE MOST IMPORTANT LOG FOR DB ERRORS
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        // Ensure any other specific Mongoose errors are handled or fall through
        return res.status(500).json({ success: false, message: 'Server Error during registration process' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email }).select('+password'); // Explicitly select password

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials (user not found)' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials (password mismatch)' });
        }

        const token = generateToken(user._id);

        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        };

        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error during login' });
    }
};

// (Optional for now, but good for testing JWTs)
// @desc    Get current logged in user (Example of a protected route)
// @route   GET /api/auth/me
// @access  Private
// const { protect } = require('../middleware/authMiddleware'); // You'd need this middleware
exports.getMe = async (req, res, next) => {
    // This function assumes 'protect' middleware has run and attached 'req.user'
    // For now, we'll just respond with a placeholder if called without protection
    // or you can test it after implementing and applying the authMiddleware.
    if (!req.user) { // req.user would be set by your authMiddleware
        return res.status(401).json({ success: false, message: 'Not authorized to access this route without logging in first or middleware not applied' });
    }
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user.id).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};