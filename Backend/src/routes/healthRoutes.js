const express = require('express');
const router = express.Router();
const { addRecord, getRecords, getRecord, updateRecord, deleteRecord } = require('../controllers/healthController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/health-records:
 *   post:
 *     tags: [❤️ Health Records]
 *     summary: Add a new health record (HR, BP, Sugar, Temp, Weight)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthRecordInput'
 *     responses:
 *       201:
 *         description: Health record saved (BMI auto-calculated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   get:
 *     tags: [❤️ Health Records]
 *     summary: Get all health records for the current user
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: '2026-03-01' }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: '2026-03-09' }
 *     responses:
 *       200:
 *         description: List of health records
 */
router.route('/').post(addRecord).get(getRecords);

/**
 * @swagger
 * /api/v1/health-records/{id}:
 *   get:
 *     tags: [❤️ Health Records]
 *     summary: Get a single health record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Health record found
 *       404:
 *         description: Record not found
 *   put:
 *     tags: [❤️ Health Records]
 *     summary: Update a health record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthRecordInput'
 *     responses:
 *       200:
 *         description: Record updated
 *   delete:
 *     tags: [❤️ Health Records]
 *     summary: Delete a health record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record deleted
 */
router.route('/:id').get(getRecord).put(updateRecord).delete(deleteRecord);

module.exports = router;
