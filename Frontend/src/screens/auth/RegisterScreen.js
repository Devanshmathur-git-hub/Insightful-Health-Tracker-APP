import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { InputField, Button } from '../../components/UIComponents';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';

export default function RegisterScreen({ navigation }) {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        gender: 'male',
        weight: '',
        height: '',
    });
    const [errors, setErrors] = useState({});

    const genders = ['male', 'female', 'other'];

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Full name is required';
        if (!form.email) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Min 6 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        if (!form.age || isNaN(form.age)) e.age = 'Valid age is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        dispatch(clearError());
        
        // Check internet connectivity first
        if (!form.email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }
        
        const payload = {
            name: form.name,
            email: form.email,
            password: form.password,
            age: Number(form.age),
            gender: form.gender,
            weight: form.weight ? Number(form.weight) : undefined,
            height: form.height ? Number(form.height) : undefined,
        };
        
        console.log('📤 Attempting registration with:', payload);
        
        try {
            const result = await dispatch(registerUser(payload));
            console.log('📥 Registration result:', result);
            
            if (registerUser.rejected.match(result)) {
                const errorMessage = result.payload;
                console.error('❌ Registration failed:', errorMessage);
                
                // Show specific error message
                if (errorMessage?.includes('already')) {
                    Alert.alert('Email Exists', 'This email is already registered. Try logging in instead.');
                } else if (errorMessage?.includes('network') || errorMessage?.includes('ECONNREFUSED')) {
                    Alert.alert('Network Error', `Can't connect to server at 192.168.1.34:5001\n\nMake sure:\n1. Phone is on same WiFi\n2. Backend server is running\n3. Check your network IP`);
                } else {
                    Alert.alert('Registration Failed', errorMessage || 'Something went wrong');
                }
            } else {
                console.log('✅ Registration successful!');
            }
        } catch (err) {
            console.error('❌ Unexpected error:', err);
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Back btn */}
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backTxt}>← Back</Text>
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start your health journey today 💪</Text>
                </View>

                {/* Form card */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>👤 Personal Info</Text>

                    <InputField
                        label="Full Name"
                        icon="🧑"
                        value={form.name}
                        onChangeText={(v) => setForm({ ...form, name: v })}
                        placeholder="John Doe"
                        error={errors.name}
                    />
                    <InputField
                        label="Email Address"
                        icon="✉️"
                        value={form.email}
                        onChangeText={(v) => setForm({ ...form, email: v })}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        error={errors.email}
                    />
                    <InputField
                        label="Password"
                        icon="🔒"
                        value={form.password}
                        onChangeText={(v) => setForm({ ...form, password: v })}
                        placeholder="Min 6 characters"
                        secureTextEntry
                        error={errors.password}
                    />
                    <InputField
                        label="Confirm Password"
                        icon="🔒"
                        value={form.confirmPassword}
                        onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
                        placeholder="Repeat password"
                        secureTextEntry
                        error={errors.confirmPassword}
                    />

                    <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>📋 Health Profile</Text>

                    <InputField
                        label="Age"
                        icon="🎂"
                        value={form.age}
                        onChangeText={(v) => setForm({ ...form, age: v })}
                        placeholder="e.g. 28"
                        keyboardType="numeric"
                        error={errors.age}
                    />
                    <InputField
                        label="Weight (kg)"
                        icon="⚖️"
                        value={form.weight}
                        onChangeText={(v) => setForm({ ...form, weight: v })}
                        placeholder="e.g. 70"
                        keyboardType="numeric"
                    />
                    <InputField
                        label="Height (cm)"
                        icon="📏"
                        value={form.height}
                        onChangeText={(v) => setForm({ ...form, height: v })}
                        placeholder="e.g. 175"
                        keyboardType="numeric"
                    />

                    {/* Gender selector */}
                    <Text style={inputLabel}>Gender</Text>
                    <View style={styles.genderRow}>
                        {genders.map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
                                onPress={() => setForm({ ...form, gender: g })}
                            >
                                <Text style={[styles.genderTxt, form.gender === g && styles.genderTxtActive]}>
                                    {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚧ Other'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Button
                        title="Create Account"
                        onPress={handleRegister}
                        loading={loading}
                        style={{ marginTop: Spacing.base }}
                        icon="✓"
                    />

                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorTxt}>⚠️ {error}</Text>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerTxt}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const inputLabel = {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    marginBottom: 8,
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },

    backBtn: { marginBottom: Spacing.base },
    backTxt: { color: Colors.primary, fontSize: Typography.base, fontWeight: Typography.medium },

    header: { marginBottom: Spacing.xl },
    title: {
        fontSize: Typography.xxl,
        fontWeight: Typography.extrabold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: { fontSize: Typography.sm, color: Colors.textSecondary },

    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    sectionLabel: {
        fontSize: Typography.sm,
        fontWeight: Typography.bold,
        color: Colors.primary,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    genderRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
    genderBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.cardBorder,
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    genderBtnActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '20',
    },
    genderTxt: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
    genderTxtActive: { color: Colors.primary, fontWeight: Typography.bold },

    errorBox: {
        marginTop: Spacing.md,
        backgroundColor: Colors.error + '20',
        borderRadius: Radius.sm,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.error + '50',
    },
    errorTxt: { color: Colors.error, fontSize: Typography.sm },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerTxt: { color: Colors.textSecondary, fontSize: Typography.base },
    footerLink: { color: Colors.primary, fontSize: Typography.base, fontWeight: Typography.bold },
});
