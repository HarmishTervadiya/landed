import { Stack } from 'expo-router';
import { View } from 'react-native';
import '../global.css';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
      <Stack.Screen name="main" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
    </Stack>
  );
}
