import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Briefcase, User } from 'lucide-react-native';
import FloatingTabBar from '@/components/shared/FloatingTabBar';

export default function _layout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => console.log('[Tabs] Navigating to Dashboard'),
        }}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        listeners={{
          tabPress: () => console.log('[Tabs] Navigating to Applications'),
        }}
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: () => console.log('[Tabs] Navigating to Profile'),
        }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applicationDetail"
        options={{
          href: null,
          title: 'Application Detail',
        }}
      />
      <Tabs.Screen
        name="eventDetail"
        options={{
          href: null,
          title: 'Event Detail',
        }}
      />
    </Tabs>
  );
}
