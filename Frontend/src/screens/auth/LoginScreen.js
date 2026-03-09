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
import { loginUser, clearError } from '../../store/slices/authSlice';
import { InputField, Button } from '../../components/UIComponents';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';

export default function LoginScreen({ navigation }) {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Min 6 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        dispatch(clearError());
        const result = await dispatch(loginUser(form));
        if (loginUser.rejected.match(result)) {
            Alert.alert('Login Failed', result.payload || 'Something went wrong');
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
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>💓</Text>
                    </View>
                    <Text style={styles.appName}>Insightful</Text>
                    <Text style={styles.tagline}>Health Tracker</Text>
                    <Text style={styles.subtitle}>Your personal wellness companion</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome Back</Text>
                    <Text style={styles.cardSubtitle}>Sign in to continue your health journey</Text>

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
                        placeholder="Enter your password"
                        secureTextEntry
                        error={errors.password}
                    />

                    <TouchableOpacity
                        style={styles.forgotBtn}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotTxt}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button title="Sign In" onPress={handleLogin} loading={loading} icon="→" />

                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorTxt}>⚠️ {error}</Text>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerTxt}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                {/* Demo hint */}
                <View style={styles.demoBox}>
                    <Text style={styles.demoTxt}>🔑 Demo: demo@health.com / password123</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },

    header: { alignItems: 'center', marginBottom: Spacing.xxl },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '30',
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    logoText: { fontSize: 36 },
    appName: {
        fontSize: Typography.xxxl,
        fontWeight: Typography.extrabold,
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: Typography.md,
        fontWeight: Typography.semibold,
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
    },

    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    cardTitle: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
    },

    forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.base, marginTop: -4 },
    forgotTxt: { color: Colors.primary, fontSize: Typography.sm, fontWeight: Typography.medium },

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
        marginBottom: Spacing.base,
    },
    footerTxt: { color: Colors.textSecondary, fontSize: Typography.base },
    footerLink: { color: Colors.primary, fontSize: Typography.base, fontWeight: Typography.bold },

    demoBox: {
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    demoTxt: { color: Colors.textMuted, fontSize: Typography.xs },
});
