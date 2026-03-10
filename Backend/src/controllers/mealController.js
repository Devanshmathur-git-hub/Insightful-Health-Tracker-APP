const Meal = require('../models/Meal');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

exports.addMeal = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
});

exports.getMeals = asyncHandler(async (req, res) => {
    const { limit = 20, page = 1, mealType, date } = req.query;
    const query = { user: req.user.id };
    if (mealType) query.mealType = mealType;
    if (date) {
        const d = new Date(date);
        query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [meals, total] = await Promise.all([
        Meal.find(query).sort({ date: -1 }).limit(Number(limit)).skip(skip),
        Meal.countDocuments(query),
    ]);
    res.status(200).json({ success: true, count: meals.length, total, data: meals });
});

exports.getMeal = asyncHandler(async (req, res, next) => {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });
    if (!meal) return next(new ErrorResponse('Meal not found', 404));
    res.status(200).json({ success: true, data: meal });
});

exports.updateMeal = asyncHandler(async (req, res, next) => {
    let meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });
    if (!meal) return next(new ErrorResponse('Meal not found', 404));
    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: meal });
});

exports.deleteMeal = asyncHandler(async (req, res, next) => {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });
    if (!meal) return next(new ErrorResponse('Meal not found', 404));
    await meal.deleteOne();
    res.status(200).json({ success: true, message: 'Meal deleted' });
});






