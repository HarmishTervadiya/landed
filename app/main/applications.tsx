import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function applications() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <View className="">
        <Text className="">applications</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
