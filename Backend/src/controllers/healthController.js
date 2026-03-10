const HealthRecord = require('../models/HealthRecord');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

// @route   POST /api/v1/health-records
exports.addRecord = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;

    // Handle blood pressure string format
    if (req.body.bloodPressure && typeof req.body.bloodPressure === 'string') {
        req.body.bloodPressure = { reading: req.body.bloodPressure };
    }

    const record = await HealthRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
});

// @route   GET /api/v1/health-records
exports.getRecords = asyncHandler(async (req, res) => {
    const { limit = 20, page = 1, type, startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (startDate || endDate) {
        query.recordedAt = {};
        if (startDate) query.recordedAt.$gte = new Date(startDate);
        if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
        HealthRecord.find(query).sort({ recordedAt: -1 }).limit(Number(limit)).skip(skip),
        HealthRecord.countDocuments(query),
    ]);

    res.status(200).json({ success: true, count: records.length, total, data: records });
});

// @route   GET /api/v1/health-records/:id
exports.getRecord = asyncHandler(async (req, res, next) => {
    const record = await HealthRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return next(new ErrorResponse('Health record not found', 404));
    res.status(200).json({ success: true, data: record });
});

// @route   PUT /api/v1/health-records/:id
exports.updateRecord = asyncHandler(async (req, res, next) => {
    let record = await HealthRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return next(new ErrorResponse('Health record not found', 404));
    record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: record });
});

// @route   DELETE /api/v1/health-records/:id
exports.deleteRecord = asyncHandler(async (req, res, next) => {
    const record = await HealthRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return next(new ErrorResponse('Health record not found', 404));
    await record.deleteOne();
    res.status(200).json({ success: true, message: 'Record deleted' });
});




