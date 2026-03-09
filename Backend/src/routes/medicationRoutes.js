const express = require('express');
const router = express.Router();
const { addMedication, getMedications, getMedication, updateMedication, deleteMedication, markTaken } = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/medications:
 *   post:
 *     tags: [💊 Medications]
 *     summary: Add a medication reminder (also creates a notification)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationInput'
 *     responses:
 *       201:
 *         description: Medication reminder created
 *   get:
 *     tags: [💊 Medications]
 *     summary: Get all medication reminders
 *     parameters:
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of medications
 */
router.route('/').post(addMedication).get(getMedications);

/**
 * @swagger
 * /api/v1/medications/{id}/taken:
 *   put:
 *     tags: [💊 Medications]
 *     summary: Mark a medication as taken ✓
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medication marked as taken with timestamp
 */
router.put('/:id/taken', markTaken);

/**
 * @swagger
 * /api/v1/medications/{id}:
 *   get:
 *     tags: [💊 Medications]
 *     summary: Get a medication by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medication found
 *   put:
 *     tags: [💊 Medications]
 *     summary: Update a medication reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationInput'
 *     responses:
 *       200:
 *         description: Medication updated
 *   delete:
 *     tags: [💊 Medications]
 *     summary: Delete a medication reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medication deleted
 */
router.route('/:id').get(getMedication).put(updateMedication).delete(deleteMedication);

module.exports = router;
