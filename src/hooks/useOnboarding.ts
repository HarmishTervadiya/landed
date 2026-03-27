import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = '@landed/onboarding_complete';

interface UseOnboardingResult {
  hasCompleted: boolean;
  markComplete: () => Promise<void>;
  isLoading: boolean;
}

export function useOnboarding(): UseOnboardingResult {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        setHasCompleted(value === 'true');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const markComplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompleted(true);
  }, []);

  return { hasCompleted, markComplete, isLoading };
}
