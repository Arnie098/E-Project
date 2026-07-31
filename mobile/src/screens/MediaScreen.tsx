import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, EmptyState, ErrorState, Loading, Pill } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

function mediaIcon(type: string | null): keyof typeof Ionicons.glyphMap {
  if (type === 'video') return 'videocam';
  if (type === 'audio') return 'musical-notes';
  return 'image';
}

export function MediaScreen() {
  const { data, loading, error, reload } = useAsync(() => api.media());

  if (loading && !data) return <Loading label="Loading media" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const media = data!.media;

  if (media.length === 0) return <EmptyState title="No media yet" subtitle="Audio, video and photos will appear here." />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      {media.map((m) => (
        <Card key={m.id}>
          <View style={styles.row}>
            <View style={styles.thumb}>
              <Ionicons name={mediaIcon(m.type)} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{m.title}</Text>
              <View style={styles.metaRow}>
                {m.category ? <Pill label={m.category} tone="muted" /> : null}
                {m.duration ? <Text style={styles.meta}>{m.duration}</Text> : null}
                {m.views != null ? <Text style={styles.meta}>{m.views} views</Text> : null}
              </View>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(2), flexWrap: 'wrap' },
  meta: { fontSize: font.xs, color: colors.textMuted },
});
