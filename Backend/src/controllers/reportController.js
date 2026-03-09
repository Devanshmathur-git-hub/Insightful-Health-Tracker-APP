const HealthRecord = require('../models/HealthRecord');
const Activity = require('../models/Activity');
const Meal = require('../models/Meal');
const Sleep = require('../models/Sleep');
const asyncHandler = require('../utils/asyncHandler');

// Helper — get date range
const getDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
};

// @route   GET /api/v1/reports/daily
exports.getDailyReport = asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const userId = req.user.id;
    const dateFilter = { $gte: startOfDay, $lt: endOfDay };

    const [healthRecords, activities, meals, sleep] = await Promise.all([
        HealthRecord.find({ user: userId, recordedAt: dateFilter }).sort({ recordedAt: -1 }),
        Activity.find({ user: userId, date: dateFilter }),
        Meal.find({ user: userId, date: dateFilter }),
        Sleep.find({ user: userId, date: dateFilter }),
    ]);

    // Aggregate totals
    const totalCaloriesConsumed = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalCaloriesBurned = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
    const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
    const totalSleepMinutes = sleep.reduce((sum, s) => sum + (s.duration || 0), 0);

    const latestHealth = healthRecords[0] || {};
    const macros = meals.reduce(
        (acc, m) => ({
            protein: acc.protein + (m.protein || 0),
            carbs: acc.carbs + (m.carbs || 0),
            fats: acc.fats + (m.fats || 0),
        }),
        { protein: 0, carbs: 0, fats: 0 }
    );

    res.status(200).json({
        success: true,
        date: startOfDay,
        data: {
            health: {
                heartRate: latestHealth.heartRate,
                bloodPressure: latestHealth.bloodPressure?.reading,
                bloodSugar: latestHealth.bloodSugar,
                temperature: latestHealth.temperature,
                weight: latestHealth.weight,
                bmi: latestHealth.bmi,
                recordCount: healthRecords.length,
            },
            activity: {
                totalSteps,
                totalCaloriesBurned,
                totalDistance: activities.reduce((s, a) => s + (a.distance || 0), 0),
                totalDuration: activities.reduce((s, a) => s + (a.duration || 0), 0),
                workouts: activities.length,
            },
            nutrition: {
                totalCaloriesConsumed,
                netCalories: totalCaloriesConsumed - totalCaloriesBurned,
                macros,
                meals: meals.length,
            },
            sleep: {
                totalMinutes: totalSleepMinutes,
                totalHours: parseFloat((totalSleepMinutes / 60).toFixed(1)),
                avgQuality: sleep.length
                    ? parseFloat((sleep.reduce((s, sl) => s + (sl.quality || 0), 0) / sleep.length).toFixed(1))
                    : null,
            },
        },
    });
});

// @route   GET /api/v1/reports/weekly
exports.getWeeklyReport = asyncHandler(async (req, res) => {
    const { start, end } = getDateRange(7);
    const userId = req.user.id;

    const [healthRecords, activities, meals, sleep] = await Promise.all([
        HealthRecord.find({ user: userId, recordedAt: { $gte: start, $lte: end } }).sort({ recordedAt: 1 }),
        Activity.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
        Meal.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
        Sleep.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
    ]);

    // Build daily-grouped data for charts
    const buildDailyData = (records, dateField, valueField) => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            const dayStr = day.toISOString().split('T')[0];

            const dayRecords = records.filter((r) => {
                const d = new Date(r[dateField]);
                return d.toISOString().split('T')[0] === dayStr;
            });

            const avg = dayRecords.length
                ? parseFloat((dayRecords.reduce((s, r) => s + (r[valueField] || 0), 0) / dayRecords.length).toFixed(1))
                : 0;

            result.push({ date: dayStr, value: avg, count: dayRecords.length });
        }
        return result;
    };

    const avgHeartRate = healthRecords.filter(r => r.heartRate).reduce((s, r) => s + r.heartRate, 0) / (healthRecords.filter(r => r.heartRate).length || 1);
    const totalSteps = activities.reduce((s, a) => s + (a.steps || 0), 0);
    const totalCalsBurned = activities.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
    const totalCalsCons = meals.reduce((s, m) => s + (m.calories || 0), 0);
    const avgSleep = sleep.length
        ? parseFloat((sleep.reduce((s, sl) => s + (sl.duration || 0), 0) / sleep.length / 60).toFixed(1))
        : 0;

    res.status(200).json({
        success: true,
        period: { start, end, days: 7 },
        summary: {
            avgHeartRate: Math.round(avgHeartRate) || 0,
            totalSteps,
            totalCaloriesBurned: totalCalsBurned,
            totalCaloriesConsumed: totalCalsCons,
            avgSleepHours: avgSleep,
            workouts: activities.length,
        },
        charts: {
            heartRate: buildDailyData(healthRecords, 'recordedAt', 'heartRate'),
            steps: buildDailyData(activities, 'date', 'steps'),
            calories: buildDailyData(meals, 'date', 'calories'),
            sleep: buildDailyData(sleep, 'date', 'duration'),
        },
    });
});
