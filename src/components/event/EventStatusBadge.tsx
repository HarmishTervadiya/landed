import React from 'react';
import { View, Text } from 'react-native';
import { EventStatus } from '@/types';

const styles: Record<EventStatus, { bg: string; text: string }> = {
  Upcoming: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Done: { bg: 'bg-green-100', text: 'text-green-700' },
  Overdue: { bg: 'bg-red-100', text: 'text-red-700' },
};

export const EventStatusBadge = ({ status }: { status: EventStatus }) => {
  const s = styles[status] ?? styles.Upcoming;
  return (
    <View className={`self-start justify-center items-center rounded px-2 py-1 ${s.bg}`}>
      <Text className={`text-xs font-medium text-center ${s.text}`}>{status}</Text>
    </View>
  );
};
