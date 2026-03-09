const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        heartRate: {
            type: Number,
            min: [20, 'Heart rate seems too low'],
            max: [300, 'Heart rate seems too high'],
        },
        bloodPressure: {
            systolic: { type: Number },
            diastolic: { type: Number },
            reading: { type: String }, // e.g. "120/80"
        },
        bloodSugar: {
            type: Number,
            min: [10, 'Blood sugar seems too low'],
            max: [1000, 'Blood sugar seems too high'],
        },
        temperature: {
            type: Number,
            min: [30, 'Temperature seems too low'],
            max: [45, 'Temperature seems too high'],
        },
        weight: {
            type: Number,
            min: [1, 'Weight too low'],
            max: [500, 'Weight too high'],
        },
        bmi: { type: Number },
        oxygenSaturation: {
            type: Number,
            min: 50,
            max: 100,
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Auto-calculate BMI if weight is provided and user height is available
HealthRecordSchema.pre('save', async function () {
    if (this.weight) {
        const User = require('./User');
        const user = await User.findById(this.user);
        if (user?.height) {
            this.bmi = parseFloat((this.weight / ((user.height / 100) ** 2)).toFixed(1));
        }
    }
    // Parse blood pressure string "120/80" into systolic/diastolic
    if (this.bloodPressure?.reading && !this.bloodPressure?.systolic) {
        const parts = this.bloodPressure.reading.split('/');
        if (parts.length === 2) {
            this.bloodPressure.systolic = parseInt(parts[0]);
            this.bloodPressure.diastolic = parseInt(parts[1]);
        }
    }
});

// Index for faster user-specific queries
HealthRecordSchema.index({ user: 1, recordedAt: -1 });

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
