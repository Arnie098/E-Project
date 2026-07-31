import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AppStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const items: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  to: keyof AppStackParamList;
}[] = [
  { label: 'Vocabulary Dictionary', description: 'Bagobo Tagabawa words, meanings & pronunciation', icon: 'book', to: 'Vocabulary' },
  { label: 'Storytelling Archive', description: 'Folktales, legends and oral histories', icon: 'library', to: 'Stories' },
  { label: 'Multimedia Gallery', description: 'Audio, video and photo heritage', icon: 'play-circle', to: 'Media' },
  { label: 'Cultural Repository', description: 'Artifacts, crafts and traditions', icon: 'albums', to: 'Repository' },
  { label: 'Events', description: 'Upcoming and past community events', icon: 'calendar', to: 'Events' },
  { label: 'Community', description: 'Your contributions and feedback', icon: 'people', to: 'Community' },
  { label: 'My Progress', description: 'Track your learning journey', icon: 'stats-chart', to: 'Progress' },
];

export function ExploreScreen() {
  const nav = useNavigation<Nav>();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {items.map((item) => (
        <TouchableOpacity key={item.to} activeOpacity={0.85} style={styles.row} onPress={() => nav.navigate(item.to as any)}>
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(4), gap: spacing(3) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(4),
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: font.md, fontWeight: '700', color: colors.text },
  description: { fontSize: font.xs, color: colors.textMuted, marginTop: spacing(1) },
});
