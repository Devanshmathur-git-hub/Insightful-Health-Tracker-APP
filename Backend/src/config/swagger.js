const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '💓 Insightful Health Tracker API',
            version: '1.0.0',
            description: `
## REST API for the Insightful Health Tracker App

A comprehensive health & wellness tracking API built with **Node.js**, **Express**, and **MongoDB**.

### Features
- 🔐 JWT Authentication
- ❤️ Health Metrics (Heart Rate, BP, Sugar, Temp, Weight, BMI)
- 🏃 Activity Tracking (Steps, Calories, Distance)
- 🥗 Diet & Nutrition (Meals, Macros)
- 😴 Sleep Monitoring
- 💊 Medication Reminders
- 📊 Reports & Analytics
- 🔔 Notifications

### Authentication
All protected routes require a **Bearer JWT token** in the Authorization header.
\`\`\`
Authorization: Bearer <your_token>
\`\`\`
Get a token by **Registering** or **Logging in**.
      `,
            contact: {
                name: 'Insightful Health Tracker',
                email: 'support@insightful-health.com',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: '🛠️ Development Server',
            },
            {
                url: 'https://your-production-url.com',
                description: '🚀 Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token (get one from /api/v1/auth/login)',
                },
            },
            schemas: {
                // ── AUTH ──────────────────────────────────────────────
                RegisterInput: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john@health.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' },
                        age: { type: 'integer', example: 28 },
                        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        weight: { type: 'number', example: 70 },
                        height: { type: 'number', example: 175 },
                    },
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'test@health.com' },
                        password: { type: 'string', example: 'password123' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string', example: '64a123abc456def789012345' },
                                name: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john@health.com' },
                                age: { type: 'integer', example: 28 },
                                gender: { type: 'string', example: 'male' },
                                weight: { type: 'number', example: 70 },
                                height: { type: 'number', example: 175 },
                                role: { type: 'string', example: 'user' },
                            },
                        },
                    },
                },
                // ── HEALTH RECORD ─────────────────────────────────────
                HealthRecordInput: {
                    type: 'object',
                    properties: {
                        heartRate: { type: 'number', example: 72, description: 'BPM' },
                        bloodPressure: { type: 'string', example: '120/80', description: 'systolic/diastolic' },
                        bloodSugar: { type: 'number', example: 95, description: 'mg/dL' },
                        temperature: { type: 'number', example: 36.5, description: 'Celsius' },
                        weight: { type: 'number', example: 70, description: 'kg' },
                        oxygenSaturation: { type: 'number', example: 98, description: 'SpO2 %' },
                        notes: { type: 'string', example: 'Feeling good today' },
                    },
                },
                HealthRecord: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user: { type: 'string' },
                        heartRate: { type: 'number' },
                        bloodPressure: { type: 'object', properties: { reading: { type: 'string' }, systolic: { type: 'number' }, diastolic: { type: 'number' } } },
                        bloodSugar: { type: 'number' },
                        temperature: { type: 'number' },
                        weight: { type: 'number' },
                        bmi: { type: 'number', description: 'Auto-calculated from weight + user height' },
                        recordedAt: { type: 'string', format: 'date-time' },
                    },
                },
                // ── ACTIVITY ──────────────────────────────────────────
                ActivityInput: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', enum: ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'hiking', 'sports', 'other'], example: 'running' },
                        steps: { type: 'number', example: 8500 },
                        caloriesBurned: { type: 'number', example: 350 },
                        distance: { type: 'number', example: 5.2, description: 'km' },
                        duration: { type: 'number', example: 45, description: 'minutes' },
                        notes: { type: 'string', example: 'Morning jog' },
                    },
                },
                // ── MEAL ──────────────────────────────────────────────
                MealInput: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Grilled Chicken Salad' },
                        mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'], example: 'lunch' },
                        calories: { type: 'number', example: 450 },
                        protein: { type: 'number', example: 35, description: 'grams' },
                        carbs: { type: 'number', example: 30, description: 'grams' },
                        fats: { type: 'number', example: 15, description: 'grams' },
                    },
                },
                // ── SLEEP ─────────────────────────────────────────────
                SleepInput: {
                    type: 'object',
                    required: ['startTime'],
                    properties: {
                        startTime: { type: 'string', format: 'date-time', example: '2026-03-09T22:00:00.000Z' },
                        endTime: { type: 'string', format: 'date-time', example: '2026-03-10T06:30:00.000Z' },
                        quality: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                        notes: { type: 'string', example: 'Slept well' },
                    },
                },
                // ── MEDICATION ────────────────────────────────────────
                MedicationInput: {
                    type: 'object',
                    required: ['name', 'dosage'],
                    properties: {
                        name: { type: 'string', example: 'Aspirin' },
                        dosage: { type: 'string', example: '100mg' },
                        schedule: { type: 'string', example: 'Morning & Evening' },
                        frequency: { type: 'string', enum: ['once_daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed', 'custom'], example: 'twice_daily' },
                        notes: { type: 'string', example: 'Take with food' },
                    },
                },
                // ── GENERIC SUCCESS ───────────────────────────────────
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Resource not found' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: '🔐 Auth', description: 'User registration, login, and profile management' },
            { name: '❤️ Health Records', description: 'Heart rate, BP, blood sugar, temperature, weight, BMI' },
            { name: '🏃 Activities', description: 'Step counter, calories burned, workout logs' },
            { name: '🥗 Meals', description: 'Diet logging and macro tracking' },
            { name: '😴 Sleep', description: 'Sleep start/end times, duration, quality' },
            { name: '💊 Medications', description: 'Medicine reminders and taken status' },
            { name: '📊 Reports', description: 'Daily and weekly aggregated health analytics' },
            { name: '🔔 Notifications', description: 'App notifications and reminders' },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;









