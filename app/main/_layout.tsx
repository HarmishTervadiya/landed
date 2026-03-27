import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3a312b',
        tabBarInactiveTintColor: '#78716c',
      }}>
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => console.log('[Tabs] Navigating to Dashboard'),
        }}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        listeners={{
          tabPress: () => console.log('[Tabs] Navigating to Applications'),
        }}
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: () => console.log('[Tabs] Navigating to Profile'),
        }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applicationDetail"
        options={{
          href: null,
          title: 'Application Detail',
        }}
      />
    </Tabs>
  );
}
