const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Medication name is required'],
            trim: true,
            maxlength: 200,
        },
        dosage: {
            type: String,
            required: [true, 'Dosage is required'],
        },
        schedule: { type: String },           // e.g., "Morning & Night"
        frequency: {
            type: String,
            enum: ['once_daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed', 'custom'],
            default: 'once_daily',
        },
        taken: { type: Boolean, default: false },
        takenAt: { type: Date },
        active: { type: Boolean, default: true },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        notes: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

MedicationSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('Medication', MedicationSchema);
