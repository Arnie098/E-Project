import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, EmptyState, ErrorState, Loading, Pill } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

export function RepositoryScreen() {
  const { data, loading, error, reload } = useAsync(() => api.repository());
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.items.filter((i) => !category || i.category === category);
  }, [data, category]);

  if (loading && !data) return <Loading label="Loading repository" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      {d.categories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={!category} onPress={() => setCategory(null)} />
          {d.categories.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" subtitle="Cultural artifacts will appear here." />
      ) : (
        filtered.map((i) => (
          <Card key={i.id}>
            <View style={styles.tags}>
              {i.category ? <Pill label={i.category} /> : null}
              {i.type ? <Pill label={i.type} tone="muted" /> : null}
            </View>
            <Text style={styles.title}>{i.title}</Text>
            {i.description ? <Text style={styles.desc}>{i.description}</Text> : null}
            <Text style={styles.date}>{i.date}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  chips: { gap: spacing(2), paddingBottom: spacing(3) },
  chip: { paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.xs, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  tags: { flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(2) },
  title: { fontSize: font.md, fontWeight: '800', color: colors.text },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2), lineHeight: 21 },
  date: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(3) },
});
