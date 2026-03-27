import { supabase } from '@/lib/supabase';
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase.types';

export const fetchApplications = async (): Promise<Tables<'applications'>[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchApplicationById = async (id: string): Promise<Tables<'applications'> | null> => {
  const { data, error } = await supabase.from('applications').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
};

export const insertApplication = async (
  payload: TablesInsert<'applications'>
): Promise<Tables<'applications'>> => {
  const { data, error } = await supabase.from('applications').insert(payload).select('*').single();

  if (error) throw error;
  return data;
};

export const updateApplication = async (
  id: string,
  payload: TablesUpdate<'applications'>
): Promise<Tables<'applications'>> => {
  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const softDeleteApplication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('applications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};
