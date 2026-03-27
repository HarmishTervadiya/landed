import { create } from 'zustand';
import { BaseState, ActionResult, createSafeAction } from '@/utils/safeAction';
import { Note, NoteInsert } from '@/types';
import {
  fetchNotesByApplication,
  fetchNotesByEvent,
  insertNote,
  updateNote,
  softDeleteNote,
} from '@/lib/notes';

export interface NoteState extends BaseState {
  /** All notes for the current application (standalone + event-linked) */
  notes: Note[];
  /** Notes scoped to a specific event */
  eventNotes: Note[];

  fetchForApplication: (applicationId: string) => Promise<ActionResult<void>>;
  fetchForEvent: (eventId: string) => Promise<ActionResult<void>>;
  create: (data: NoteInsert) => Promise<ActionResult<void>>;
  update: (id: string, content: string) => Promise<ActionResult<void>>;
  remove: (id: string) => Promise<ActionResult<void>>;
}

export const useNoteStore = create<NoteState>((set, get) => {
  const safeAction = createSafeAction(set);

  return {
    notes: [],
    eventNotes: [],
    loading: false,
    error: null,

    fetchForApplication: (applicationId: string) =>
      safeAction(async () => {
        const data = await fetchNotesByApplication(applicationId);
        set({ notes: data });
      }),

    fetchForEvent: (eventId: string) =>
      safeAction(async () => {
        const data = await fetchNotesByEvent(eventId);
        set({ eventNotes: data });
      }),

    create: (data: NoteInsert) =>
      safeAction(async () => {
        const newNote = await insertNote(data);
        const { notes, eventNotes } = get();

        // Add to app-level notes list
        set({ notes: [newNote, ...notes] });

        // If it's event-linked, also prepend to eventNotes
        if (newNote.event_id) {
          set({ eventNotes: [newNote, ...eventNotes] });
        }
      }),

    update: (id: string, content: string) =>
      safeAction(async () => {
        const updated = await updateNote(id, { content });
        const { notes, eventNotes } = get();
        set({
          notes: notes.map((n) => (n.id === id ? updated : n)),
          eventNotes: eventNotes.map((n) => (n.id === id ? updated : n)),
        });
      }),

    remove: (id: string) =>
      safeAction(async () => {
        await softDeleteNote(id);
        const { notes, eventNotes } = get();
        set({
          notes: notes.filter((n) => n.id !== id),
          eventNotes: eventNotes.filter((n) => n.id !== id),
        });
      }),
  };
});
