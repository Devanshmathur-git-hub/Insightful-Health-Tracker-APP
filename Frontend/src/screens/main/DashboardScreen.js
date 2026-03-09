import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealthRecords } from '../../store/slices/healthSlice';
import { fetchActivities } from '../../store/slices/activitySlice';
import { fetchMedications } from '../../store/slices/medicationSlice';
import { markMedicationTaken } from '../../store/slices/medicationSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { MetricCard, SectionHeader, Badge } from '../../components/UIComponents';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';
import { initializeGoogleFit, getTodaysSteps, getTodaysCalories, subscribeLiveSteps, requestPedometerPermission } from '../../services/googleFitService';

const ActivityRing = ({ progress = 0.65, size = 90, color = Colors.primary, label, value }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={{ alignItems: 'center', margin: Spacing.sm }}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                {/* Background ring */}
                <View style={{
                    width: size, height: size, borderRadius: size / 2,
                    borderWidth: strokeWidth, borderColor: color + '25',
                    position: 'absolute'
                }} />
                {/* Progress arc approximation */}
                <View style={{
                    width: size - strokeWidth * 2, height: size - strokeWidth * 2,
                    borderRadius: (size - strokeWidth * 2) / 2,
                    borderWidth: strokeWidth + 1, borderColor: Colors.surface,
                    position: 'absolute', transform: [{ rotate: `${-90 + progress * 360}deg` }]
                }} />
                <View style={{
                    width: size, height: size, borderRadius: size / 2,
                    borderWidth: strokeWidth, borderColor: color,
                    position: 'absolute',
                    borderTopColor: progress < 0.25 ? color : color,
                    borderRightColor: progress < 0.5 ? Colors.transparent : color,
                    borderBottomColor: progress < 0.75 ? Colors.transparent : color,
                    borderLeftColor: progress < 1 ? Colors.transparent : color,
                    transform: [{ rotate: '-90deg' }]
                }} />
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: Typography.md, fontWeight: Typography.bold, color }}>{value}</Text>
                </View>
            </View>
            <Text style={{ fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 4 }}>{label}</Text>
        </View>
    );
};

