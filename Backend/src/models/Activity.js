const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'hiking', 'sports', 'other'],
            default: 'other',
        },
        steps: { type: Number, min: 0 },
        caloriesBurned: { type: Number, min: 0 },
        distance: { type: Number, min: 0 }, // km
        duration: { type: Number, min: 0 }, // minutes
        avgHeartRate: { type: Number },
        notes: { type: String, maxlength: 500 },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

ActivitySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
