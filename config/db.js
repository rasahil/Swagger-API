// config/db.js
const mongoose = require('mongoose');
// require('dotenv').config(); // Not strictly needed here if server.js does it first

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI); // No options needed for new Mongoose versions usually
        console.log(`MongoDB Connected: ${conn.connection.host} to database ${conn.connection.name}`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        console.error(err); // Log the full error object
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;