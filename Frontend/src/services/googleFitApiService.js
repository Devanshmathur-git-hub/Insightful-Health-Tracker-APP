// Google Fit REST API Integration
// Requires OAuth token from Google Sign-In
// This fetches real step data from Google Fit servers (not device sensors)

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_FIT_API_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
const SCOPES = ['https://www.googleapis.com/auth/fitness.activity.read'];

// Store access token
let accessToken = null;

// ── Get Access Token ──────────────────────────────
export const getStoredAccessToken = async () => {
    try {
        const token = await AsyncStorage.getItem('google_fit_access_token');
        if (token) {
            accessToken = token;
            return token;
        }
        return null;
    } catch (error) {
        console.error('❌ Error retrieving token:', error.message);
        return null;
    }
};

// ── Store Access Token ────────────────────────────
export const storeAccessToken = async (token) => {
    try {
        accessToken = token;
        await AsyncStorage.setItem('google_fit_access_token', token);
        console.log('✅ Access token stored');
        return true;
    } catch (error) {
        console.error('❌ Error storing token:', error.message);
        return false;
    }
};

// ── Get Today's Steps from Google Fit API ────────
export const getTodaysStepsFromGoogleFit = async (token) => {
    if (!token) {
        console.warn('⚠️ No access token provided');
        return 0;
    }

    try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const payload = {
            aggregateBy: [
                {
                    dataTypeName: 'com.google.step_count.delta',
                    dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
                }
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis: startOfDay.getTime(),
            endTimeMillis: now.getTime(),
        };

        const response = await axios.post(GOOGLE_FIT_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        // Extract steps from response
        if (response.data.bucket && response.data.bucket.length > 0) {
            const bucket = response.data.bucket[0];
            if (bucket.dataset && bucket.dataset.length > 0) {
                const steps = bucket.dataset[0].point.reduce((acc, point) => {
                    return acc + (point.value[0].intVal || 0);
                }, 0);
                console.log(`📊 Google Fit today's steps: ${steps}`);
                return steps;
            }
        }
        console.log('📊 Google Fit: No step data available');
        return 0;
    } catch (error) {
        console.error('❌ Error fetching steps from Google Fit:', error.message);
        if (error.response?.status === 401) {
            console.warn('⚠️ Token expired or invalid - need to re-authenticate');
            accessToken = null;
        }
        return 0;
    }
};

// ── Get Steps for Date Range ──────────────────────
export const getStepsByDateRangeFromGoogleFit = async (startDate, endDate, token) => {
    if (!token) return [];

    try {
        const payload = {
            aggregateBy: [
                {
                    dataTypeName: 'com.google.step_count.delta',
                    dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
                }
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
            startTimeMillis: new Date(startDate).getTime(),
            endTimeMillis: new Date(endDate).getTime(),
        };

        const response = await axios.post(GOOGLE_FIT_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const results = [];
        if (response.data.bucket) {
            response.data.bucket.forEach((bucket) => {
                if (bucket.dataset && bucket.dataset.length > 0) {
                    const steps = bucket.dataset[0].point.reduce((acc, point) => {
                        return acc + (point.value[0].intVal || 0);
                    }, 0);
                    results.push({
                        date: new Date(parseInt(bucket.startTimeMillis)),
                        steps: steps
                    });
                }
            });
        }
        console.log(`📊 Google Fit: Fetched ${results.length} days of step data`);
        return results;
    } catch (error) {
        console.error('❌ Error fetching range from Google Fit:', error.message);
        return [];
    }
};

// ── Get Current Access Token ──────────────────────
export const getAccessToken = () => {
    return accessToken;
};

// ── Check if Authenticated ────────────────────────
export const isGoogleFitAuthenticated = async () => {
    if (accessToken) return true;
    
    const stored = await getStoredAccessToken();
    return !!stored;
};
