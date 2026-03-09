const express = require('express');
const router = express.Router();
const { addSleep, getAllSleep, getSleep, updateSleep, deleteSleep } = require('../controllers/sleepController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/sleep:
 *   post:
 *     tags: [😴 Sleep]
 *     summary: Log a sleep session (duration auto-calculated from start/end times)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SleepInput'
 *     responses:
 *       201:
 *         description: Sleep record saved with auto-calculated duration
 *   get:
 *     tags: [😴 Sleep]
 *     summary: Get all sleep records
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of sleep records
 */
router.route('/').post(addSleep).get(getAllSleep);

/**
 * @swagger
 * /api/v1/sleep/{id}:
 *   get:
 *     tags: [😴 Sleep]
 *     summary: Get a sleep record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sleep record found
 *   put:
 *     tags: [😴 Sleep]
 *     summary: Update a sleep record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SleepInput'
 *     responses:
 *       200:
 *         description: Record updated
 *   delete:
 *     tags: [😴 Sleep]
 *     summary: Delete a sleep record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record deleted
 */
router.route('/:id').get(getSleep).put(updateSleep).delete(deleteSleep);

module.exports = router;
