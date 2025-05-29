const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        // Consider adding a validator for email format
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Don't return password by default when querying users
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    // You can add more fields like name, role, etc.
});

// Middleware to hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// (Optional) Method to generate JWT - can also be in controllers
// UserSchema.methods.getSignedJwtToken = function() {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: '30d' // or your preferred expiration
//     });
// };

module.exports = mongoose.model('User', UserSchema);