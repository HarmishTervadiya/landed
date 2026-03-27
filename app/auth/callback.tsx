import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

function parseAuthParams(url: string) {
  const fragment = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1] : '';
  const raw = fragment || query || '';
  const params = new URLSearchParams(raw);

  return {
    code: params.get('code'),
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    error: params.get('error'),
    error_description: params.get('error_description'),
  };
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [handled, setHandled] = useState(false);

  const url = Linking.useURL();

  useEffect(() => {
    let cancelled = false;

    async function handle(url: string | null) {
      if (!url || handled || cancelled) return;

      const { code, access_token, refresh_token, error, error_description } = parseAuthParams(url);

      if (error) {
        setHandled(true);
        router.replace('/auth/login');
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError || cancelled) {
          setHandled(true);
          router.replace('/auth/login');
          return;
        }

        setHandled(true);
        router.replace('/main/');
        return;
      }

      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (sessionError || cancelled) {
          setHandled(true);
          router.replace('/auth/login');
          return;
        }

        setHandled(true);
        router.replace('/main/');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHandled(true);

      if (session && !cancelled) {
        router.replace('/main/');
      } else {
        router.replace('/auth/login');
      }
    }

    handle(url);

    return () => {
      cancelled = true;
    };
  }, [handled, url, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
