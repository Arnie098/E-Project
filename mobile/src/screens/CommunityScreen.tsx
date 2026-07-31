import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Card, EmptyState, ErrorState, Loading, Pill, PrimaryButton, TextField } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

type Tab = 'contributions' | 'feedback';
const CONTRIB_TYPES = ['Story', 'Audio', 'Image', 'Text'];

export function CommunityScreen() {
  const [tab, setTab] = useState<Tab>('contributions');
  return (
    <View style={styles.flex}>
      <View style={styles.tabBar}>
        <TabButton label="Contributions" active={tab === 'contributions'} onPress={() => setTab('contributions')} />
        <TabButton label="Feedback" active={tab === 'feedback'} onPress={() => setTab('feedback')} />
      </View>
      {tab === 'contributions' ? <Contributions /> : <FeedbackTab />}
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Contributions() {
  const { data, loading, error, reload } = useAsync(() => api.contributions());
  const [item, setItem] = useState('');
  const [type, setType] = useState(CONTRIB_TYPES[0]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setErrors({});
    setSubmitting(true);
    try {
      await api.createContribution({ item: item.trim(), type, description });
      setItem('');
      setDescription('');
      reload();
      Alert.alert('Submitted', 'Your contribution was submitted for review. Salamat!');
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        const flat: Record<string, string> = {};
        Object.entries(e.errors).forEach(([k, v]) => (flat[k] = v[0]));
        setErrors(flat);
      } else {
        Alert.alert('Error', e instanceof ApiError ? e.message : 'Could not submit.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !data) return <Loading label="Loading contributions" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.formTitle}>Share a contribution</Text>
        <TextField label="Title" value={item} onChangeText={setItem} placeholder="e.g. Bagobo weaving pattern" error={errors.item} />
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {CONTRIB_TYPES.map((t) => (
            <TouchableOpacity key={t} style={[styles.typeChip, type === t && styles.typeChipActive]} onPress={() => setType(t)}>
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextField label="Description" value={description} onChangeText={setDescription} multiline placeholder="Describe your contribution" error={errors.description} />
        <PrimaryButton title="Submit contribution" onPress={submit} loading={submitting} disabled={!item.trim()} />
      </Card>

      <Text style={styles.sectionTitle}>Your contributions</Text>
      {d.contributions.length === 0 ? (
        <EmptyState title="No contributions yet" subtitle="Submit your first above." />
      ) : (
        d.contributions.map((c) => (
          <Card key={c.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{c.item}</Text>
              <Pill label={c.status} tone={c.status === 'Approved' ? 'success' : c.status === 'Pending' ? 'accent' : 'muted'} />
            </View>
            <View style={styles.metaRow}>
              <Pill label={c.type} tone="muted" />
              <Text style={styles.meta}>{c.submittedAt}</Text>
            </View>
            {c.description ? <Text style={styles.desc}>{c.description}</Text> : null}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

function FeedbackTab() {
  const { data, loading, error, reload } = useAsync(() => api.feedback());
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setErrors({});
    setSubmitting(true);
    try {
      await api.createFeedback({ subject: subject.trim(), body: body.trim(), rating });
      setSubject('');
      setBody('');
      setRating(5);
      reload();
      Alert.alert('Thank you', 'Your feedback has been submitted.');
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        const flat: Record<string, string> = {};
        Object.entries(e.errors).forEach(([k, v]) => (flat[k] = v[0]));
        setErrors(flat);
      } else {
        Alert.alert('Error', e instanceof ApiError ? e.message : 'Could not submit.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !data) return <Loading label="Loading feedback" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.formTitle}>Send feedback</Text>
        <TextField label="Subject" value={subject} onChangeText={setSubject} placeholder="What is this about?" error={errors.subject} />
        <Text style={styles.label}>Rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={30} color={colors.accent} />
            </TouchableOpacity>
          ))}
        </View>
        <TextField label="Message" value={body} onChangeText={setBody} multiline placeholder="Tell us more" error={errors.body} />
        <PrimaryButton title="Submit feedback" onPress={submit} loading={submitting} disabled={!subject.trim() || !body.trim()} />
      </Card>

      <Text style={styles.sectionTitle}>Your feedback</Text>
      {d.feedback.length === 0 ? (
        <EmptyState title="No feedback yet" subtitle="Share your thoughts above." />
      ) : (
        d.feedback.map((f) => (
          <Card key={f.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{f.subject}</Text>
              <Pill label={f.status} tone={f.status === 'Resolved' ? 'success' : 'accent'} />
            </View>
            {f.rating != null ? (
              <View style={styles.inlineStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons key={n} name={n <= (f.rating ?? 0) ? 'star' : 'star-outline'} size={14} color={colors.accent} />
                ))}
              </View>
            ) : null}
            <Text style={styles.desc}>{f.body}</Text>
            <Text style={styles.meta}>{f.submittedAt}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  tabBar: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: spacing(3.5), alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: font.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  container: { padding: spacing(4) },
  formTitle: { fontSize: font.md, fontWeight: '800', color: colors.text, marginBottom: spacing(3) },
  label: { fontSize: font.sm, fontWeight: '600', color: colors.text, marginBottom: spacing(2) },
  typeRow: { flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(3) },
  typeChip: { paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: font.xs, color: colors.text, fontWeight: '600' },
  typeChipTextActive: { color: colors.white },
  starsRow: { flexDirection: 'row', gap: spacing(2), marginBottom: spacing(3) },
  inlineStars: { flexDirection: 'row', gap: 2, marginTop: spacing(2) },
  sectionTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text, marginTop: spacing(4), marginBottom: spacing(3) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing(2) },
  itemTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(2), flexWrap: 'wrap' },
  meta: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(2) },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2), lineHeight: 21 },
});
