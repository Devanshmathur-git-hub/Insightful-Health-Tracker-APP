const express = require('express');
const router = express.Router();
const { addActivity, getActivities, getActivity, updateActivity, deleteActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/activities:
 *   post:
 *     tags: [🏃 Activities]
 *     summary: Log a new activity (steps, calories, distance, workout)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *     responses:
 *       201:
 *         description: Activity logged
 *   get:
 *     tags: [🏃 Activities]
 *     summary: Get all activities for the current user
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [running, walking, cycling, swimming, gym, yoga, other] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of activities
 */
router.route('/').post(addActivity).get(getActivities);

/**
 * @swagger
 * /api/v1/activities/{id}:
 *   get:
 *     tags: [🏃 Activities]
 *     summary: Get activity by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Activity found
 *   put:
 *     tags: [🏃 Activities]
 *     summary: Update an activity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *     responses:
 *       200:
 *         description: Activity updated
 *   delete:
 *     tags: [🏃 Activities]
 *     summary: Delete an activity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Activity deleted
 */
router.route('/:id').get(getActivity).put(updateActivity).delete(deleteActivity);

module.exports = router;
