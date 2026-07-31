import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, EmptyState, ErrorState, Loading, Pill } from '../components/ui';
import { colors, font, spacing } from '../theme';

export function StoriesScreen() {
  const { data, loading, error, reload } = useAsync(() => api.stories());

  if (loading && !data) return <Loading label="Loading stories" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const stories = data!.stories;

  if (stories.length === 0) return <EmptyState title="No stories yet" subtitle="Check back soon for folktales and oral histories." />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      {stories.map((s) => (
        <Card key={s.id}>
          <View style={styles.tags}>
            {s.type ? <Pill label={s.type} /> : null}
            {s.categories.map((c) => (
              <Pill key={c} label={c} tone="muted" />
            ))}
          </View>
          <Text style={styles.title}>{s.title}</Text>
          {s.summary ? <Text style={styles.summary}>{s.summary}</Text> : null}
          <View style={styles.metaRow}>
            {s.author ? <Text style={styles.meta}>By {s.author}</Text> : null}
            {s.readTime ? <Text style={styles.meta}>{s.readTime}</Text> : null}
            {s.views != null ? <Text style={styles.meta}>{s.views} views</Text> : null}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  tags: { flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(2) },
  title: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  summary: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2), lineHeight: 21 },
  metaRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(3), flexWrap: 'wrap' },
  meta: { fontSize: font.xs, color: colors.textMuted },
});
