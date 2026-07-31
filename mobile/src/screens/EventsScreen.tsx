import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, EmptyState, ErrorState, Loading } from '../components/ui';
import type { EventItem } from '../api/types';
import { colors, font, radius, spacing } from '../theme';

export function EventsScreen() {
  const { data, loading, error, reload } = useAsync(() => api.events());

  if (loading && !data) return <Loading label="Loading events" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  const hasNone = d.upcoming.length === 0 && d.past.length === 0;
  if (hasNone) return <EmptyState title="No events" subtitle="Community events will show up here." />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      {d.upcoming.length > 0 ? (
        <>
          <Text style={styles.heading}>Upcoming</Text>
          {d.upcoming.map((e) => <EventRow key={e.id} e={e} />)}
        </>
      ) : null}
      {d.past.length > 0 ? (
        <>
          <Text style={styles.heading}>Past events</Text>
          {d.past.map((e) => <EventRow key={e.id} e={e} muted />)}
        </>
      ) : null}
    </ScrollView>
  );
}

function EventRow({ e, muted }: { e: EventItem; muted?: boolean }) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.dateBox, muted && styles.dateBoxMuted]}>
          <Text style={[styles.day, muted && styles.mutedDark]}>{e.day}</Text>
          <Text style={[styles.month, muted && styles.mutedDark]}>{e.month}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{e.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.meta}>{e.weekday}, {e.time}</Text>
          </View>
          {e.location ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{e.location}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  heading: { fontSize: font.lg, fontWeight: '800', color: colors.text, marginBottom: spacing(3), marginTop: spacing(2) },
  row: { flexDirection: 'row', gap: spacing(3), alignItems: 'center' },
  dateBox: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dateBoxMuted: { backgroundColor: colors.border },
  day: { color: colors.white, fontSize: font.lg, fontWeight: '800' },
  month: { color: colors.primaryLight, fontSize: font.xs, fontWeight: '700' },
  mutedDark: { color: colors.textMuted },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginTop: spacing(1) },
  meta: { fontSize: font.xs, color: colors.textMuted },
});
