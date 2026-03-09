const express = require('express');
const router = express.Router();
const {
    register, login, logout, getMe,
    updateProfile, changePassword, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Logout current user
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [🔐 Auth]
 *     summary: Get current logged-in user profile
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/v1/auth/update-profile:
 *   put:
 *     tags: [🔐 Auth]
 *     summary: Update user profile (name, age, weight, height, emergency contact)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:              { type: string, example: John Doe }
 *               age:               { type: integer, example: 29 }
 *               weight:            { type: number, example: 72 }
 *               height:            { type: number, example: 176 }
 *               emergencyContact:  { type: string, example: Jane Doe }
 *               emergencyPhone:    { type: string, example: '+919876543210' }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/update-profile', protect, updateProfile);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     tags: [🔐 Auth]
 *     summary: Change current user's password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, example: password123 }
 *               newPassword:     { type: string, example: newSecurePass456 }
 *     responses:
 *       200:
 *         description: Password changed, new token returned
 *       401:
 *         description: Current password incorrect
 */
router.put('/change-password', protect, changePassword);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Request password reset link (sent via email)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: john@health.com }
 *     responses:
 *       200:
 *         description: Reset link sent (token included in dev mode)
 *       404:
 *         description: No account with that email
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   put:
 *     tags: [🔐 Auth]
 *     summary: Reset password using token from email
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, minLength: 6, example: newPassword123 }
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.put('/reset-password/:token', resetPassword);

module.exports = router;
