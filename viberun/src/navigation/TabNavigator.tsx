import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/map/MapScreen';
import FeedScreen from '../screens/feed/FeedScreen';
import PostScreen from '../screens/post/PostScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#EEE' },
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'マップ' }} />
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'フィード' }} />
      <Tab.Screen name="Post" component={PostScreen} options={{ title: '投稿' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'マイページ' }} />
    </Tab.Navigator>
  );
}
