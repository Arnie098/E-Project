import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { assetUrl } from '../lib/assets';
import { Card, EmptyState, ErrorState, Loading, Pill } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

export function VocabularyScreen() {
  const { data, loading, refreshing, error, reload, refresh } = useAsync(() => api.vocabulary());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const { play, playingKey, loadingKey, error: audioError } = useAudioPlayer();

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.words.filter((w) => {
      const matchesQuery =
        !query ||
        w.word.toLowerCase().includes(query.toLowerCase()) ||
        w.meaning.toLowerCase().includes(query.toLowerCase());
      const matchesCat = !category || w.category === category;
      return matchesQuery && matchesCat;
    });
  }, [data, query, category]);

  if (loading && !data) return <Loading label="Loading vocabulary" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search words or meanings"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {d.categories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={!category} onPress={() => setCategory(null)} />
          {d.categories.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      ) : null}

      {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}

      {filtered.length === 0 ? (
        <EmptyState title="No words found" subtitle="Try a different search or category." />
      ) : (
        filtered.map((w) => {
          const key = `word-${w.id}`;
          const playing = playingKey === key;
          const busy = loadingKey === key;
          return (
            <Card key={w.id}>
              <View style={styles.headRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.wordRow}>
                    <Text style={styles.word}>{w.word}</Text>
                    {w.category ? <Pill label={w.category} tone="muted" /> : null}
                  </View>
                  {w.pronunciation ? <Text style={styles.pron}>/{w.pronunciation}/</Text> : null}
                </View>
                {w.audio ? (
                  <TouchableOpacity
                    onPress={() => play(key, assetUrl(w.audio))}
                    style={[styles.playButton, playing && styles.playButtonActive]}
                    accessibilityRole="button"
                    accessibilityLabel={playing ? `Stop pronunciation of ${w.word}` : `Play pronunciation of ${w.word}`}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Ionicons name={playing ? 'stop' : 'volume-high'} size={20} color={colors.white} />
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.meaning}>{w.meaning}</Text>
              {w.example ? <Text style={styles.example}>“{w.example}”</Text> : null}
              {w.speaker ? <Text style={styles.speaker}>Native speaker: {w.speaker}</Text> : null}
            </Card>
          );
        })
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(3),
    marginBottom: spacing(3),
  },
  searchInput: { flex: 1, paddingVertical: spacing(3), fontSize: font.sm, color: colors.text },
  chips: { gap: spacing(2), paddingBottom: spacing(3) },
  chip: { paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.xs, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  audioError: { fontSize: font.xs, color: colors.danger, marginBottom: spacing(3) },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), flexWrap: 'wrap' },
  word: { fontSize: font.lg, fontWeight: '800', color: colors.primary },
  pron: { fontSize: font.sm, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing(1) },
  meaning: { fontSize: font.sm, color: colors.text, marginTop: spacing(2) },
  example: { fontSize: font.sm, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing(2) },
  speaker: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(2) },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: { backgroundColor: colors.danger },
});
