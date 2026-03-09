const Sleep = require('../models/Sleep');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

exports.addSleep = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    const sleep = await Sleep.create(req.body);
    res.status(201).json({ success: true, data: sleep });
});

exports.getAllSleep = asyncHandler(async (req, res) => {
    const { limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
        Sleep.find({ user: req.user.id }).sort({ date: -1 }).limit(Number(limit)).skip(skip),
        Sleep.countDocuments({ user: req.user.id }),
    ]);
    res.status(200).json({ success: true, count: records.length, total, data: records });
});

exports.getSleep = asyncHandler(async (req, res, next) => {
    const sleep = await Sleep.findOne({ _id: req.params.id, user: req.user.id });
    if (!sleep) return next(new ErrorResponse('Sleep record not found', 404));
    res.status(200).json({ success: true, data: sleep });
});

exports.updateSleep = asyncHandler(async (req, res, next) => {
    let sleep = await Sleep.findOne({ _id: req.params.id, user: req.user.id });
    if (!sleep) return next(new ErrorResponse('Sleep record not found', 404));
    sleep = await Sleep.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: sleep });
});

exports.deleteSleep = asyncHandler(async (req, res, next) => {
    const sleep = await Sleep.findOne({ _id: req.params.id, user: req.user.id });
    if (!sleep) return next(new ErrorResponse('Sleep record not found', 404));
    await sleep.deleteOne();
    res.status(200).json({ success: true, message: 'Sleep record deleted' });
});
