import { supabase } from '@/lib/supabase';
import { Profile, ProfileUpdate } from '@/types';

export const fetchProfile = async (): Promise<Profile | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error) throw error;
  return data;
};

export const upsertProfile = async (payload: ProfileUpdate): Promise<Profile> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...payload, id: user.id })
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const updatePushToken = async (token: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', user.id);

  if (error) throw error;
};

export const updateTimezone = async (timezone: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase.from('profiles').update({ timezone }).eq('id', user.id);

  if (error) throw error;
};
