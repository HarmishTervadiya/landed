import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

function parseAuthParams(url: string) {
  const raw = url.split('#')[1] ?? url.split('?')[1] ?? '';
  const params = new URLSearchParams(raw);
  return {
    code: params.get('code'),
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    error: params.get('error'),
  };
}

async function resolveSession(url: string): Promise<boolean> {
  const { code, access_token, refresh_token, error } = parseAuthParams(url);

  if (error) return false;

  if (code) {
    const { error: err } = await supabase.auth.exchangeCodeForSession(code);
    return !err;
  }

  if (access_token && refresh_token) {
    const { error: err } = await supabase.auth.setSession({ access_token, refresh_token });
    return !err;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [handled, setHandled] = useState(false);
  const url = Linking.useURL();

  useEffect(() => {
    if (!url || handled) return;

    let cancelled = false;

    resolveSession(url).then((success) => {
      if (cancelled) return;
      setHandled(true);
      router.replace(success ? '/main/' : '/auth/login');
    });

    return () => { cancelled = true; };
  }, [url, handled, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}