import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, ErrorState, Loading, Pill, ProgressBar } from '../components/ui';
import type { AppStackParamList } from '../navigation/types';
import { colors, font, spacing } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

function statusTone(status: string): 'success' | 'accent' | 'muted' {
  if (status === 'Completed') return 'success';
  if (status === 'In Progress') return 'accent';
  return 'muted';
}

export function LearnScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = useAsync(() => api.modules());

  if (loading && !data) return <Loading label="Loading modules" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{d.stats.completed}</Text><Text style={styles.statLbl}>Completed</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{d.stats.inProgress}</Text><Text style={styles.statLbl}>In progress</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{d.stats.total}</Text><Text style={styles.statLbl}>Total</Text></View>
      </View>

      {d.modules.map((m) => (
        <TouchableOpacity key={m.id} activeOpacity={0.85} onPress={() => nav.navigate('ModuleDetail', { id: m.id, title: m.title })}>
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{m.title}</Text>
              <Pill label={m.status} tone={statusTone(m.status)} />
            </View>
            {m.description ? <Text style={styles.desc} numberOfLines={2}>{m.description}</Text> : null}
            <View style={styles.metaRow}>
              <Pill label={m.module} tone="default" />
              <Pill label={m.difficulty} tone="muted" />
              <Text style={styles.meta}>{m.questions} questions</Text>
            </View>
            <View style={styles.progressRow}>
              <View style={{ flex: 1 }}><ProgressBar value={m.progress} /></View>
              <Text style={styles.pct}>{m.progress}%</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  statsRow: { flexDirection: 'row', gap: spacing(3), marginBottom: spacing(4) },
  stat: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing(3), alignItems: 'center' },
  statNum: { fontSize: font.xl, fontWeight: '800', color: colors.primary },
  statLbl: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(1) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing(2) },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text, flex: 1 },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2) },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(3), flexWrap: 'wrap' },
  meta: { fontSize: font.xs, color: colors.textMuted },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginTop: spacing(3) },
  pct: { fontSize: font.sm, fontWeight: '700', color: colors.primary, width: 44, textAlign: 'right' },
});
