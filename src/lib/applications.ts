import { supabase } from '@/lib/supabase';
import { Application, ApplicationInsert, ApplicationUpdate } from '@/types';

export const fetchApplications = async (): Promise<Application[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchApplicationById = async (id: string): Promise<Application | null> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

export const insertApplication = async (payload: ApplicationInsert): Promise<Application> => {
  const { data, error } = await supabase.from('applications').insert(payload).select('*').single();

  if (error) throw error;
  return data;
};

export const updateApplication = async (
  id: string,
  payload: ApplicationUpdate
): Promise<Application> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const softDeleteApplication = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('applications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};
