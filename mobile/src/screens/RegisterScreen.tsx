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
import { useAuth } from '../context/AuthContext';
import { PrimaryButton, TextField } from '../components/ui';
import { ApiError } from '../api/client';
import { colors, font, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  async function submit() {
    setErrors({});
    setFormError(null);
    if (password !== confirm) {
      setErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirm,
      });
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        const flat: Record<string, string> = {};
        Object.entries(e.errors).forEach(([k, v]) => (flat[k] = v[0]));
        setErrors(flat);
        setFormError(e.message);
      } else {
        setFormError(e instanceof ApiError ? e.message : 'Could not create your account.');
      }
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
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing(8) }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.sub}>Join the community preserving Bagobo Tagabawa heritage.</Text>

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Juan dela Cruz" error={errors.name} />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          error={errors.email}
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" error={errors.password} />
        <TextField label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Re-enter password" error={errors.password_confirmation} />

        <PrimaryButton title="Create account" onPress={submit} loading={loading} />

        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerAccent}>Sign in</Text>
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
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2), marginBottom: spacing(5) },
  formError: {
    backgroundColor: colors.dangerBg,
    color: colors.danger,
    padding: spacing(3),
    borderRadius: 12,
    marginBottom: spacing(4),
    fontSize: font.sm,
  },
  footerLink: { marginTop: spacing(6), alignItems: 'center' },
  footerText: { color: colors.textMuted, fontSize: font.sm },
  footerAccent: { color: colors.primary, fontWeight: '700' },
});
