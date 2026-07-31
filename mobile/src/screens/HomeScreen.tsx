import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { Card, ErrorState, Loading, ProgressBar } from '../components/ui';
import type { AppStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const quickLinks: { label: string; icon: keyof typeof Ionicons.glyphMap; to: keyof AppStackParamList }[] = [
  { label: 'Vocabulary', icon: 'book-outline', to: 'Vocabulary' },
  { label: 'Stories', icon: 'library-outline', to: 'Stories' },
  { label: 'Media', icon: 'play-circle-outline', to: 'Media' },
  { label: 'Events', icon: 'calendar-outline', to: 'Events' },
  { label: 'Repository', icon: 'albums-outline', to: 'Repository' },
  { label: 'Progress', icon: 'stats-chart-outline', to: 'Progress' },
];

export function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.dashboard());

  if (loading && !data) return <Loading label="Loading your dashboard" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  const d = data!;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
    >
      <Text style={styles.greeting}>Kamusta, {d.firstName || user?.name}!</Text>
      <Text style={styles.subGreeting}>Continue preserving Bagobo Tagabawa heritage.</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{d.stats.modulesCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{d.stats.modulesTotal}</Text>
          <Text style={styles.statLabel}>Total modules</Text>
        </View>
      </View>

      {d.announcement && (d.announcement.title || d.announcement.body) ? (
        <Card style={styles.announcement}>
          <Text style={styles.announcementTag}>ANNOUNCEMENT</Text>
          {d.announcement.title ? <Text style={styles.announcementTitle}>{d.announcement.title}</Text> : null}
          {d.announcement.body ? <Text style={styles.announcementBody}>{d.announcement.body}</Text> : null}
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>Quick access</Text>
      <View style={styles.grid}>
        {quickLinks.map((link) => (
          <TouchableOpacity
            key={link.to}
            style={styles.tile}
            activeOpacity={0.85}
            onPress={() => nav.navigate(link.to as any)}
          >
            <Ionicons name={link.icon} size={26} color={colors.primary} />
            <Text style={styles.tileLabel}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Continue learning</Text>
      {d.continueLearning.length === 0 ? (
        <Card>
          <Text style={styles.muted}>You have no lessons in progress. Head to Learning Modules to begin.</Text>
        </Card>
      ) : (
        d.continueLearning.map((m) => (
          <TouchableOpacity key={m.id} activeOpacity={0.85} onPress={() => nav.navigate('ModuleDetail', { id: m.id, title: m.title })}>
            <Card>
              <Text style={styles.moduleTitle}>{m.title}</Text>
              <View style={styles.progressRow}>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={m.progress} />
                </View>
                <Text style={styles.progressPct}>{m.progress}%</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Upcoming events</Text>
      {d.events.length === 0 ? (
        <Card>
          <Text style={styles.muted}>No upcoming events right now.</Text>
        </Card>
      ) : (
        d.events.map((e) => (
          <Card key={e.id}>
            <Text style={styles.moduleTitle}>{e.title}</Text>
            <Text style={styles.muted}>{e.when}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4) },
  greeting: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  subGreeting: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(1), marginBottom: spacing(4) },
  statsRow: { flexDirection: 'row', gap: spacing(3), marginBottom: spacing(4) },
  statCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing(4),
  },
  statNumber: { color: colors.white, fontSize: font.xxl, fontWeight: '800' },
  statLabel: { color: colors.primaryLight, fontSize: font.sm, marginTop: spacing(1) },
  announcement: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  announcementTag: { fontSize: font.xs, fontWeight: '800', color: colors.accent, letterSpacing: 1 },
  announcementTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginTop: spacing(1) },
  announcementBody: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing(1) },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginTop: spacing(3), marginBottom: spacing(3) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), marginBottom: spacing(2) },
  tile: {
    width: '31%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing(4),
    alignItems: 'center',
    gap: spacing(2),
  },
  tileLabel: { fontSize: font.xs, color: colors.text, fontWeight: '600' },
  moduleTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginTop: spacing(3) },
  progressPct: { fontSize: font.sm, fontWeight: '700', color: colors.primary, width: 44, textAlign: 'right' },
  muted: { fontSize: font.sm, color: colors.textMuted },
});
