import { Tables, TablesInsert, TablesUpdate, Enums, Constants } from './supabase.types';

export { Constants };

// ─── Row types ───────────────────────────────────────────────────────────────
export type Application = Tables<'applications'>;
export type Event = Tables<'events'>;
export type Note = Tables<'notes'>;
export type Profile = Tables<'profiles'>;

// ─── Insert types ─────────────────────────────────────────────────────────────
export type ApplicationInsert = TablesInsert<'applications'>;
export type EventInsert = TablesInsert<'events'>;
export type NoteInsert = TablesInsert<'notes'>;
export type ProfileInsert = TablesInsert<'profiles'>;

// ─── Update types ─────────────────────────────────────────────────────────────
export type ApplicationUpdate = TablesUpdate<'applications'>;
export type EventUpdate = TablesUpdate<'events'>;
export type NoteUpdate = TablesUpdate<'notes'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

// ─── Enums ────────────────────────────────────────────────────────────────────
export type AppStatus = Enums<'app_status'>;
export type EventStatus = Enums<'event_status'>;
export type EventType = Enums<'event_type'>;

// ─── Composite / derived types ────────────────────────────────────────────────
export type EventWithNotes = Event & { notes: Note[] };
export type ApplicationWithEvents = Application & { events: Event[] };

/** A unified timeline item — either an event (with its notes) or a standalone note */
export type TimelineItem = { kind: 'event'; data: EventWithNotes } | { kind: 'note'; data: Note };

// ─── Component prop types ─────────────────────────────────────────────────────
export interface ApplicationFormProps {
  initialValues?: Partial<ApplicationInsert>;
  onSubmit: (data: Partial<ApplicationInsert>) => void;
  loading?: boolean;
}
