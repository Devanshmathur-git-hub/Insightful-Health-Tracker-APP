import { Pedometer } from 'expo-sensors';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Helpers ───────────────────────────────────────────
const getTodayKey = () => {
    const d = new Date();
    return `pedometer_steps_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
};

// Steps saved in AsyncStorage from earlier in the same day
let _savedSteps = 0;

// ── Init ──────────────────────────────────────────────
// Call once on app/screen mount.
// On Android: requests ACTIVITY_RECOGNITION permission at runtime (required Android 10+),
//             then loads today's persisted step count from AsyncStorage.
export const initializeGoogleFit = async () => {
    try {
        console.log('🔄 Initializing Pedometer...');
        
        // Check if Pedometer is available
        const available = await Pedometer.isAvailableAsync();
        console.log('📱 Pedometer isAvailable:', available, '| OS:', Platform.OS);
        if (!available) {
            console.warn('⚠️ Pedometer hardware not available on this device');
            Alert.alert('⚠️ Pedometer Not Available', 'Your device does not have a pedometer sensor.');
            return false;
        }

        // Request permission
        console.log('🔐 Requesting Pedometer permission...');
        const { status } = await Pedometer.requestPermissionsAsync();
        console.log('🔐 Pedometer permission status:', status);
        
        if (status === 'denied') {
            console.warn('❌ Pedometer permission DENIED by user');
            Alert.alert(
                '❌ Permission Denied',
                'Pedometer permission is required to track your steps.\n\nPlease enable it in:\nSettings → Apps → [Your App] → Permissions → Activity',
                [{ text: 'OK', onPress: () => console.log('User acknowledged permission denial') }]
            );
            return false;
        }

        if (Platform.OS === 'android') {
            const key = getTodayKey();
            const saved = await AsyncStorage.getItem(key);
            _savedSteps = saved ? parseInt(saved, 10) : 0;
            console.log(`📦 Android: loaded saved steps = ${_savedSteps} (key: ${key})`);
        }

        console.log('✅ Pedometer initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Pedometer init error:', error.message);
        Alert.alert('❌ Initialization Error', error.message);
        return false;
    }
};

// ── Get today's steps ─────────────────────────────────
// Note: Date range queries not supported on Android via native Pedometer
// Instead, use subscribeLiveSteps() for real-time tracking on Android
export const getTodaysSteps = async () => {
    try {
        // ANDROID: Simply return saved steps from storage (NO date range queries)
        // iOS: Can use getStepCountAsync with date range
        if (Platform.OS === 'android') {
            const saved = await AsyncStorage.getItem(getTodayKey());
            const steps = saved ? parseInt(saved) : 0;
            console.log(`📊 Today's steps (Android - from storage): ${steps}`);
            return steps;
        } else {
            // iOS only: query steps from midnight to now
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            const result = await Pedometer.getStepCountAsync(start, end);
            console.log(`📊 Today's steps (iOS): ${result.steps}`);
            return result.steps;
        }
    } catch (error) {
        console.error('❌ Error fetching today\'s steps:', error.message);
        return _savedSteps; // fallback to in-memory saved steps
    }
};

// ── Live step subscription ────────────────────────────
// Works on both platforms.
// Gets baseline step count, then watches for incremental changes.
// Callback receives total steps for TODAY (not just session steps).
// Returns an unsubscribe function — call on component unmount.
export const subscribeLiveSteps = (onTotalStepsUpdate) => {
    try {
        let baselineSteps = 0;
        
        // Get baseline step count for today
        (async () => {
            try {
                if (Platform.OS === 'ios') {
                    // iOS: query steps from midnight to now
                    const start = new Date();
                    start.setHours(0, 0, 0, 0);
                    const end = new Date();
                    const result = await Pedometer.getStepCountAsync(start, end);
                    baselineSteps = result.steps;
                    console.log(`📍 Live tracking baseline (iOS): ${baselineSteps} steps`);
                } else {
                    // Android: load from AsyncStorage
                    const saved = await AsyncStorage.getItem(getTodayKey());
                    baselineSteps = saved ? parseInt(saved) : 0;
                    console.log(`📍 Live tracking baseline (Android): ${baselineSteps} steps`);
                }
                onTotalStepsUpdate(baselineSteps);
            } catch (e) {
                console.error('❌ Failed to get baseline steps:', e.message);
                baselineSteps = _savedSteps;
                onTotalStepsUpdate(baselineSteps);
            }
        })();

        // Watch for step changes and add to baseline
        const subscription = Pedometer.watchStepCount((result) => {
            const sessionSteps = result.steps; // incremental steps since watch started
            const totalSteps = baselineSteps + sessionSteps;
            
            console.log(`🦶 Live update: baseline=${baselineSteps} session=${sessionSteps} total=${totalSteps}`);
            onTotalStepsUpdate(totalSteps);

            // Save to AsyncStorage for persistence
            AsyncStorage.setItem(getTodayKey(), totalSteps.toString());
            _savedSteps = totalSteps;
        });

        return () => subscription.remove();
    } catch (error) {
        console.error('❌ Error subscribing live steps:', error.message);
        return () => { };
    }
};

// ── Calories estimate ─────────────────────────────────
// ~0.04 kcal per step (average person)
export const getTodaysCalories = async () => {
    try {
        const steps = await getTodaysSteps();
        return Math.round(steps * 0.04);
    } catch {
        return null;
    }
};

// ── Distance estimate ─────────────────────────────────
// average step ≈ 0.762 metres
export const getTodaysDistance = async () => {
    try {
        const steps = await getTodaysSteps();
        return parseFloat(((steps * 0.762) / 1000).toFixed(2));
    } catch {
        return null;
    }
};

// ── Date range (iOS only) ─────────────────────────────
export const getStepsByDateRange = async (startDate, endDate) => {
    if (Platform.OS === 'android') return [];
    try {
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        const result = await Pedometer.getStepCountAsync(start, end);
        return [{ date: start, steps: result.steps }];
    } catch { return []; }
};

export const get30DaySteps = async () => {
    if (Platform.OS === 'android') return [];
    try {
        const results = [];
        for (let i = 0; i < 30; i++) {
            const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0, 0, 0, 0);
            const end = new Date(start); end.setHours(23, 59, 59, 999);
            const result = await Pedometer.getStepCountAsync(start, end);
            results.push({ date: start, steps: result.steps });
        }
        return results.reverse();
    } catch { return []; }
};

// ── Explicit Permission Request ───────────────────────
// Call this if user denies permission initially
export const requestPedometerPermission = async () => {
    try {
        console.log('🔐 Requesting Pedometer permission (explicit)...');
        const { status } = await Pedometer.requestPermissionsAsync();
        console.log('🔐 Permission response status:', status);
        
        Alert.alert(
            '✅ Permission Request',
            `Status: ${status}\n\nIf you selected "Don't Allow", you can enable it in:\nSettings → Apps → [Your App] → Permissions → Activity`,
            [{ text: 'OK' }]
        );
        
        return status === 'granted';
    } catch (error) {
        console.error('❌ Permission request error:', error.message);
        Alert.alert('❌ Error', error.message);
        return false;
    }
};
