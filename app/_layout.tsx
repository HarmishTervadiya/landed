import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import '../global.css';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@/store/authStore';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useEffect } from 'react';
import { requestNotificationPermissions } from '@/utils/notifications';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const { initialized, initialize, session } = useAuthStore();
  const { hasCompleted, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    initialize();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!initialized || !rootNavigationState?.key || onboardingLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    console.log(
      '[AuthGuard] Segments:',
      segments,
      'Session:',
      !!session,
      'InAuth:',
      inAuthGroup,
      'HasCompleted:',
      hasCompleted
    );

    if (!session && !hasCompleted && !inOnboarding && !inAuthGroup) {
      console.log('[AuthGuard] Redirecting to onboarding...');
      router.replace('/onboarding');
    } else if (!session && hasCompleted && !inAuthGroup) {
      console.log('[AuthGuard] Redirecting to login...');
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      console.log('[AuthGuard] Redirecting to main...');
      router.replace('/main/');
    } else if (session && inOnboarding) {
      console.log('[AuthGuard] Already logged in, redirecting to main...');
      router.replace('/main/');
    }
  }, [
    initialized,
    session,
    segments,
    rootNavigationState?.key,
    router,
    hasCompleted,
    onboardingLoading,
  ]);

  if (!initialized || onboardingLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent', }, headerShown: false }}>
      <Stack.Screen name="main" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}
