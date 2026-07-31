import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { Card, EmptyState, ErrorState, Loading, Pill } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

export function VocabularyScreen() {
  const { data, loading, error, reload } = useAsync(() => api.vocabulary());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

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
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
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

      {filtered.length === 0 ? (
        <EmptyState title="No words found" subtitle="Try a different search or category." />
      ) : (
        filtered.map((w) => (
          <Card key={w.id}>
            <View style={styles.wordRow}>
              <Text style={styles.word}>{w.word}</Text>
              {w.category ? <Pill label={w.category} tone="muted" /> : null}
            </View>
            {w.pronunciation ? <Text style={styles.pron}>/{w.pronunciation}/</Text> : null}
            <Text style={styles.meaning}>{w.meaning}</Text>
            {w.example ? <Text style={styles.example}>“{w.example}”</Text> : null}
            {w.speaker ? <Text style={styles.speaker}>Native speaker: {w.speaker}</Text> : null}
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
  wordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  word: { fontSize: font.lg, fontWeight: '800', color: colors.primary },
  pron: { fontSize: font.sm, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing(1) },
  meaning: { fontSize: font.sm, color: colors.text, marginTop: spacing(2) },
  example: { fontSize: font.sm, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing(2) },
  speaker: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(2) },
});
