import { ScreenContent } from '@/components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaProvider>
      <ScreenContent title="Home" path="app/index.tsx"></ScreenContent>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
