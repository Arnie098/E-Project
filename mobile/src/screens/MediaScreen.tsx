import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { api } from '../api/endpoints';
import type { MediaItem } from '../api/types';
import { useAsync } from '../hooks/useAsync';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { assetUrl } from '../lib/assets';
import { Card, EmptyState, ErrorState, Loading, Pill } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

function mediaIcon(type: string | null): keyof typeof Ionicons.glyphMap {
  if (type === 'video') return 'videocam';
  if (type === 'audio') return 'musical-notes';
  return 'image';
}

export function MediaScreen() {
  const { data, loading, refreshing, error, reload, refresh } = useAsync(() => api.media());
  const { play, stop, playingKey, loadingKey, error: audioError } = useAudioPlayer();
  const [viewer, setViewer] = useState<{ item: MediaItem; url: string } | null>(null);

  if (loading && !data) return <Loading label="Loading media" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const media = data!.media;

  if (media.length === 0) return <EmptyState title="No media yet" subtitle="Audio, video and photos will appear here." />;

  const openItem = async (m: MediaItem) => {
    const url = assetUrl(m.file);
    if (!url) return;

    if (m.type === 'audio') {
      await play(`media-${m.id}`, url);
      return;
    }

    // Never leave audio running behind a video.
    await stop();
    setViewer({ item: m, url });
  };

  const closeViewer = () => setViewer(null);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}

        {media.map((m) => {
          const thumb = assetUrl(m.thumbnail);
          const key = `media-${m.id}`;
          const playable = assetUrl(m.file) != null;
          const isPlaying = playingKey === key;
          const isLoading = loadingKey === key;

          let actionIcon: keyof typeof Ionicons.glyphMap = 'play';
          if (m.type === 'audio' && isPlaying) actionIcon = 'pause';
          else if (m.type === 'image') actionIcon = 'expand';

          return (
            <Card key={m.id}>
              <Pressable
                onPress={() => void openItem(m)}
                disabled={!playable}
                style={({ pressed }) => [styles.row, pressed && playable ? styles.rowPressed : null]}
                accessibilityRole="button"
                accessibilityLabel={playable ? `Open ${m.title}` : `${m.title} is not available yet`}
              >
                {thumb ? (
                  <Image source={{ uri: thumb }} style={styles.thumbImage} resizeMode="cover" />
                ) : (
                  <View style={styles.thumb}>
                    <Ionicons name={mediaIcon(m.type)} size={24} color={colors.primary} />
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{m.title}</Text>
                  <View style={styles.metaRow}>
                    {m.category ? <Pill label={m.category} tone="muted" /> : null}
                    {m.duration ? <Text style={styles.meta}>{m.duration}</Text> : null}
                    {m.views != null ? <Text style={styles.meta}>{m.views} views</Text> : null}
                  </View>
                  {!playable ? <Text style={styles.unavailable}>Not uploaded yet</Text> : null}
                </View>

                {playable ? (
                  <View style={styles.action}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons name={actionIcon} size={20} color={colors.primary} />
                    )}
                  </View>
                ) : null}
              </Pressable>
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={viewer != null} animationType="slide" onRequestClose={closeViewer}>
        <View style={styles.viewer}>
          <View style={styles.viewerBar}>
            <Text style={styles.viewerTitle} numberOfLines={1}>
              {viewer?.item.title}
            </Text>
            <Pressable onPress={closeViewer} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
              <Ionicons name="close" size={26} color={colors.white} />
            </Pressable>
          </View>

          {viewer ? (
            viewer.item.type === 'video' ? (
              <VideoPlayer url={viewer.url} />
            ) : (
              <Image source={{ uri: viewer.url }} style={styles.viewerMedia} resizeMode="contain" />
            )
          ) : null}
        </View>
      </Modal>
    </>
  );
}

function VideoPlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url, (instance) => {
    instance.play();
  });

  return <VideoView player={player} style={styles.viewerMedia} nativeControls contentFit="contain" />;
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  rowPressed: { opacity: 0.6 },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  thumbImage: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.primaryLight },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(2), flexWrap: 'wrap' },
  meta: { fontSize: font.xs, color: colors.textMuted },
  unavailable: { fontSize: font.xs, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing(1) },
  action: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  audioError: { fontSize: font.sm, color: colors.danger, backgroundColor: colors.dangerBg, padding: spacing(3), borderRadius: radius.md, marginBottom: spacing(3) },
  viewer: { flex: 1, backgroundColor: '#000000' },
  viewerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3), padding: spacing(4), paddingTop: spacing(12) },
  viewerTitle: { flex: 1, color: colors.white, fontSize: font.md, fontWeight: '700' },
  viewerMedia: { flex: 1, width: '100%' },
});
