const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Meal name is required'],
            trim: true,
            maxlength: 200,
        },
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            default: 'snack',
        },
        calories: { type: Number, min: 0 },
        protein: { type: Number, min: 0 },  // grams
        carbs: { type: Number, min: 0 },    // grams
        fats: { type: Number, min: 0 },     // grams
        fiber: { type: Number, min: 0 },
        servingSize: { type: String },
        notes: { type: String, maxlength: 500 },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

MealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', MealSchema);





