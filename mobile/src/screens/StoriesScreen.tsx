import React from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { assetUrl } from '../lib/assets';
import { Card, EmptyState, ErrorState, Loading, Pill } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

export function StoriesScreen() {
  const { data, loading, refreshing, error, reload, refresh } = useAsync(() => api.stories());

  if (loading && !data) return <Loading label="Loading stories" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const stories = data!.stories;

  if (stories.length === 0) return <EmptyState title="No stories yet" subtitle="Check back soon for folktales and oral histories." />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      {stories.map((s) => {
        const cover = assetUrl(s.image);
        return (
          <Card key={s.id}>
            {cover ? <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" /> : null}
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
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  cover: { width: '100%', height: 160, borderRadius: radius.md, backgroundColor: colors.primaryLight, marginBottom: spacing(3) },
  tags: { flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(2) },
  title: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  summary: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(2), lineHeight: 21 },
  metaRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(3), flexWrap: 'wrap' },
  meta: { fontSize: font.xs, color: colors.textMuted },
});
