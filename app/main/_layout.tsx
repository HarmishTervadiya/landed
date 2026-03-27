import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
        }}
      />
      <Tabs.Screen
        name="applicationDetail"
        options={{
          title: 'Application Detail',
        }}
      />
    </Tabs>
  );
}
