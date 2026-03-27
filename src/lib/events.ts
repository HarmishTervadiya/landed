import { supabase } from '@/lib/supabase';
import { Event, EventInsert, EventUpdate } from '@/types';

export const fetchEventsByApplication = async (applicationId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('application_id', applicationId)
    .is('deleted_at', null)
    .order('event_time', { ascending: true });

  if (error) throw error;
  return data;
};

export const fetchEventById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

export const insertEvent = async (payload: EventInsert): Promise<Event> => {
  const { data, error } = await supabase.from('events').insert(payload).select('*').single();

  if (error) throw error;
  return data;
};

export const updateEvent = async (id: string, payload: EventUpdate): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const softDeleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

/**
 * Batch-marks Upcoming events as Overdue when their event_time has passed.
 * Called on screen mount so statuses stay accurate without a server cron.
 */
export const syncEventStatuses = async (applicationId: string): Promise<void> => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('events')
    .update({ status: 'Overdue' })
    .eq('application_id', applicationId)
    .eq('status', 'Upcoming')
    .lt('event_time', now)
    .is('deleted_at', null);

  if (error) throw error;
};
