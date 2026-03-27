import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Event } from '@/types';
import { EventStatusBadge } from '@/components/event/EventStatusBadge';
import { formatEventTime } from '@/utils/timezone';

interface EventCardProps {
  event: Event;
  timezone: string;
  onPress: () => void;
}

export const EventCard = ({ event, timezone, onPress }: EventCardProps) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const isUpcoming = event.status === 'Upcoming';
  const dotClass = isUpcoming ? 'bg-accent' : 'bg-stone-300';

  return (
    <TouchableOpacity onPress={handlePress} className="mb-3 flex-row items-center gap-3">
      {/* Accent / stone dot */}
      <View className={`h-3 w-3 rounded-full ${dotClass}`} />

      {/* Card */}
      <View className="flex-1 rounded-3xl bg-panel px-4 py-3">
        <Text className="text-base text-primary" style={{ fontFamily: 'serif' }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="mt-0.5 text-xs text-stone-500">{event.type.replace('_', ' ')}</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-xs text-stone-500">
            {formatEventTime(event.event_time, timezone)}
          </Text>
          {event.status ? <EventStatusBadge status={event.status} /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
