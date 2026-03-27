import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function dashboard() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-bold text-primary">dashboard</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
