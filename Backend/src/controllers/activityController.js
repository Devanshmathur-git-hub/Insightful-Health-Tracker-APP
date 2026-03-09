const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

exports.addActivity = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    const activity = await Activity.create(req.body);
    res.status(201).json({ success: true, data: activity });
});

exports.getActivities = asyncHandler(async (req, res) => {
    const { limit = 20, page = 1, type } = req.query;
    const query = { user: req.user.id };
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
        Activity.find(query).sort({ date: -1 }).limit(Number(limit)).skip(skip),
        Activity.countDocuments(query),
    ]);
    res.status(200).json({ success: true, count: activities.length, total, data: activities });
});

exports.getActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findOne({ _id: req.params.id, user: req.user.id });
    if (!activity) return next(new ErrorResponse('Activity not found', 404));
    res.status(200).json({ success: true, data: activity });
});

exports.updateActivity = asyncHandler(async (req, res, next) => {
    let activity = await Activity.findOne({ _id: req.params.id, user: req.user.id });
    if (!activity) return next(new ErrorResponse('Activity not found', 404));
    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: activity });
});

exports.deleteActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findOne({ _id: req.params.id, user: req.user.id });
    if (!activity) return next(new ErrorResponse('Activity not found', 404));
    await activity.deleteOne();
    res.status(200).json({ success: true, message: 'Activity deleted' });
});
