import { supabase } from '@/lib/supabase';
import { Note, NoteInsert, NoteUpdate } from '@/types';

/** All notes for an application (both standalone and event-linked), newest first */
export const fetchNotesByApplication = async (applicationId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('application_id', applicationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/** Notes linked to a specific event */
export const fetchNotesByEvent = async (eventId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('event_id', eventId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const insertNote = async (payload: NoteInsert): Promise<Note> => {
  const { data, error } = await supabase.from('notes').insert(payload).select('*').single();

  if (error) throw error;
  return data;
};

export const updateNote = async (id: string, payload: NoteUpdate): Promise<Note> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const softDeleteNote = async (id: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};
