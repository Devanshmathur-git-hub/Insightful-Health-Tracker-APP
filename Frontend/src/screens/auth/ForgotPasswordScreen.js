import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { authAPI } from '../../services/api';
import { InputField, Button } from '../../components/UIComponents';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radius } from '../../theme/typography';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email) { setError('Please enter your email'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email address'); return; }

        setLoading(true);
        setError('');
        try {
            await authAPI.forgotPassword({ email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backTxt}>← Back to Login</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Text style={{ fontSize: 40 }}>🔑</Text>
                </View>

                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                    Enter your email and we'll send you a link to reset your password.
                </Text>

                {!sent ? (
                    <View style={styles.card}>
                        <InputField
                            label="Email Address"
                            icon="✉️"
                            value={email}
                            onChangeText={(v) => { setEmail(v); setError(''); }}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            error={error}
                        />

                        <Button title="Send Reset Link" onPress={handleReset} loading={loading} icon="📧" />
                    </View>
                ) : (
                    <View style={styles.successCard}>
                        <Text style={styles.successIcon}>✅</Text>
                        <Text style={styles.successTitle}>Email Sent!</Text>
                        <Text style={styles.successMsg}>
                            Check your inbox at{' '}
                            <Text style={{ color: Colors.primary, fontWeight: '700' }}>{email}</Text> for
                            password reset instructions.
                        </Text>
                        <Button
                            title="Back to Login"
                            onPress={() => navigation.navigate('Login')}
                            style={{ marginTop: Spacing.lg }}
                            variant="outline"
                        />
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.xl },
    backBtn: { marginTop: 56, marginBottom: Spacing.xxl },
    backTxt: { color: Colors.primary, fontSize: Typography.base, fontWeight: Typography.medium },

    content: { alignItems: 'center' },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.primary + '20',
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: Typography.xxl,
        fontWeight: Typography.extrabold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.base,
    },

    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        width: '100%',
    },

    successCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.success + '40',
        padding: Spacing.xl,
        width: '100%',
        alignItems: 'center',
    },
    successIcon: { fontSize: 48, marginBottom: Spacing.md },
    successTitle: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.success,
        marginBottom: Spacing.sm,
    },
    successMsg: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
