import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Colors, Gradients } from '../theme/colors';
import { Typography, Spacing, Radius } from '../theme/typography';

// ── INPUT FIELD ───────────────────────────────────────
export const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    icon,
    error,
    ...props
}) => (
    <View style={inputStyles.wrapper}>
        {label && <Text style={inputStyles.label}>{label}</Text>}
        <View style={[inputStyles.container, error && inputStyles.containerError]}>
            {icon && <Text style={inputStyles.icon}>{icon}</Text>}
            <TextInput
                style={inputStyles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize="none"
                {...props}
            />
        </View>
        {error && <Text style={inputStyles.error}>{error}</Text>}
    </View>
);

const inputStyles = StyleSheet.create({
    wrapper: { marginBottom: Spacing.md },
    label: {
        color: Colors.textSecondary,
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
        marginBottom: Spacing.xs,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        paddingHorizontal: Spacing.base,
        height: 52,
    },
    containerError: { borderColor: Colors.error },
    icon: { fontSize: 18, marginRight: Spacing.sm },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: Typography.base,
    },
    error: {
        color: Colors.error,
        fontSize: Typography.xs,
        marginTop: 4,
    },
});

// ── PRIMARY BUTTON ────────────────────────────────────
export const Button = ({ title, onPress, loading, variant = 'primary', style, icon }) => {
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            style={[
                buttonStyles.btn,
                isSecondary && buttonStyles.secondary,
                isOutline && buttonStyles.outline,
                style,
            ]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
            ) : (
                <View style={buttonStyles.row}>
                    {icon && <Text style={buttonStyles.icon}>{icon}</Text>}
                    <Text style={[buttonStyles.text, isOutline && buttonStyles.textOutline]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const buttonStyles = StyleSheet.create({
    btn: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.md,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    secondary: {
        backgroundColor: Colors.card,
        shadowColor: 'transparent',
    },
    outline: {
        backgroundColor: Colors.transparent,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        shadowColor: 'transparent',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    icon: { fontSize: 18 },
    text: {
        color: Colors.white,
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
    },
    textOutline: { color: Colors.primary },
});

// ── METRIC CARD ───────────────────────────────────────
export const MetricCard = ({ icon, label, value, unit, color, trend }) => (
    <View style={[metricStyles.card, { borderColor: color + '40' }]}>
        <View style={[metricStyles.iconBg, { backgroundColor: color + '20' }]}>
            <Text style={metricStyles.icon}>{icon}</Text>
        </View>
        <Text style={metricStyles.label}>{label}</Text>
        <View style={metricStyles.valueRow}>
            <Text style={[metricStyles.value, { color }]}>{value}</Text>
            <Text style={metricStyles.unit}>{unit}</Text>
        </View>
        {trend && <Text style={metricStyles.trend}>{trend}</Text>}
    </View>
);

const metricStyles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        padding: Spacing.base,
        width: '47%',
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    icon: { fontSize: 20 },
    label: {
        color: Colors.textSecondary,
        fontSize: Typography.xs,
        fontWeight: Typography.medium,
        marginBottom: 4,
    },
    valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
    value: { fontSize: Typography.xl, fontWeight: Typography.bold },
    unit: {
        color: Colors.textMuted,
        fontSize: Typography.xs,
    },
    trend: {
        color: Colors.success,
        fontSize: Typography.xs,
        marginTop: 4,
    },
});

// ── SECTION HEADER ────────────────────────────────────
export const SectionHeader = ({ title, onSeeAll }) => (
    <View style={sectionStyles.row}>
        <Text style={sectionStyles.title}>{title}</Text>
        {onSeeAll && (
            <TouchableOpacity onPress={onSeeAll}>
                <Text style={sectionStyles.seeAll}>See all →</Text>
            </TouchableOpacity>
        )}
    </View>
);

const sectionStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.base,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: Typography.md,
        fontWeight: Typography.bold,
    },
    seeAll: {
        color: Colors.primary,
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
    },
});

// ── BADGE ─────────────────────────────────────────────
export const Badge = ({ label, color = Colors.primary }) => (
    <View style={[badgeStyles.badge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
        <Text style={[badgeStyles.text, { color }]}>{label}</Text>
    </View>
);

const badgeStyles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    text: { fontSize: Typography.xs, fontWeight: Typography.semibold },
});
