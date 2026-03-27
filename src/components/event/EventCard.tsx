import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Event } from '@/types';
import { EventStatusBadge } from './EventStatusBadge';
import { formatEventTime } from '@/utils/timezone';

interface EventCardProps {
  event: Event;
  timezone: string;
  onPress: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  Interview: '🎙️',
  Assessment: '📝',
  Follow_Up: '📬',
  Deadline: '⏰',
  Start_Date: '🚀',
};

export const EventCard = ({ event, timezone, onPress }: EventCardProps) => {
  const icon = TYPE_ICONS[event.type] ?? '📅';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="border-primary/10 mb-3 rounded-xl border bg-panel p-4 shadow-sm">
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-text font-semibold">
            {icon} {event.title}
          </Text>
          <Text className="text-text-muted mt-1 text-xs">{event.type.replace('_', ' ')}</Text>
        </View>
        {event.status && <EventStatusBadge status={event.status} />}
      </View>
      <Text className="text-text-muted text-xs">{formatEventTime(event.event_time, timezone)}</Text>
    </TouchableOpacity>
  );
};
