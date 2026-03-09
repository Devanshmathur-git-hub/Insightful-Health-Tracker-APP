import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addHealthRecord } from '../../store/slices/healthSlice';
import { addActivity } from '../../store/slices/activitySlice';
import { addMeal } from '../../store/slices/mealSlice';
import { addMedication } from '../../store/slices/medicationSlice';
import { InputField, Button, SectionHeader } from '../../components/UIComponents';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';
import {
    initializeGoogleFit,
    getTodaysSteps,
    getTodaysCalories,
    getTodaysDistance,
} from '../../services/googleFitService';

const TABS = [
    { id: 'health', label: '❤️ Health', color: Colors.heartRate },
    { id: 'activity', label: '🏃 Activity', color: Colors.accentBlue },
    { id: 'meal', label: '🥗 Meal', color: Colors.accentGreen },
    { id: 'medication', label: '💊 Medication', color: Colors.primary },
];

export default function LogScreen() {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('health');
    const [loading, setLoading] = useState(false);
    const [googleFitLoading, setGoogleFitLoading] = useState(false);
    const [googleFitConnected, setGoogleFitConnected] = useState(false);

    // Health form
    const [healthForm, setHealthForm] = useState({
        heartRate: '', bloodPressure: '', bloodSugar: '', temperature: '', weight: '',
    });

    // Activity form
    const [activityForm, setActivityForm] = useState({
        type: 'running', steps: '', caloriesBurned: '', distance: '', duration: '',
    });
    const activityTypes = ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'other'];

    // Meal form
    const [mealForm, setMealForm] = useState({
        name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fats: '',
    });
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    // Medication form
    const [medForm, setMedForm] = useState({
        name: '', dosage: '', schedule: '', notes: '',
    });

    // Initialize Google Fit on component mount
    useEffect(() => {
        initGoogleFit();
    }, []);

    const initGoogleFit = async () => {
        const connected = await initializeGoogleFit();
        setGoogleFitConnected(connected);
        if (connected) {
            console.log('✅ Google Fit initialized successfully');
        } else {
            console.log('⚠️ Google Fit not available, manual entry required');
        }
    };

    // Fetch data from Google Fit
    const handleAutoFetchActivity = async () => {
        if (!googleFitConnected) {
            Alert.alert(
                'Google Fit Not Available',
                'Please enable Google Fit permissions in your device settings.'
            );
            return;
        }

        setGoogleFitLoading(true);
        try {
            const [steps, calories, distance] = await Promise.all([
                getTodaysSteps(),
                getTodaysCalories(),
                getTodaysDistance(),
            ]);

            if (steps !== null && (steps > 0 || calories !== null || distance !== null)) {
                setActivityForm({
                    ...activityForm,
                    steps: steps > 0 ? String(steps) : activityForm.steps,
                    caloriesBurned: calories && calories > 0 ? String(Math.round(calories)) : activityForm.caloriesBurned,
                    distance: distance && distance > 0 ? String(distance) : activityForm.distance,
                });
                Alert.alert(
                    '✅ Data Synced',
                    `Steps: ${steps}\nCalories: ${Math.round(calories || 0)}\nDistance: ${(distance || 0).toFixed(2)} km`
                );
            } else {
                Alert.alert('No Data', 'No activity data found for today.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch Google Fit data: ' + error.message);
        } finally {
            setGoogleFitLoading(false);
        }
    };

    const handleHealthLog = async () => {
        if (!healthForm.heartRate && !healthForm.bloodPressure && !healthForm.bloodSugar) {
            Alert.alert('Error', 'Please fill at least one health metric'); return;
        }
        setLoading(true);
        const result = await dispatch(addHealthRecord({
            heartRate: healthForm.heartRate ? Number(healthForm.heartRate) : undefined,
            bloodPressure: healthForm.bloodPressure || undefined,
            bloodSugar: healthForm.bloodSugar ? Number(healthForm.bloodSugar) : undefined,
            temperature: healthForm.temperature ? Number(healthForm.temperature) : undefined,
            weight: healthForm.weight ? Number(healthForm.weight) : undefined,
        }));
        setLoading(false);
        if (addHealthRecord.fulfilled.match(result)) {
            Alert.alert('✅ Success', 'Health record logged!');
            setHealthForm({ heartRate: '', bloodPressure: '', bloodSugar: '', temperature: '', weight: '' });
        } else {
            Alert.alert('Error', 'Failed to log health data');
        }
    };

    const handleActivityLog = async () => {
        setLoading(true);
        const result = await dispatch(addActivity({
            type: activityForm.type,
            steps: activityForm.steps ? Number(activityForm.steps) : undefined,
            caloriesBurned: activityForm.caloriesBurned ? Number(activityForm.caloriesBurned) : undefined,
            distance: activityForm.distance ? Number(activityForm.distance) : undefined,
            duration: activityForm.duration ? Number(activityForm.duration) : undefined,
        }));
        setLoading(false);
        if (addActivity.fulfilled.match(result)) {
            Alert.alert('✅ Success', 'Activity logged!');
            setActivityForm({ type: 'running', steps: '', caloriesBurned: '', distance: '', duration: '' });
        } else {
            Alert.alert('Error', 'Failed to log activity');
        }
    };

    const handleMealLog = async () => {
        if (!mealForm.name) { Alert.alert('Error', 'Meal name is required'); return; }
        setLoading(true);
        const result = await dispatch(addMeal({
            name: mealForm.name,
            mealType: mealForm.mealType,
            calories: mealForm.calories ? Number(mealForm.calories) : undefined,
            protein: mealForm.protein ? Number(mealForm.protein) : undefined,
            carbs: mealForm.carbs ? Number(mealForm.carbs) : undefined,
            fats: mealForm.fats ? Number(mealForm.fats) : undefined,
        }));
        setLoading(false);
        if (addMeal.fulfilled.match(result)) {
            Alert.alert('✅ Success', 'Meal logged!');
            setMealForm({ name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fats: '' });
        } else {
            Alert.alert('Error', 'Failed to log meal');
        }
    };

    const handleMedLog = async () => {
        if (!medForm.name || !medForm.dosage) { Alert.alert('Error', 'Name and dosage required'); return; }
        setLoading(true);
        const result = await dispatch(addMedication(medForm));
        setLoading(false);
        if (addMedication.fulfilled.match(result)) {
            Alert.alert('✅ Success', 'Medication reminder set!');
            setMedForm({ name: '', dosage: '', schedule: '', notes: '' });
        } else {
            Alert.alert('Error', 'Failed to add medication');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Text style={styles.pageTitle}>Log & Track</Text>
                <Text style={styles.pageSubtitle}>Record your daily health data</Text>

                {/* Tab selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && { ...styles.tabActive, borderColor: tab.color }]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[styles.tabTxt, activeTab === tab.id && { color: tab.color, fontWeight: Typography.bold }]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── HEALTH FORM ── */}
                {activeTab === 'health' && (
                    <View style={styles.card}>
                        <SectionHeader title="Health Vitals" />
                        <InputField label="Heart Rate" icon="❤️" value={healthForm.heartRate}
                            onChangeText={(v) => setHealthForm({ ...healthForm, heartRate: v })}
                            placeholder="e.g. 72" keyboardType="numeric" />
                        <InputField label="Blood Pressure" icon="🩺" value={healthForm.bloodPressure}
                            onChangeText={(v) => setHealthForm({ ...healthForm, bloodPressure: v })}
                            placeholder="e.g. 120/80" />
                        <InputField label="Blood Sugar" icon="🍬" value={healthForm.bloodSugar}
                            onChangeText={(v) => setHealthForm({ ...healthForm, bloodSugar: v })}
                            placeholder="e.g. 95 mg/dL" keyboardType="numeric" />
                        <InputField label="Temperature" icon="🌡️" value={healthForm.temperature}
                            onChangeText={(v) => setHealthForm({ ...healthForm, temperature: v })}
                            placeholder="e.g. 36.5 °C" keyboardType="numeric" />
                        <InputField label="Weight" icon="⚖️" value={healthForm.weight}
                            onChangeText={(v) => setHealthForm({ ...healthForm, weight: v })}
                            placeholder="e.g. 70 kg" keyboardType="numeric" />
                        <Button title="Log Health Data" onPress={handleHealthLog} loading={loading} icon="💾" />
                    </View>
                )}

                {/* ── ACTIVITY FORM ── */}
                {activeTab === 'activity' && (
                    <View style={styles.card}>
                        <SectionHeader title="Activity Log" />
                        
                        {/* Google Fit Sync Button */}
                        {googleFitConnected && (
                            <TouchableOpacity
                                style={styles.googleFitButton}
                                onPress={handleAutoFetchActivity}
                                disabled={googleFitLoading}
                            >
                                {googleFitLoading ? (
                                    <ActivityIndicator color={Colors.primary} size="small" />
                                ) : (
                                    <Text style={styles.googleFitButtonText}>📊 Sync with Google Fit</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        <Text style={styles.fieldLabel}>Activity Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.base }}>
                            {activityTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.pill, activityForm.type === type && styles.pillActive]}
                                    onPress={() => setActivityForm({ ...activityForm, type })}
                                >
                                    <Text style={[styles.pillTxt, activityForm.type === type && styles.pillTxtActive]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <InputField label="Steps" icon="🚶" value={activityForm.steps}
                            onChangeText={(v) => setActivityForm({ ...activityForm, steps: v })}
                            placeholder="e.g. 8000" keyboardType="numeric" />
                        <InputField label="Calories Burned" icon="🔥" value={activityForm.caloriesBurned}
                            onChangeText={(v) => setActivityForm({ ...activityForm, caloriesBurned: v })}
                            placeholder="e.g. 350 kcal" keyboardType="numeric" />
                        <InputField label="Distance (km)" icon="📍" value={activityForm.distance}
                            onChangeText={(v) => setActivityForm({ ...activityForm, distance: v })}
                            placeholder="e.g. 5.2" keyboardType="numeric" />
                        <InputField label="Duration (min)" icon="⏱️" value={activityForm.duration}
                            onChangeText={(v) => setActivityForm({ ...activityForm, duration: v })}
                            placeholder="e.g. 45" keyboardType="numeric" />
                        <Button title="Log Activity" onPress={handleActivityLog} loading={loading} icon="💾" />
                    </View>
                )}

                {/* ── MEAL FORM ── */}
                {activeTab === 'meal' && (
                    <View style={styles.card}>
                        <SectionHeader title="Meal Logger" />
                        <InputField label="Food / Meal Name" icon="🍽️" value={mealForm.name}
                            onChangeText={(v) => setMealForm({ ...mealForm, name: v })}
                            placeholder="e.g. Grilled Chicken Salad" />
                        <Text style={styles.fieldLabel}>Meal Type</Text>
                        <View style={styles.pillRow}>
                            {mealTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.pill, mealForm.mealType === type && styles.pillActive]}
                                    onPress={() => setMealForm({ ...mealForm, mealType: type })}
                                >
                                    <Text style={[styles.pillTxt, mealForm.mealType === type && styles.pillTxtActive]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <InputField label="Calories" icon="🔥" value={mealForm.calories}
                            onChangeText={(v) => setMealForm({ ...mealForm, calories: v })}
                            placeholder="e.g. 450 kcal" keyboardType="numeric" />
                        <View style={styles.macroRow}>
                            <View style={{ flex: 1, marginRight: Spacing.sm }}>
                                <InputField label="Protein (g)" icon="💪" value={mealForm.protein}
                                    onChangeText={(v) => setMealForm({ ...mealForm, protein: v })}
                                    placeholder="35g" keyboardType="numeric" />
                            </View>
                            <View style={{ flex: 1, marginRight: Spacing.sm }}>
                                <InputField label="Carbs (g)" icon="🍞" value={mealForm.carbs}
                                    onChangeText={(v) => setMealForm({ ...mealForm, carbs: v })}
                                    placeholder="55g" keyboardType="numeric" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <InputField label="Fats (g)" icon="🥑" value={mealForm.fats}
                                    onChangeText={(v) => setMealForm({ ...mealForm, fats: v })}
                                    placeholder="15g" keyboardType="numeric" />
                            </View>
                        </View>
                        <Button title="Log Meal" onPress={handleMealLog} loading={loading} icon="💾" />
                    </View>
                )}

                {/* ── MEDICATION FORM ── */}
                {activeTab === 'medication' && (
                    <View style={styles.card}>
                        <SectionHeader title="Add Medication" />
                        <InputField label="Medication Name" icon="💊" value={medForm.name}
                            onChangeText={(v) => setMedForm({ ...medForm, name: v })}
                            placeholder="e.g. Aspirin" />
                        <InputField label="Dosage" icon="💉" value={medForm.dosage}
                            onChangeText={(v) => setMedForm({ ...medForm, dosage: v })}
                            placeholder="e.g. 100mg" />
                        <InputField label="Schedule" icon="⏰" value={medForm.schedule}
                            onChangeText={(v) => setMedForm({ ...medForm, schedule: v })}
                            placeholder="e.g. Morning 8:00 AM, Evening 8:00 PM" />
                        <InputField label="Notes (optional)" icon="📝" value={medForm.notes}
                            onChangeText={(v) => setMedForm({ ...medForm, notes: v })}
                            placeholder="Any special instructions..." />
                        <Button title="Add Reminder" onPress={handleMedLog} loading={loading} icon="⏰" />
                    </View>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: 20 },

    pageTitle: { fontSize: Typography.xxl, fontWeight: Typography.extrabold, color: Colors.textPrimary },
    pageSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },

    tabScroll: { marginBottom: Spacing.xl },
    tab: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.cardBorder,
        marginRight: Spacing.sm,
        backgroundColor: Colors.card,
    },
    tabActive: { backgroundColor: Colors.card },
    tabTxt: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },

    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },

    fieldLabel: {
        color: Colors.textSecondary,
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        marginBottom: Spacing.xs,
    },

    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
    pill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.surface,
        marginRight: Spacing.sm,
    },
    pillActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '20' },
    pillTxt: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.medium },
    pillTxtActive: { color: Colors.primary, fontWeight: Typography.bold },

    macroRow: { flexDirection: 'row' },

    googleFitButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleFitButtonText: {
        color: Colors.white,
        fontSize: Typography.sm,
        fontWeight: Typography.bold,
    },
});
