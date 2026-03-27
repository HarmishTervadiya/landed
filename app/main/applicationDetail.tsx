import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApplicationDetail() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Text>application-detail</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
