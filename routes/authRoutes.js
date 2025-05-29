// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have this for protected routes like /me

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Desired username for the user.
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: Email address for the user.
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Password for the user (min 6 characters).
 *           example: password123
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60564fcb544047cdc3844818
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           example: johndoe@example.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwNTY0ZmNiNTQ0MDQ3Y2RjMzg0NDgxOCIsImlhdCI6MTYxNjI2Nzk4NywiZXhwIjoxNjE4ODY3OTg3fQ.tYJ3h0PZ4x...
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 *   securitySchemes: # Moved from server.js for better organization if you prefer
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request (e.g., user already exists, validation error, missing fields)
 *       500:
 *         description: Server error
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or user not found / missing fields
 *       500:
 *         description: Server error
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user's details
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: [] # Indicates this endpoint requires JWT bearer token
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Not authorized (token missing, invalid, or expired)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// router.get('/me', protect, getMe); // Uncomment if you have protect middleware and want to test it

module.exports = router;