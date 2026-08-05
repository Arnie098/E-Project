import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { PrimaryButton, TextField } from '../components/ui';
import { colors, font, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  async function submit() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send the reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing(10) }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Reset your password</Text>
        <Text style={styles.sub}>
          Enter the email linked to your account and we'll send a link to reset your password.
        </Text>

        {message ? <Text style={styles.formSuccess}>{message}</Text> : null}
        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
        />

        <PrimaryButton title="Send reset link" onPress={submit} loading={loading} disabled={!email.trim()} />

        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.goBack()}>
          <Text style={styles.footerText}>
            Remembered it? <Text style={styles.footerAccent}>Back to sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing(6), flexGrow: 1 },
  heading: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2), marginBottom: spacing(5), lineHeight: 21 },
  formError: {
    backgroundColor: colors.dangerBg,
    color: colors.danger,
    padding: spacing(3),
    borderRadius: 12,
    marginBottom: spacing(4),
    fontSize: font.sm,
  },
  formSuccess: {
    backgroundColor: '#ecfdf3',
    color: colors.success,
    padding: spacing(3),
    borderRadius: 12,
    marginBottom: spacing(4),
    fontSize: font.sm,
  },
  footerLink: { marginTop: spacing(6), alignItems: 'center' },
  footerText: { color: colors.textMuted, fontSize: font.sm },
  footerAccent: { color: colors.primary, fontWeight: '700' },
});
