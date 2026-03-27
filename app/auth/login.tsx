import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React from 'react';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const { signInWithGoogle, loading, error } = useAuthStore();

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      console.error('Sign-in failed:', result.error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={loading}
        className="rounded-xl bg-primary px-6 py-3">
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-lg font-bold text-white">Sign in with Google</Text>
        )}
      </TouchableOpacity>

      {error && <Text className="mt-4 text-red-500">{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({});
