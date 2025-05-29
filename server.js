const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Adjust path if needed
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors'); // <--- IMPORT THE CORS PACKAGE

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- ENABLE CORS ---
// This will allow requests from any origin.
// For production, you might want to configure it more restrictively:
// app.use(cors({ origin: 'http://your-frontend-domain.com' }));
app.use(cors()); // <--- USE THE CORS MIDDLEWARE HERE

// Body Parser Middleware (to accept JSON data)
app.use(express.json());

// Define Routes (example)
app.use('/api/auth', require('./routes/authRoutes')); // Authentication routes
// app.use('/api/users', require('./routes/userRoutes')); // Other user-related routes

// Swagger Options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0', // Or '2.0'
        info: {
            title: 'Sign Up/My API Documentation',
            version: '1.0.0',
            description: 'API for user registration and login, testable on Swagger itself.',
            contact: {
                name: 'Your Name',
                email: 'your.email@example.com'
            },
        },
        servers: [
           {
                // This URL tells Swagger UI WHERE to send the API requests.
                // Make sure this matches the base URL of your API.
                url: `http://localhost:${process.env.PORT || 5000}/api`,
                description: 'Development server'
            }
        ],
        components: { // Important for defining security schemes for JWT
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{ // Apply bearerAuth globally to all operations that don't override it
            bearerAuth: []
        }]
    },
    // Path to the API docs (your route files with JSDoc comments)
    apis: ['./routes/*.js'], // Adjust if your routes are elsewhere
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.get('/', (req, res) => res.send('API Running')); // Simple test route

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => { // <--- Assign to 'server' for graceful shutdown
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`MongoDB Connected...`); // Assuming connectDB() logs this or you move the log here
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    if (server) { // Check if server is defined before calling close
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
})