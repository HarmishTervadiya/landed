import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

export default function login() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <TouchableOpacity
        onPress={() => router.navigate('main/')}
        className="rounded-xl bg-primary px-6 py-3">
        <Text className="text-lg font-bold text-white">login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({});
