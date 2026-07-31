import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, EmptyState, ErrorState, Loading, Pill, ProgressBar } from '../components/ui';
import { colors, font, spacing } from '../theme';

export function ProgressScreen() {
  const { data, loading, error, reload } = useAsync(() => api.progress());

  if (loading && !data) return <Loading label="Loading progress" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      <View style={styles.statsRow}>
        <Stat num={d.stats.completed} label="Completed" />
        <Stat num={d.stats.inProgress} label="In progress" />
        <Stat num={d.stats.quizzesTaken} label="Quizzes" />
      </View>

      {d.rows.length === 0 ? (
        <EmptyState title="No progress yet" subtitle="Start a learning module to track your journey." />
      ) : (
        d.rows.map((r) => (
          <Card key={r.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{r.title}</Text>
              <Pill label={r.status} tone={r.status === 'Completed' ? 'success' : r.status === 'In Progress' ? 'accent' : 'muted'} />
            </View>
            <View style={styles.metaRow}>
              <Pill label={r.module} tone="muted" />
              <Pill label={r.difficulty} tone="muted" />
              {r.score ? <Text style={styles.meta}>Score: {r.score}</Text> : null}
            </View>
            <View style={styles.progressRow}>
              <View style={{ flex: 1 }}><ProgressBar value={r.progress} /></View>
              <Text style={styles.pct}>{r.progress}%</Text>
            </View>
            {r.completedAt ? <Text style={styles.meta}>Completed {r.completedAt}</Text> : null}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

function Stat({ num, label }: { num: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  statsRow: { flexDirection: 'row', gap: spacing(3), marginBottom: spacing(4) },
  stat: { flex: 1, backgroundColor: colors.primary, borderRadius: 16, padding: spacing(4), alignItems: 'center' },
  statNum: { fontSize: font.xl, fontWeight: '800', color: colors.white },
  statLbl: { fontSize: font.xs, color: colors.primaryLight, marginTop: spacing(1) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing(2) },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(2), flexWrap: 'wrap' },
  meta: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(2) },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginTop: spacing(3) },
  pct: { fontSize: font.sm, fontWeight: '700', color: colors.primary, width: 44, textAlign: 'right' },
});
