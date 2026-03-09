const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        age: { type: Number, min: 1, max: 120 },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        weight: { type: Number, min: 1 }, // kg
        height: { type: Number, min: 1 }, // cm
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        emergencyContact: { type: String, trim: true },
        emergencyPhone: { type: String, trim: true },
        avatar: { type: String },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
        passwordResetToken: String,
        passwordResetExpire: Date,
    },
    { timestamps: true }
);

// ── Hash password before save ──────────────────────────
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ── Sign JWT ───────────────────────────────────────────
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// ── Compare password ───────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ── Generate password reset token ─────────────────────
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// ── Virtual: BMI ───────────────────────────────────────
UserSchema.virtual('bmi').get(function () {
    if (this.weight && this.height) {
        return parseFloat((this.weight / ((this.height / 100) ** 2)).toFixed(1));
    }
    return null;
});

module.exports = mongoose.model('User', UserSchema);
