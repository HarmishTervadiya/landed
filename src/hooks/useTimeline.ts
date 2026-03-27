import { useMemo } from 'react';
import { useEventStore } from '@/store/eventStore';
import { useNoteStore } from '@/store/noteStore';
import { TimelineItem } from '@/types';

export function useTimeline(_applicationId: string): TimelineItem[] {
  const events = useEventStore((s) => s.events);
  const notes = useNoteStore((s) => s.notes);

  const timeline: TimelineItem[] = useMemo(() => {
    const eventItems = events.map((e) => ({
      kind: 'event' as const,
      data: { ...e, notes: [] },
    }));
    const noteItems = notes
      .filter((n) => n.event_id === null)
      .map((n) => ({ kind: 'note' as const, data: n }));

    return [...eventItems, ...noteItems].sort((a, b) => {
      const tA = a.kind === 'event' ? a.data.event_time : (a.data.created_at ?? '');
      const tB = b.kind === 'event' ? b.data.event_time : (b.data.created_at ?? '');
      return new Date(tA).getTime() - new Date(tB).getTime();
    });
  }, [events, notes]);

  return timeline;
}
