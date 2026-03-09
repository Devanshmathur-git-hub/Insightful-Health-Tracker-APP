const express = require('express');
const router = express.Router();
const { addMeal, getMeals, getMeal, updateMeal, deleteMeal } = require('../controllers/mealController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/meals:
 *   post:
 *     tags: [🥗 Meals]
 *     summary: Log a meal with calories and macros
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealInput'
 *     responses:
 *       201:
 *         description: Meal logged
 *   get:
 *     tags: [🥗 Meals]
 *     summary: Get meal history
 *     parameters:
 *       - in: query
 *         name: mealType
 *         schema: { type: string, enum: [breakfast, lunch, dinner, snack] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date, example: '2026-03-09' }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of meals
 */
router.route('/').post(addMeal).get(getMeals);

/**
 * @swagger
 * /api/v1/meals/{id}:
 *   get:
 *     tags: [🥗 Meals]
 *     summary: Get a specific meal
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Meal found
 *   put:
 *     tags: [🥗 Meals]
 *     summary: Update a meal
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealInput'
 *     responses:
 *       200:
 *         description: Meal updated
 *   delete:
 *     tags: [🥗 Meals]
 *     summary: Delete a meal
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Meal deleted
 */
router.route('/:id').get(getMeal).put(updateMeal).delete(deleteMeal);

module.exports = router;
