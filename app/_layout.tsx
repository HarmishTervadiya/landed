import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import '../global.css';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const { initialized, initialize, session } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!initialized || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/main/');
    }
  }, [initialized, session, segments, rootNavigationState?.key]);
  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="main" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}
