import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import TabNavigator from './TabNavigator';
import SessionDetailScreen from '../screens/map/SessionDetailScreen';
import CreateSessionScreen from '../screens/map/CreateSessionScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { firebaseUser, vibeUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!firebaseUser ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !vibeUser ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="SessionDetail"
            component={SessionDetailScreen}
            options={{ headerShown: true, title: 'セッション詳細', presentation: 'modal' }}
          />
          <Stack.Screen
            name="CreateSession"
            component={CreateSessionScreen}
            options={{ headerShown: true, title: 'セッションを作成', presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
