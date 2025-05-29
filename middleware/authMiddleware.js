const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Else if (req.cookies.token) { // Alternative: Get token from cookie
    //  token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password'); // Attach user to request object, exclude password

        if (!req.user) {
             return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};