import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { Loading } from '../components/ui';

export function RootNavigator() {
  const { status } = useAuth();

  return (
    <NavigationContainer>
      {status === 'loading' ? (
        <Loading />
      ) : status === 'authenticated' ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
