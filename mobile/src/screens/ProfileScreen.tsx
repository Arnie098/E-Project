import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, PrimaryButton, TextField } from '../components/ui';
import type { AppStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Change-password form state
  const [changingPw, setChangingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [savingPw, setSavingPw] = useState(false);

  async function save() {
    setErrors({});
    setSaving(true);
    try {
      const res = await api.updateProfile({ name: name.trim(), email: email.trim(), bio, location });
      setUser(res.user);
      setEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        const flat: Record<string, string> = {};
        Object.entries(e.errors).forEach(([k, v]) => (flat[k] = v[0]));
        setErrors(flat);
      } else {
        Alert.alert('Error', e instanceof ApiError ? e.message : 'Could not save your profile.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    setPwErrors({});
    if (newPw !== confirmPw) {
      setPwErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }
    setSavingPw(true);
    try {
      await api.updatePassword({
        current_password: currentPw,
        password: newPw,
        password_confirmation: confirmPw,
      });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setChangingPw(false);
      Alert.alert('Password updated', 'Your password has been changed.');
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        const flat: Record<string, string> = {};
        Object.entries(e.errors).forEach(([k, v]) => (flat[k] = v[0]));
        setPwErrors(flat);
      } else {
        Alert.alert('Error', e instanceof ApiError ? e.message : 'Could not update your password.');
      }
    } finally {
      setSavingPw(false);
    }
  }

  function confirmLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
        {user?.memberSince ? <Text style={styles.since}>Member since {user.memberSince}</Text> : null}
      </View>

      <View style={styles.links}>
        <TouchableOpacity style={styles.linkRow} onPress={() => nav.navigate('Progress')}>
          <Ionicons name="stats-chart-outline" size={20} color={colors.primary} />
          <Text style={styles.linkLabel}>My Progress</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => nav.navigate('Community')}>
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <Text style={styles.linkLabel}>Community & Feedback</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Profile details</Text>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {editing ? (
          <View style={{ marginTop: spacing(3) }}>
            <TextField label="Name" value={name} onChangeText={setName} error={errors.name} />
            <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
            <TextField label="Bio" value={bio} onChangeText={setBio} multiline error={errors.bio} />
            <TextField label="Location" value={location} onChangeText={setLocation} error={errors.location} />
            <PrimaryButton title="Save changes" onPress={save} loading={saving} />
            <View style={{ height: spacing(2) }} />
            <PrimaryButton title="Cancel" variant="outline" onPress={() => setEditing(false)} />
          </View>
        ) : (
          <View style={{ marginTop: spacing(2) }}>
            <Detail label="Bio" value={user?.bio || 'Not set'} />
            <Detail label="Location" value={user?.location || 'Not set'} />
            <Detail label="Role" value={user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : 'Learner'} />
          </View>
        )}
      </Card>

      <View style={{ height: spacing(3) }} />

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Security</Text>
          {!changingPw ? (
            <TouchableOpacity onPress={() => setChangingPw(true)}>
              <Text style={styles.editLink}>Change password</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {changingPw ? (
          <View style={{ marginTop: spacing(3) }}>
            <TextField label="Current password" value={currentPw} onChangeText={setCurrentPw} secureTextEntry error={pwErrors.current_password} />
            <TextField label="New password" value={newPw} onChangeText={setNewPw} secureTextEntry placeholder="At least 8 characters" error={pwErrors.password} />
            <TextField label="Confirm new password" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry error={pwErrors.password_confirmation} />
            <PrimaryButton title="Update password" onPress={savePassword} loading={savingPw} disabled={!currentPw || !newPw || !confirmPw} />
            <View style={{ height: spacing(2) }} />
            <PrimaryButton
              title="Cancel"
              variant="outline"
              onPress={() => {
                setChangingPw(false);
                setCurrentPw('');
                setNewPw('');
                setConfirmPw('');
                setPwErrors({});
              }}
            />
          </View>
        ) : (
          <Text style={[styles.muted, { marginTop: spacing(2) }]}>Keep your account secure by updating your password regularly.</Text>
        )}
      </Card>

      <View style={{ marginTop: spacing(3) }}>
        <PrimaryButton title="Sign out" variant="danger" onPress={confirmLogout} />
      </View>
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  header: { alignItems: 'center', marginBottom: spacing(5) },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(3),
  },
  avatarText: { color: colors.white, fontSize: font.xl, fontWeight: '800' },
  name: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(1) },
  since: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(1) },
  links: { gap: spacing(3), marginBottom: spacing(3) },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(4),
  },
  linkLabel: { flex: 1, fontSize: font.md, fontWeight: '600', color: colors.text },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  editLink: { fontSize: font.sm, fontWeight: '700', color: colors.primary },
  detail: { paddingVertical: spacing(2) },
  detailLabel: { fontSize: font.xs, color: colors.textMuted },
  detailValue: { fontSize: font.sm, color: colors.text, marginTop: spacing(1) },
});
