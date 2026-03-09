import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import healthReducer from './slices/healthSlice';
import activityReducer from './slices/activitySlice';
import mealReducer from './slices/mealSlice';
import medicationReducer from './slices/medicationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        health: healthReducer,
        activity: activityReducer,
        meal: mealReducer,
        medication: medicationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
