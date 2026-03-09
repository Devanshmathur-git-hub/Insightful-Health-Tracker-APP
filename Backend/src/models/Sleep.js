const mongoose = require('mongoose');

const SleepSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        startTime: {
            type: Date,
            required: [true, 'Sleep start time is required'],
        },
        endTime: {
            type: Date,
        },
        duration: { type: Number }, // minutes — auto-calculated
        quality: {
            type: Number,
            min: [1, 'Quality rating min is 1'],
            max: [5, 'Quality rating max is 5'],
        },
        deepSleep: { type: Number },  // minutes
        remSleep: { type: Number },   // minutes
        interruptions: { type: Number, default: 0 },
        notes: { type: String, maxlength: 500 },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Auto-calculate duration when endTime is provided
SleepSchema.pre('save', async function () {
    if (this.startTime && this.endTime) {
        const diffMs = new Date(this.endTime) - new Date(this.startTime);
        this.duration = Math.round(diffMs / (1000 * 60));
    }
});

SleepSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Sleep', SleepSchema);
