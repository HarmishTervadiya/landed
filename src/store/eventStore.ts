import { create } from 'zustand';
import { BaseState, ActionResult, createSafeAction } from '@/utils/safeAction';
import { Event, EventInsert, EventUpdate } from '@/types';
import {
  fetchEventsByApplication,
  fetchUpcomingEvents,
  fetchEventById,
  insertEvent,
  updateEvent,
  softDeleteEvent,
  syncEventStatuses,
} from '@/lib/events';

export interface EventState extends BaseState {
  events: Event[];
  upcomingEvents: Event[];
  selectedEvent: Event | null;

  fetchAll: (applicationId: string) => Promise<ActionResult<void>>;
  fetchUpcoming: () => Promise<ActionResult<void>>;
  fetchOne: (id: string) => Promise<ActionResult<void>>;
  create: (data: EventInsert) => Promise<ActionResult<void>>;
  update: (id: string, data: EventUpdate) => Promise<ActionResult<void>>;
  remove: (id: string) => Promise<ActionResult<void>>;
  syncStatuses: (applicationId: string) => Promise<ActionResult<void>>;
  clearSelected: () => void;
}

export const useEventStore = create<EventState>((set, get) => {
  const safeAction = createSafeAction(set);

  return {
    events: [],
    upcomingEvents: [],
    selectedEvent: null,
    loading: false,
    error: null,

    fetchAll: (applicationId: string) =>
      safeAction(async () => {
        const data = await fetchEventsByApplication(applicationId);
        set({ events: data });
      }),

    fetchUpcoming: () =>
      safeAction(async () => {
        const data = await fetchUpcomingEvents();
        set({ upcomingEvents: data });
      }),

    fetchOne: (id: string) =>
      safeAction(async () => {
        const data = await fetchEventById(id);
        set({ selectedEvent: data });
      }),

    create: (data: EventInsert) =>
      safeAction(async () => {
        const newEvent = await insertEvent(data);
        const { events } = get();
        // Keep sorted by event_time ascending
        const updated = [...events, newEvent].sort(
          (a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime()
        );
        set({ events: updated });
      }),

    update: (id: string, data: EventUpdate) =>
      safeAction(async () => {
        const updatedEvent = await updateEvent(id, data);
        const { events, selectedEvent } = get();
        const updated = events
          .map((e) => (e.id === id ? updatedEvent : e))
          .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime());
        set({
          events: updated,
          selectedEvent: selectedEvent?.id === id ? updatedEvent : selectedEvent,
        });
      }),

    remove: (id: string) =>
      safeAction(async () => {
        await softDeleteEvent(id);
        const { events, selectedEvent } = get();
        set({
          events: events.filter((e) => e.id !== id),
          selectedEvent: selectedEvent?.id === id ? null : selectedEvent,
        });
      }),

    syncStatuses: (applicationId: string) =>
      safeAction(async () => {
        await syncEventStatuses(applicationId);
        // Re-fetch to get updated statuses
        const data = await fetchEventsByApplication(applicationId);
        set({ events: data });
      }),

    clearSelected: () => set({ selectedEvent: null }),
  };
});
