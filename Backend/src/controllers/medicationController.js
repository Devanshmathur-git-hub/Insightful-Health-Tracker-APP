const Medication = require('../models/Medication');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

exports.addMedication = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    const medication = await Medication.create(req.body);

    // Create a reminder notification
    await Notification.create({
        user: req.user.id,
        type: 'medication_reminder',
        title: `💊 Medication Added`,
        message: `${medication.name} (${medication.dosage}) scheduled: ${medication.schedule || 'No schedule set'}`,
        relatedModel: 'Medication',
        relatedId: medication._id,
    });

    res.status(201).json({ success: true, data: medication });
});

exports.getMedications = asyncHandler(async (req, res) => {
    const { active } = req.query;
    const query = { user: req.user.id };
    if (active !== undefined) query.active = active === 'true';

    const medications = await Medication.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: medications.length, data: medications });
});

exports.getMedication = asyncHandler(async (req, res, next) => {
    const medication = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!medication) return next(new ErrorResponse('Medication not found', 404));
    res.status(200).json({ success: true, data: medication });
});

exports.updateMedication = asyncHandler(async (req, res, next) => {
    let medication = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!medication) return next(new ErrorResponse('Medication not found', 404));
    medication = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: medication });
});

exports.deleteMedication = asyncHandler(async (req, res, next) => {
    const medication = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!medication) return next(new ErrorResponse('Medication not found', 404));
    await medication.deleteOne();
    res.status(200).json({ success: true, message: 'Medication deleted' });
});

// @route   PUT /api/v1/medications/:id/taken
exports.markTaken = asyncHandler(async (req, res, next) => {
    const medication = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!medication) return next(new ErrorResponse('Medication not found', 404));

    medication.taken = true;
    medication.takenAt = Date.now();
    await medication.save();

    res.status(200).json({ success: true, data: medication });
});