export default function DashboardScreen() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { records } = useSelector((state) => state.health);
    const { activities } = useSelector((state) => state.activity);
    const { medications } = useSelector((state) => state.medication);
    const [refreshing, setRefreshing] = React.useState(false);
    const [pedometerSteps, setPedometerSteps] = React.useState(null);
    const [pedometerCalories, setPedometerCalories] = React.useState(null);
    const [permissionDenied, setPermissionDenied] = React.useState(false);
    const fitIntervalRef = useRef(null);
    const unsubscribeRef = useRef(null);

    const loadData = () => {
        dispatch(fetchHealthRecords({ limit: 5 }));
        dispatch(fetchActivities({ limit: 3 }));
        dispatch(fetchMedications());
    };

    const handleRequestPermission = async () => {
        const granted = await requestPedometerPermission();
        if (granted) {
            setPermissionDenied(false);
            initializeGoogleFit().then((available) => {
                if (available) {
                    refreshPedometerData();
                    unsubscribeRef.current = subscribeLiveSteps((totalSteps) => {
                        setPedometerSteps(totalSteps);
                        setPedometerCalories(Math.round(totalSteps * 0.04));
                    });
                }
            });
        }
    };



    const refreshPedometerData = async () => {
        try {
            const steps = await getTodaysSteps();
            const calories = await getTodaysCalories();
            if (steps !== null) setPedometerSteps(steps);
            if (calories !== null) setPedometerCalories(calories);
        } catch (e) {
            console.log('Pedometer fetch error:', e.message);
        }
    };

    useEffect(() => {
        loadData();

        // Initialize device Pedometer
        initializeGoogleFit().then((available) => {
            if (available) {
                refreshPedometerData();
                // Refresh baseline every 60s
                fitIntervalRef.current = setInterval(refreshPedometerData, 60000);
                // Live subscription for real-time updates
                unsubscribeRef.current = subscribeLiveSteps((totalSteps) => {
                    setPedometerSteps(totalSteps);
                    setPedometerCalories(Math.round(totalSteps * 0.04));
                });
                setPermissionDenied(false);
            } else {
                // Pedometer not available or permissions denied
                setPermissionDenied(true);
            }
        });
        
        return () => {
            if (fitIntervalRef.current) clearInterval(fitIntervalRef.current);
            if (unsubscribeRef.current) unsubscribeRef.current();
        };
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        loadData();
        await refreshPedometerData();
        setTimeout(() => setRefreshing(false), 1000);
    };

    // Get latest health metrics
    const latest = records[0] || {};
    const todaySteps = pedometerSteps !== null ? pedometerSteps : (activities[0]?.steps || 0);
    const stepGoal = 10000;
    const stepProgress = Math.min(todaySteps / stepGoal, 1);

    // Today's medications
    const todayMeds = medications.filter((m) => !m.taken);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good {getTimeOfDay()} 👋</Text>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.date}>{dateStr}</Text>
                </View>
                <TouchableOpacity onPress={() => dispatch(logoutUser())} style={styles.logoutBtn}>
                    <Text style={styles.logoutTxt}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            {/* Permission Alert */}
            {permissionDenied && (
                <View style={[styles.ringsCard, { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }]}>
                    <Text style={[styles.ringsTitle, { color: Colors.primary }]}>🔐 Enable Step Tracking</Text>
                    <Text style={{ color: Colors.textSecondary, marginBottom: 12 }}>
                        Pedometer permission is required to track your steps automatically.
                    </Text>
                    <TouchableOpacity 
                        onPress={handleRequestPermission}
                        style={[styles.permissionBtn, { backgroundColor: Colors.primary }]}
                    >
                        <Text style={{ color: Colors.card, fontWeight: 'bold', textAlign: 'center' }}>
                            ✅ Enable Pedometer Permission
                        </Text>
                    </TouchableOpacity>
                </View>
            )}



            {/* Activity rings */}
            <View style={styles.ringsCard}>
                <Text style={styles.ringsTitle}>Today's Activity</Text>
                <View style={styles.rings}>
                    <ActivityRing progress={stepProgress} color={Colors.accentBlue} label="Steps"
                        value={`${Math.round(stepProgress * 100)}%`} />
                    <ActivityRing
                        progress={(pedometerCalories ?? activities[0]?.caloriesBurned ?? 0) > 0
                            ? Math.min((pedometerCalories ?? activities[0]?.caloriesBurned ?? 0) / 2000, 1) : 0}
                        color={Colors.accent} label="Calories"
                        value={`${pedometerCalories ?? activities[0]?.caloriesBurned ?? 0}`} />
                    <ActivityRing progress={latest.heartRate ? Math.min(latest.heartRate / 100, 1) : 0}
                        color={Colors.heartRate} label="Heart Rate" value={`${latest.heartRate || '--'}`} />
                </View>
                <View style={styles.ringLegend}>
                    <Text style={styles.legendTxt}>
                        🚶 {todaySteps.toLocaleString()} / {stepGoal.toLocaleString()} steps goal
                    </Text>
                </View>
            </View>

            {/* Metric Cards */}
            <SectionHeader title="Health Metrics" />
            <View style={styles.metricsGrid}>
                <MetricCard
                    icon="❤️" label="Heart Rate" value={latest.heartRate || '--'}
                    unit="bpm" color={Colors.heartRate} trend={latest.heartRate ? '↑ Normal' : undefined}
                />
                <MetricCard
                    icon="🩸" label="Blood Pressure"
                    value={latest.bloodPressure
                        ? (latest.bloodPressure.systolic && latest.bloodPressure.diastolic
                            ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}`
                            : latest.bloodPressure.reading || '--')
                        : '--'}
                    unit="mmHg" color={Colors.bloodPressure}
                />
                <MetricCard
                    icon="🍬" label="Blood Sugar" value={latest.bloodSugar || '--'}
                    unit="mg/dL" color={Colors.bloodSugar}
                />
                <MetricCard
                    icon="🌡️" label="Temperature" value={latest.temperature || '--'}
                    unit="°C" color={Colors.temperature}
                />
                <MetricCard
                    icon="⚖️" label="Weight" value={latest.weight || user?.weight || '--'}
                    unit="kg" color={Colors.accentGreen}
                />
                <MetricCard
                    icon="📊" label="BMI"
                    value={user?.weight && user?.height ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : '--'}
                    unit="" color={Colors.accentBlue}
                />
            </View>

            {/* Medication reminders */}
            {todayMeds.length > 0 && (
                <>
                    <SectionHeader title="Medication Reminders 💊" />
                    {todayMeds.slice(0, 3).map((med) => (
                        <View key={med._id} style={styles.medCard}>
                            <View style={styles.medInfo}>
                                <Text style={styles.medName}>{med.name}</Text>
                                <Text style={styles.medDetail}>{med.dosage} · {med.schedule}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.takenBtn}
                                onPress={() => dispatch(markMedicationTaken(med._id))}
                            >
                                <Text style={styles.takenTxt}>✓ Taken</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </>
            )}

            {/* Recent activities */}
            <SectionHeader title="Recent Activities" />
            {activities.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTxt}>No activities logged yet. Start tracking! 🏃</Text>
                </View>
            ) : (
                activities.slice(0, 3).map((activity, i) => (
                    <View key={activity._id || i} style={styles.activityCard}>
                        <View style={[styles.activityIcon, { backgroundColor: Colors.accentBlue + '20' }]}>
                            <Text style={{ fontSize: 20 }}>
                                {activity.type === 'running' ? '🏃' : activity.type === 'cycling' ? '🚴' : '🏋️'}
                            </Text>
                        </View>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityType}>{activity.type || 'Workout'}</Text>
                            <Text style={styles.activityDetail}>
                                {activity.steps ? `${activity.steps.toLocaleString()} steps · ` : ''}
                                {activity.caloriesBurned ? `${activity.caloriesBurned} kcal` : ''}
                            </Text>
                        </View>
                        <Badge label={activity.duration ? `${activity.duration} min` : 'Done'} color={Colors.accentBlue} />
                    </View>
                ))
            )}

            <View style={{ height: 20 }} />
        </ScrollView>
    );
}

function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl, paddingTop: 56 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    greeting: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
    userName: {
        fontSize: Typography.xl,
        fontWeight: Typography.extrabold,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    date: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
    logoutBtn: {
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    logoutTxt: { color: Colors.error, fontSize: Typography.xs, fontWeight: Typography.semibold },

    ringsCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.base,
        marginBottom: Spacing.base,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    ringsTitle: {
        fontSize: Typography.md,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    rings: { flexDirection: 'row', justifyContent: 'space-around' },
    ringLegend: { alignItems: 'center', marginTop: Spacing.md },
    legendTxt: { color: Colors.textSecondary, fontSize: Typography.xs },

    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    medCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    medInfo: { flex: 1 },
    medName: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold },
    medDetail: { color: Colors.textSecondary, fontSize: Typography.xs, marginTop: 2 },
    takenBtn: {
        backgroundColor: Colors.success + '20',
        borderRadius: Radius.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.success + '50',
    },
    takenTxt: { color: Colors.success, fontSize: Typography.xs, fontWeight: Typography.bold },
    
    permissionBtn: {
        borderRadius: Radius.md,
        paddingVertical: Spacing.base,
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.base,
    },

    activityCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityInfo: { flex: 1 },
    activityType: { color: Colors.textPrimary, fontWeight: Typography.semibold, fontSize: Typography.base, textTransform: 'capitalize' },
    activityDetail: { color: Colors.textSecondary, fontSize: Typography.xs, marginTop: 2 },

    emptyCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyTxt: { color: Colors.textSecondary, fontSize: Typography.sm, textAlign: 'center' },
});
