const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['medication_reminder', 'health_alert', 'report_ready', 'goal_achieved', 'general'],
            default: 'general',
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        readAt: { type: Date },
        relatedModel: { type: String },  // e.g., 'Medication'
        relatedId: { type: mongoose.Schema.ObjectId },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
    },
    { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
