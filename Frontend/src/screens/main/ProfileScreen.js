import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logoutUser } from '../../store/slices/authSlice';
import { InputField, Button, SectionHeader } from '../../components/UIComponents';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';

const InfoRow = ({ label, value, icon }) => (
    <View style={infoStyles.row}>
        <Text style={infoStyles.icon}>{icon}</Text>
        <View style={infoStyles.labelWrap}>
            <Text style={infoStyles.label}>{label}</Text>
            <Text style={infoStyles.value}>{value || '—'}</Text>
        </View>
    </View>
);

const infoStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
        gap: Spacing.md,
    },
    icon: { fontSize: 20, width: 28 },
    labelWrap: { flex: 1 },
    label: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 2 },
    value: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
});

export default function ProfileScreen() {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);

    const [editMode, setEditMode] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [remindersEnabled, setRemindersEnabled] = useState(true);

    const [form, setForm] = useState({
        name: user?.name || '',
        age: String(user?.age || ''),
        weight: String(user?.weight || ''),
        height: String(user?.height || ''),
        emergencyContact: user?.emergencyContact || '',
        emergencyPhone: user?.emergencyPhone || '',
    });

    const handleSave = async () => {
        const result = await dispatch(updateProfile({
            name: form.name,
            age: form.age ? Number(form.age) : undefined,
            weight: form.weight ? Number(form.weight) : undefined,
            height: form.height ? Number(form.height) : undefined,
            emergencyContact: form.emergencyContact,
            emergencyPhone: form.emergencyPhone,
        }));
        if (updateProfile.fulfilled.match(result)) {
            Alert.alert('✅ Success', 'Profile updated successfully');
            setEditMode(false);
        } else {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logoutUser()) },
        ]);
    };

    // Calculate BMI
    const bmi = user?.weight && user?.height
        ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
        : null;
    const bmiStatus = bmi
        ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
        : null;
    const bmiColor = bmi
        ? bmi < 18.5 ? Colors.accentBlue : bmi < 25 ? Colors.success : bmi < 30 ? Colors.warning : Colors.error
        : Colors.textMuted;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.badgeRow}>
                    {user?.gender && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeTxt}>{user.gender === 'male' ? '♂ Male' : user.gender === 'female' ? '♀ Female' : '⚧ Other'}</Text>
                        </View>
                    )}
                    {bmi && (
                        <View style={[styles.badge, { borderColor: bmiColor + '60', backgroundColor: bmiColor + '15' }]}>
                            <Text style={[styles.badgeTxt, { color: bmiColor }]}>BMI {bmi} · {bmiStatus}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Edit / View toggle */}
            {!editMode ? (
                <>
                    {/* Profile info */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>👤 Personal Details</Text>
                            <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editBtn}>
                                <Text style={styles.editTxt}>✏️ Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <InfoRow label="Full Name" value={user?.name} icon="🧑" />
                        <InfoRow label="Email" value={user?.email} icon="✉️" />
                        <InfoRow label="Age" value={user?.age ? `${user.age} years` : null} icon="🎂" />
                        <InfoRow label="Gender" value={user?.gender} icon="⚧" />
                        <InfoRow label="Weight" value={user?.weight ? `${user.weight} kg` : null} icon="⚖️" />
                        <InfoRow label="Height" value={user?.height ? `${user.height} cm` : null} icon="📏" />
                    </View>

                    {/* Emergency contacts */}
                    <View style={styles.card}>
                        <SectionHeader title="🚨 Emergency Contact" />
                        <InfoRow label="Contact Name" value={user?.emergencyContact} icon="👥" />
                        <InfoRow label="Phone Number" value={user?.emergencyPhone} icon="📞" />
                        {user?.emergencyPhone && (
                            <TouchableOpacity style={styles.alertBtn}>
                                <Text style={styles.alertBtnTxt}>🚨 Send Emergency Alert</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </>
            ) : (
                /* Edit form */
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>✏️ Edit Profile</Text>
                    <View style={{ marginTop: Spacing.base }}>
                        <InputField label="Full Name" icon="🧑" value={form.name}
                            onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
                        <InputField label="Age" icon="🎂" value={form.age}
                            onChangeText={(v) => setForm({ ...form, age: v })} placeholder="e.g. 28" keyboardType="numeric" />
                        <InputField label="Weight (kg)" icon="⚖️" value={form.weight}
                            onChangeText={(v) => setForm({ ...form, weight: v })} placeholder="e.g. 70" keyboardType="numeric" />
                        <InputField label="Height (cm)" icon="📏" value={form.height}
                            onChangeText={(v) => setForm({ ...form, height: v })} placeholder="e.g. 175" keyboardType="numeric" />
                        <InputField label="Emergency Contact Name" icon="👥" value={form.emergencyContact}
                            onChangeText={(v) => setForm({ ...form, emergencyContact: v })} placeholder="Contact name" />
                        <InputField label="Emergency Phone" icon="📞" value={form.emergencyPhone}
                            onChangeText={(v) => setForm({ ...form, emergencyPhone: v })} placeholder="+1234567890" keyboardType="phone-pad" />

                        <View style={styles.btnRow}>
                            <Button title="Save Changes" onPress={handleSave} loading={loading} style={{ flex: 1, marginRight: Spacing.sm }} />
                            <Button title="Cancel" onPress={() => setEditMode(false)} variant="outline" style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            )}

            {/* Notifications settings */}
            <View style={styles.card}>
                <SectionHeader title="🔔 Notifications" />
                <View style={styles.settingRow}>
                    <View>
                        <Text style={styles.settingLabel}>Push Notifications</Text>
                        <Text style={styles.settingSubLabel}>Receive health alerts</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: Colors.cardBorder, true: Colors.primary + '60' }}
                        thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
                    />
                </View>
                <View style={styles.settingRow}>
                    <View>
                        <Text style={styles.settingLabel}>Medication Reminders</Text>
                        <Text style={styles.settingSubLabel}>Daily medicine alerts</Text>
                    </View>
                    <Switch
                        value={remindersEnabled}
                        onValueChange={setRemindersEnabled}
                        trackColor={{ false: Colors.cardBorder, true: Colors.primary + '60' }}
                        thumbColor={remindersEnabled ? Colors.primary : Colors.textMuted}
                    />
                </View>
            </View>

            {/* App version & logout */}
            <View style={styles.card}>
                <SectionHeader title="⚙️ App Settings" />
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuItemTxt}>📄 Privacy Policy</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuItemTxt}>❓ Help & Support</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuItemTxt}>ℹ️ App Version 1.0.0</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <Button
                title="Sign Out"
                onPress={handleLogout}
                variant="outline"
                icon="🚪"
                style={{ borderColor: Colors.error, marginBottom: Spacing.xl }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: 20 },

    header: { alignItems: 'center', marginBottom: Spacing.xl },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.primary + '30',
        borderWidth: 3,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: { fontSize: Typography.xxxl, fontWeight: Typography.bold, color: Colors.primary },
    name: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
    email: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.sm },
    badgeRow: { flexDirection: 'row', gap: Spacing.sm },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.primary + '50',
        backgroundColor: Colors.primary + '15',
    },
    badgeTxt: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },

    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        marginBottom: Spacing.base,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    cardTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
    editBtn: {
        backgroundColor: Colors.primary + '20',
        borderRadius: Radius.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.primary + '40',
    },
    editTxt: { color: Colors.primary, fontSize: Typography.xs, fontWeight: Typography.semibold },

    alertBtn: {
        marginTop: Spacing.md,
        backgroundColor: Colors.error + '15',
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.error + '40',
        alignItems: 'center',
    },
    alertBtnTxt: { color: Colors.error, fontWeight: Typography.bold, fontSize: Typography.sm },

    btnRow: { flexDirection: 'row', marginTop: Spacing.base },

    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    settingLabel: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
    settingSubLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    menuItemTxt: { fontSize: Typography.base, color: Colors.textPrimary },
    menuArrow: { fontSize: Typography.lg, color: Colors.textMuted },
});
