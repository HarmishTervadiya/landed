import { Tables, TablesInsert, TablesUpdate, Enums } from './supabase.types';

export type Application = Tables<'applications'>;
export type Event = Tables<'events'>;
export type Note = Tables<'notes'>;
export type Profile = Tables<'profiles'>;

export type ApplicationInsert = TablesInsert<'applications'>;
export type EventInsert = TablesInsert<'events'>;
export type NoteInsert = TablesInsert<'notes'>;
export type ProfileInsert = TablesInsert<'profiles'>;

export type ApplicationUpdate = TablesUpdate<'applications'>;
export type EventUpdate = TablesUpdate<'events'>;
export type NoteUpdate = TablesUpdate<'notes'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type AppStatus = Enums<'app_status'>;
export type EventStatus = Enums<'event_status'>;
export type EventType = Enums<'event_type'>;

export interface ApplicationFormProps {
  initialValues?: Partial<ApplicationInsert>;
  onSubmit: (data: Partial<ApplicationInsert>) => void;
  loading?: boolean;
}
