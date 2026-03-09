import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealthRecords } from '../../store/slices/healthSlice';
import { fetchActivities } from '../../store/slices/activitySlice';
import { fetchMeals } from '../../store/slices/mealSlice';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';
import { SectionHeader } from '../../components/UIComponents';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.xl * 2 - Spacing.xl * 2;

const PERIODS = ['Week', 'Month'];

const chartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 148, 184, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
    propsForBackgroundLines: { stroke: Colors.cardBorder, strokeDasharray: '3,3' },
};

const StatBox = ({ label, value, unit, color, icon }) => (
    <View style={[statStyles.box, { borderColor: color + '30' }]}>
        <Text style={statStyles.icon}>{icon}</Text>
        <Text style={[statStyles.value, { color }]}>{value}</Text>
        <Text style={statStyles.unit}>{unit}</Text>
        <Text style={statStyles.label}>{label}</Text>
    </View>
);

const statStyles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        padding: Spacing.md,
        alignItems: 'center',
        margin: 4,
    },
    icon: { fontSize: 20, marginBottom: 4 },
    value: { fontSize: Typography.lg, fontWeight: Typography.bold },
    unit: { fontSize: Typography.xs, color: Colors.textMuted },
    label: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
});

export default function ReportsScreen() {
    const dispatch = useDispatch();
    const { records } = useSelector((state) => state.health);
    const { activities } = useSelector((state) => state.activity);
    const { meals } = useSelector((state) => state.meal);
    const [period, setPeriod] = useState('Week');

    useEffect(() => {
        dispatch(fetchHealthRecords({ limit: 7 }));
        dispatch(fetchActivities({ limit: 7 }));
        dispatch(fetchMeals({ limit: 7 }));
    }, []);

    // Build heart rate chart data
    const hrData = records.slice(0, 7).reverse().map((r) => r.heartRate || 0);
    const hrLabels = records.slice(0, 7).reverse().map((_, i) => `D${i + 1}`);

    // Steps chart data
    const stepsData = activities.slice(0, 7).reverse().map((a) => a.steps || 0);
    const stepsLabels = activities.slice(0, 7).reverse().map((_, i) => `D${i + 1}`);

    // Calories chart data
    const calData = meals.slice(0, 7).reverse().map((m) => m.calories || 0);
    const calLabels = meals.slice(0, 7).reverse().map((_, i) => `D${i + 1}`);

    // Averages
    const avgHR = hrData.length ? Math.round(hrData.reduce((a, b) => a + b, 0) / hrData.filter(Boolean).length) || 0 : 0;
    const totalSteps = stepsData.reduce((a, b) => a + b, 0);
    const totalCals = calData.reduce((a, b) => a + b, 0);
    const avgWeight = records.length ? Math.round(records.filter(r => r.weight).reduce((a, b) => a + (b.weight || 0), 0) / records.filter(r => r.weight).length) || 0 : 0;

    const hasHRData = hrData.some(Boolean);
    const hasStepsData = stepsData.some(Boolean);
    const hasCalData = calData.some(Boolean);

    const placeholderHR = [65, 72, 68, 75, 70, 73, 69];
    const placeholderSteps = [6000, 8500, 7200, 9100, 5800, 10200, 8900];
    const placeholderCal = [1800, 2100, 1950, 2300, 1700, 2050, 2200];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Track your health trends over time</Text>

            {/* Period selector */}
            <View style={styles.periodRow}>
                {PERIODS.map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                        onPress={() => setPeriod(p)}
                    >
                        <Text style={[styles.periodTxt, period === p && styles.periodTxtActive]}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Summary stats */}
            <SectionHeader title="Summary" />
            <View style={styles.statsRow}>
                <StatBox label="Avg Heart Rate" value={avgHR || 71} unit="bpm" color={Colors.heartRate} icon="❤️" />
                <StatBox label="Total Steps" value={(totalSteps || 55200).toLocaleString()} unit="steps" color={Colors.accentBlue} icon="🚶" />
                <StatBox label="Avg Weight" value={avgWeight || '--'} unit="kg" color={Colors.accentGreen} icon="⚖️" />
                <StatBox label="Total Calories" value={(totalCals || 14100).toLocaleString()} unit="kcal" color={Colors.accentOrange} icon="🔥" />
            </View>

            {/* Heart Rate chart */}
            <SectionHeader title="❤️ Heart Rate Trend" />
            <View style={styles.chartCard}>
                <LineChart
                    data={{
                        labels: hasHRData ? hrLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{ data: hasHRData ? hrData : placeholderHR }],
                    }}
                    width={CHART_WIDTH}
                    height={180}
                    chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(255, 101, 132, ${opacity})` }}
                    bezier
                    style={styles.chart}
                    withInnerLines={true}
                    withOuterLines={false}
                />
                {!hasHRData && <Text style={styles.demoNote}>📊 Sample data — log health records to see real trends</Text>}
            </View>

            {/* Steps chart */}
            <SectionHeader title="🚶 Daily Steps" />
            <View style={styles.chartCard}>
                <BarChart
                    data={{
                        labels: hasStepsData ? stepsLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{ data: hasStepsData ? stepsData : placeholderSteps }],
                    }}
                    width={CHART_WIDTH}
                    height={180}
                    chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(84, 160, 255, ${opacity})` }}
                    style={styles.chart}
                    showValuesOnTopOfBars={false}
                    withInnerLines={false}
                />
                {!hasStepsData && <Text style={styles.demoNote}>📊 Sample data — log activities to see real steps</Text>}
            </View>

            {/* Calories chart */}
            <SectionHeader title="🔥 Daily Calorie Intake" />
            <View style={styles.chartCard}>
                <LineChart
                    data={{
                        labels: hasCalData ? calLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{ data: hasCalData ? calData : placeholderCal }],
                    }}
                    width={CHART_WIDTH}
                    height={180}
                    chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(255, 159, 67, ${opacity})` }}
                    bezier
                    style={styles.chart}
                    withInnerLines={true}
                    withOuterLines={false}
                />
                {!hasCalData && <Text style={styles.demoNote}>📊 Sample data — log meals to see real calorie trends</Text>}
            </View>

            {/* Health insight card */}
            <View style={styles.insightCard}>
                <Text style={styles.insightTitle}>💡 Health Insight</Text>
                <Text style={styles.insightText}>
                    {avgHR > 90
                        ? `⚠️ Your average heart rate (${avgHR} bpm) is slightly elevated. Consider relaxation exercises.`
                        : avgHR > 0
                            ? `✅ Your heart rate (${avgHR} bpm) is within a healthy range. Keep it up!`
                            : '📈 Start logging your health data to receive personalized insights.'}
                </Text>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: 20 },

    pageTitle: { fontSize: Typography.xxl, fontWeight: Typography.extrabold, color: Colors.textPrimary },
    pageSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.base },

    periodRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
    periodBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.card,
    },
    periodBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '20' },
    periodTxt: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
    periodTxtActive: { color: Colors.primary, fontWeight: Typography.bold },

    statsRow: { flexDirection: 'row', marginBottom: Spacing.base },

    chartCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.base,
        marginBottom: Spacing.base,
        overflow: 'hidden',
        alignItems: 'center',
    },
    chart: { borderRadius: 12, marginVertical: 4 },
    demoNote: {
        color: Colors.textMuted,
        fontSize: Typography.xs,
        textAlign: 'center',
        marginTop: Spacing.xs,
        fontStyle: 'italic',
    },

    insightCard: {
        backgroundColor: Colors.primary + '15',
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.primary + '40',
        padding: Spacing.base,
        marginTop: Spacing.sm,
    },
    insightTitle: { color: Colors.primary, fontWeight: Typography.bold, fontSize: Typography.base, marginBottom: 6 },
    insightText: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20 },
});
