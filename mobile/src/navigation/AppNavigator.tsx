import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from './types';
import { colors } from '../theme';
import { TabNavigator } from './TabNavigator';
import { ModuleDetailScreen } from '../screens/ModuleDetailScreen';
import { VocabularyScreen } from '../screens/VocabularyScreen';
import { StoriesScreen } from '../screens/StoriesScreen';
import { MediaScreen } from '../screens/MediaScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { RepositoryScreen } from '../screens/RepositoryScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProgressScreen } from '../screens/ProgressScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ModuleDetail"
        component={ModuleDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <Stack.Screen name="Vocabulary" component={VocabularyScreen} options={{ title: 'Vocabulary' }} />
      <Stack.Screen name="Stories" component={StoriesScreen} options={{ title: 'Storytelling' }} />
      <Stack.Screen name="Media" component={MediaScreen} options={{ title: 'Multimedia' }} />
      <Stack.Screen name="Events" component={EventsScreen} options={{ title: 'Events' }} />
      <Stack.Screen name="Repository" component={RepositoryScreen} options={{ title: 'Cultural Repository' }} />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'My Progress' }} />
    </Stack.Navigator>
  );
}
