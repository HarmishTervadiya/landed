import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AuthSession, AuthUser } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { config } from '@/config';
import { Platform } from 'react-native';
import { ActionResult, BaseState, createSafeAction } from '@/utils/safeAction';
import * as Linking from 'expo-linking';

export interface AuthState extends BaseState {
  session: AuthSession | null;
  user: AuthUser | null;
  initialized: boolean;

  initialize: () => Promise<ActionResult<void>>;
  signInWithGoogle: () => Promise<ActionResult<void>>;
  signOut: () => Promise<ActionResult<void>>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const safeAction = createSafeAction(set);

  return {
    session: null,
    user: null,
    loading: false,
    error: null,
    initialized: false,

    initialize: () =>
      safeAction(async () => {
        console.log('Initializing session...');
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        supabase.auth.onAuthStateChange((_event, newSession) => {
          if (newSession?.user?.id !== get().session?.user?.id) {
            set({ session: newSession, user: newSession?.user ?? null });
            console.log('Auth state changed');
          }
        });

        if (!session) {
          set({ session: null, user: null, initialized: true });
          console.log('No session found, initialization complete');
          return;
        }

        set({ session, user: session.user, initialized: true });
        console.log('Session restored');
      }),

    signInWithGoogle: () =>
      safeAction(async () => {
        const isExpoGo = Constants.appOwnership === 'expo';

        const redirectUrl = config.AUTH_REDIRECT_URI ?? Linking.createURL('auth/callback');

        console.log('Redirect URL:', redirectUrl);
        console.log('Running in:', isExpoGo ? 'Expo Go' : 'Standalone Build');

        try {
          await WebBrowser.warmUpAsync();
        } catch (e) {
          console.error('Browser warmup failed:', e);
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No OAuth URL returned');

        if (Platform.OS === 'android') {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        console.log('Opening browser for OAuth...');
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
          showInRecents: true,
        });

        console.log('Browser result type:', result.type);

        if (result.type === 'success' && result.url) {
          console.log('Success! Parsing URL...');

          const url = result.url;
          const hashParams = new URLSearchParams(
            url.includes('#') ? url.split('#')[1] : url.split('?')[1] || ''
          );

          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');
          const code = hashParams.get('code');

          if (code) {
            console.log('Exchanging code for session...');
            const { data: sessionData, error: sessionError } =
              await supabase.auth.exchangeCodeForSession(code);

            if (sessionError) throw sessionError;

            if (sessionData?.session) {
              console.log('Session obtained via code exchange');
              set({ session: sessionData.session, user: sessionData.user });
            }
          } else if (access_token && refresh_token) {
            console.log('Setting session with tokens...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) throw sessionError;

            if (sessionData?.session) {
              console.log('Session set with tokens');
              set({ session: sessionData.session, user: sessionData.user });
            }
          } else {
            console.log('No tokens in URL, trying getSession fallback...');
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session) {
              console.log('Fallback session found');
              set({ session, user: session.user });
            } else {
              throw new Error('Invalid OAuth response: No code or tokens found.');
            }
          }

          console.log('Authentication complete!');
        } else if (result.type === 'cancel') {
          throw new Error('Google Sign-In cancelled');
        } else {
          throw new Error('Google Sign-In failed');
        }

        try {
          await WebBrowser.coolDownAsync();
        } catch (e) {
          console.error('Browser cooldown failed:', e);
        }
      }),

    signOut: () =>
      safeAction(async () => {
        console.log('Signing out...');
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        console.log('Signed out successfully');
        set({ session: null, user: null, initialized: false });
      }),
  };
});
