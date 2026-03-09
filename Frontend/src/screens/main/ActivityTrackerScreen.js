import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { addActivity } from '../../store/slices/activitySlice';
import MapComponent from '../../components/MapComponent';
import { InputField, Button, SectionHeader } from '../../components/UIComponents';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';
import { getCurrentLocation, calculateDistance } from '../../services/googleMapsService';
import { initializeGoogleFit, subscribeLiveSteps } from '../../services/googleFitService';

export default function ActivityTrackerScreen() {
    const dispatch = useDispatch();
    const [trackingMode, setTrackingMode] = useState('log'); // 'log' or 'map'
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activityForm, setActivityForm] = useState({
        type: 'running',
        steps: '',
        caloriesBurned: '',
        distance: '',
        duration: '',
        notes: '',
    });

    const activityTypes = ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'hiking', 'sports', 'other'];

    // Initialize Pedometer and subscribe to live step updates on mount
    useEffect(() => {
        (async () => {
            const initialized = await initializeGoogleFit();
            if (initialized) {
                // Subscribe to live step counts - updates in real-time as you walk
                const unsubscribe = subscribeLiveSteps((totalSteps) => {
                    setActivityForm((prev) => ({ ...prev, steps: totalSteps.toString() }));
                });
                // Cleanup: unsubscribe when component unmounts
                return unsubscribe;
            }
        })();
    }, []);

    const handleStartTracking = async () => {
        const location = await getCurrentLocation();
        if (location) {
            setStartLocation(location);
            Alert.alert('✅ Started', 'Tracking started. Select end location on the map.');
        } else {
            Alert.alert('Error', 'Unable to get current location');
        }
    };

    const handleEndTracking = async () => {
        if (!startLocation) {
            Alert.alert('Error', 'Please start tracking first');
            return;
        }

        if (!endLocation) {
            Alert.alert('Error', 'Please select end location on the map');
            return;
        }

        // Calculate distance
        const calculatedDistance = calculateDistance(
            startLocation.latitude,
            startLocation.longitude,
            endLocation.latitude,
            endLocation.longitude
        );

        setActivityForm({
            ...activityForm,
            distance: calculatedDistance,
        });

        Alert.alert(
            '✅ Tracking Ended',
            `Distance: ${calculatedDistance} km\n\nPlease fill in remaining details and save.`
        );
    };

    const handleSaveActivity = async () => {
        if (!activityForm.type) {
            Alert.alert('Error', 'Please select activity type');
            return;
        }

        setLoading(true);
        const payload = {
            type: activityForm.type,
            steps: activityForm.steps ? Number(activityForm.steps) : undefined,
            caloriesBurned: activityForm.caloriesBurned ? Number(activityForm.caloriesBurned) : undefined,
            distance: activityForm.distance ? Number(activityForm.distance) : undefined,
            duration: activityForm.duration ? Number(activityForm.duration) : undefined,
            notes: activityForm.notes || undefined,
        };

        const result = await dispatch(addActivity(payload));
        setLoading(false);

        if (addActivity.fulfilled.match(result)) {
            Alert.alert('✅ Success', 'Activity logged with GPS tracking!');
            setActivityForm({
                type: 'running',
                steps: '',
                caloriesBurned: '',
                distance: '',
                duration: '',
                notes: '',
            });
            setStartLocation(null);
            setEndLocation(null);
        } else {
            Alert.alert('Error', 'Failed to log activity');
        }
    };

    return (
        <View style={styles.container}>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
                <TouchableOpacity
                    style={[styles.modeButton, trackingMode === 'log' && styles.modeButtonActive]}
                    onPress={() => setTrackingMode('log')}
                >
                    <Text style={[styles.modeButtonText, trackingMode === 'log' && styles.modeButtonTextActive]}>
                        📋 Manual Log
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, trackingMode === 'map' && styles.modeButtonActive]}
                    onPress={() => setTrackingMode('map')}
                >
                    <Text style={[styles.modeButtonText, trackingMode === 'map' && styles.modeButtonTextActive]}>
                        🗺️ GPS Track
                    </Text>
                </TouchableOpacity>
            </View>

            {trackingMode === 'log' ? (
                // Manual Log Mode
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <SectionHeader title="Activity Log" />

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

                        <InputField
                            label="Steps"
                            icon="🚶"
                            value={activityForm.steps}
                            onChangeText={(v) => setActivityForm({ ...activityForm, steps: v })}
                            placeholder="e.g. 8000"
                            keyboardType="numeric"
                        />

                        <InputField
                            label="Calories Burned"
                            icon="🔥"
                            value={activityForm.caloriesBurned}
                            onChangeText={(v) => setActivityForm({ ...activityForm, caloriesBurned: v })}
                            placeholder="e.g. 350 kcal"
                            keyboardType="numeric"
                        />

                        <InputField
                            label="Distance (km)"
                            icon="📍"
                            value={activityForm.distance}
                            onChangeText={(v) => setActivityForm({ ...activityForm, distance: v })}
                            placeholder="e.g. 5.2"
                            keyboardType="numeric"
                        />

                        <InputField
                            label="Duration (min)"
                            icon="⏱️"
                            value={activityForm.duration}
                            onChangeText={(v) => setActivityForm({ ...activityForm, duration: v })}
                            placeholder="e.g. 45"
                            keyboardType="numeric"
                        />

                        <InputField
                            label="Notes"
                            icon="📝"
                            value={activityForm.notes}
                            onChangeText={(v) => setActivityForm({ ...activityForm, notes: v })}
                            placeholder="Optional notes about your activity"
                            multiline
                        />

                        <Button title="Log Activity" onPress={handleSaveActivity} loading={loading} icon="💾" />
                    </View>
                    <View style={{ height: 30 }} />
                </ScrollView>
            ) : (
                // GPS Tracking Mode
                <View style={styles.mapContainer}>
                    <MapComponent
                        onLocationSelected={setEndLocation}
                        showNearbyGyms={true}
                        markerTitle="Activity End Point"
                    />

                    <View style={styles.trackingControls}>
                        {!startLocation ? (
                            <Button
                                title="🎯 Start Tracking"
                                onPress={handleStartTracking}
                                loading={loading}
                                style={styles.trackButton}
                            />
                        ) : (
                            <>
                                <Text style={styles.trackingStatus}>
                                    ✅ Tracking Active - Select end location
                                </Text>
                                <Button
                                    title="🏁 End Tracking"
                                    onPress={handleEndTracking}
                                    loading={loading}
                                    style={styles.trackButton}
                                />
                            </>
                        )}
                    </View>

                    {/* Activity Details Form */}
                    {endLocation && (
                        <View style={styles.detailsForm}>
                            <SectionHeader title="Activity Details" />

                            <Text style={styles.fieldLabel}>Activity Type</Text>
                            <View style={styles.typePills}>
                                {activityTypes.slice(0, 5).map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.smallPill, activityForm.type === type && styles.smallPillActive]}
                                        onPress={() => setActivityForm({ ...activityForm, type })}
                                    >
                                        <Text
                                            style={[
                                                styles.smallPillTxt,
                                                activityForm.type === type && styles.smallPillTxtActive,
                                            ]}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <InputField
                                label="Duration (min)"
                                icon="⏱️"
                                value={activityForm.duration}
                                onChangeText={(v) => setActivityForm({ ...activityForm, duration: v })}
                                placeholder="e.g. 45"
                                keyboardType="numeric"
                            />

                            <Button
                                title="💾 Save Activity"
                                onPress={handleSaveActivity}
                                loading={loading}
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modeToggle: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    modeButton: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.lg,
        borderWidth: 1.5,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.card,
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    modeButtonText: {
        color: Colors.textSecondary,
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
    },
    modeButtonTextActive: {
        color: Colors.white,
        fontWeight: Typography.bold,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: Spacing.base,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        marginTop: Spacing.base,
    },
    fieldLabel: {
        color: Colors.textSecondary,
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        marginBottom: Spacing.xs,
    },
    pill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.surface,
        marginRight: Spacing.sm,
    },
    pillActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '20',
    },
    pillTxt: {
        color: Colors.textSecondary,
        fontSize: Typography.xs,
        fontWeight: Typography.medium,
    },
    pillTxtActive: {
        color: Colors.primary,
        fontWeight: Typography.bold,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    trackingControls: {
        backgroundColor: Colors.card,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
        padding: Spacing.base,
    },
    trackingStatus: {
        color: Colors.success,
        fontSize: Typography.sm,
        fontWeight: Typography.bold,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    trackButton: {
        marginBottom: Spacing.sm,
    },
    detailsForm: {
        backgroundColor: Colors.card,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
        padding: Spacing.base,
        maxHeight: '30%',
    },
    typePills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.base,
    },
    smallPill: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.surface,
    },
    smallPillActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '20',
    },
    smallPillTxt: {
        color: Colors.textSecondary,
        fontSize: Typography.xs,
    },
    smallPillTxtActive: {
        color: Colors.primary,
        fontWeight: Typography.bold,
    },
});
