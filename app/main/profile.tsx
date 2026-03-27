import React from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { user, signOut, loading, error } = useAuthStore();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background p-4">
      <Text className="text-text mb-6 text-3xl font-bold">Profile</Text>

      <View className="border-primary/10 mb-6 rounded-xl border bg-panel p-6 shadow-sm">
        <Text className="text-text-muted mb-1 text-sm">Email</Text>
        <Text className="text-text mb-4 text-lg font-medium">{user?.email}</Text>

        <Text className="text-text-muted mb-1 text-sm">User ID</Text>
        <Text className="text-text font-mono text-xs">{user?.id}</Text>
      </View>

      {error ? <Text className="mb-4 text-red-500">{error}</Text> : null}

      <TouchableOpacity
        onPress={() => signOut()}
        disabled={loading}
        className="bg-primary/10 border-primary/20 flex-row items-center justify-center rounded-xl border p-4">
        {loading ? (
          <ActivityIndicator color="#3a312b" />
        ) : (
          <Text className="text-lg font-bold text-primary">Sign Out</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
