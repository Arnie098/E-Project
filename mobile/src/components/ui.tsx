import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, font, radius, spacing } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Pill({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'accent' | 'muted' }) {
  const toneStyle =
    tone === 'success'
      ? { bg: '#dcfce7', fg: '#166534' }
      : tone === 'accent'
      ? { bg: '#fef3c7', fg: '#92400e' }
      : tone === 'muted'
      ? { bg: '#e2e8f0', fg: '#475569' }
      : { bg: colors.primaryLight, fg: colors.primaryDark };
  return (
    <View style={[styles.pill, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.pillText, { color: toneStyle.fg }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%` }]} />
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
}) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isOutline && styles.buttonOutline,
        isDanger && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.buttonText, isOutline && styles.buttonTextOutline]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string | null }) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.mutedText}>{label}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorHeading}>Something went wrong</Text>
      <Text style={styles.mutedText}>{message}</Text>
      {onRetry ? (
        <View style={{ marginTop: spacing(4), alignSelf: 'stretch' }}>
          <PrimaryButton title="Try again" onPress={onRetry} variant="outline" />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.mutedText}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(3),
  },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing(3),
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
  pillText: { fontSize: font.xs, fontWeight: '600' },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: radius.full, backgroundColor: colors.primary },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  buttonDanger: { backgroundColor: colors.danger },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
  buttonTextOutline: { color: colors.primary },
  fieldWrap: { marginBottom: spacing(3.5) },
  label: { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing(1.5) },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(3),
    fontSize: font.md,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: font.xs, marginTop: spacing(1) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(6) },
  mutedText: { color: colors.textMuted, fontSize: font.sm, textAlign: 'center', marginTop: spacing(2) },
  errorHeading: { color: colors.text, fontSize: font.lg, fontWeight: '700' },
  emptyTitle: { color: colors.text, fontSize: font.md, fontWeight: '600' },
});
