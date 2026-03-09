const express = require('express');
const router = express.Router();
const { getDailyReport, getWeeklyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/reports/daily:
 *   get:
 *     tags: [📊 Reports]
 *     summary: Get today's health summary (all metrics aggregated)
 *     responses:
 *       200:
 *         description: Daily report with health, activity, nutrition, and sleep summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 date: { type: string, format: date }
 *                 data:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: object
 *                       properties:
 *                         heartRate: { type: number }
 *                         bloodPressure: { type: string }
 *                         bloodSugar: { type: number }
 *                         temperature: { type: number }
 *                         weight: { type: number }
 *                         bmi: { type: number }
 *                     activity:
 *                       type: object
 *                       properties:
 *                         totalSteps: { type: number }
 *                         totalCaloriesBurned: { type: number }
 *                         totalDistance: { type: number }
 *                         workouts: { type: integer }
 *                     nutrition:
 *                       type: object
 *                       properties:
 *                         totalCaloriesConsumed: { type: number }
 *                         netCalories: { type: number }
 *                         macros:
 *                           type: object
 *                           properties:
 *                             protein: { type: number }
 *                             carbs: { type: number }
 *                             fats: { type: number }
 *                     sleep:
 *                       type: object
 *                       properties:
 *                         totalMinutes: { type: number }
 *                         totalHours: { type: number }
 *                         avgQuality: { type: number }
 */
router.get('/daily', getDailyReport);

/**
 * @swagger
 * /api/v1/reports/weekly:
 *   get:
 *     tags: [📊 Reports]
 *     summary: Get 7-day aggregated health report with chart-ready data points
 *     responses:
 *       200:
 *         description: Weekly report with summary stats and daily chart data for all metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 period:
 *                   type: object
 *                   properties:
 *                     start: { type: string, format: date }
 *                     end: { type: string, format: date }
 *                     days: { type: integer, example: 7 }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     avgHeartRate: { type: number }
 *                     totalSteps: { type: number }
 *                     totalCaloriesBurned: { type: number }
 *                     avgSleepHours: { type: number }
 *                     workouts: { type: integer }
 *                 charts:
 *                   type: object
 *                   description: Daily data arrays for charting (heartRate, steps, calories, sleep)
 */
router.get('/weekly', getWeeklyReport);

module.exports = router;
