const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead, createNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [🔔 Notifications]
 *     summary: Get all notifications for the current user
 *     parameters:
 *       - in: query
 *         name: read
 *         schema: { type: boolean }
 *         description: Filter by read status
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Notifications list with unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 unreadCount: { type: integer, example: 3 }
 *                 data: { type: array, items: { type: object } }
 *   post:
 *     tags: [🔔 Notifications]
 *     summary: Create a custom notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title:    { type: string, example: 'Health Alert' }
 *               message:  { type: string, example: 'Time to log your vitals!' }
 *               type:     { type: string, enum: [medication_reminder, health_alert, report_ready, goal_achieved, general] }
 *               priority: { type: string, enum: [low, medium, high] }
 *     responses:
 *       201:
 *         description: Notification created
 */
router.route('/').get(getNotifications).post(createNotification);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   put:
 *     tags: [🔔 Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', markAllRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     tags: [🔔 Notifications]
 *     summary: Mark a single notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', markAsRead);

module.exports = router;
