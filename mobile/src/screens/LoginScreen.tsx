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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not sign in. Please try again.');
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
        <View style={styles.brand}>
          <Text style={styles.logo}>EPANAW BAGOBO</Text>
          <Text style={styles.tagline}>Preserving Bagobo Tagabawa language & culture</Text>
        </View>

        <Text style={styles.heading}>Welcome back</Text>

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
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Your password"
        />

        <PrimaryButton title="Sign in" onPress={submit} loading={loading} />

        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerText}>
            New here? <Text style={styles.footerAccent}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing(6), flexGrow: 1 },
  brand: { alignItems: 'center', marginBottom: spacing(8) },
  logo: { fontSize: font.xxl, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  tagline: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2), textAlign: 'center' },
  heading: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing(5) },
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
