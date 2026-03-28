import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, User, CheckCircle2 } from 'lucide-react-native';
import { TimelineItem } from '@/types';
import { formatEventTime } from '@/utils/timezone';

function TimelineItemRowInner({
  item,
  timezone,
  onPressEvent,
}: {
  item: TimelineItem;
  timezone: string;
  onPressEvent?: () => void;
}) {
  const isNote = item.kind === 'note';
  const isEvent = item.kind === 'event';

  // Date/time formatting helpers — format is "Sat, Mar 28, 4:05 PM", split on last comma
  const getDateString = () => {
    const raw = isEvent
      ? formatEventTime(item.data.event_time, timezone)
      : formatEventTime(item.data.created_at || new Date().toISOString(), timezone);
    return raw.substring(0, raw.lastIndexOf(',')).trim();
  };

  const getTimeString = () => {
    const raw = isEvent
      ? formatEventTime(item.data.event_time, timezone)
      : formatEventTime(item.data.created_at || new Date().toISOString(), timezone);
    return raw.substring(raw.lastIndexOf(',') + 1).trim();
  };

  const isPastEvent = isEvent && item.data.status === 'Done';

  const dateStr = getDateString();
  const timeStr = getTimeString();

  const innerContent = (
    <View
      className={`${isNote ? 'bg-[#F6EFE8]' : 'border border-stone-100 bg-white'} rounded-[1.5rem] p-5 shadow-sm`}>
      {isEvent && (
        <Text className="mb-1 font-serif text-lg text-[#3A312B]">{item.data.title ?? ''}</Text>
      )}
      <Text className={`text-sm leading-relaxed ${isNote ? 'text-[#4A3F35]' : 'text-[#3A312B]'}`}>
        {isNote ? (item.data.content ?? '') : 'Event scheduled.'}
      </Text>
      <View className="mt-3 flex-row items-center gap-2">
        <Text className={`text-xs font-medium ${isNote ? 'text-stone-500' : 'text-stone-400'}`}>
          {dateStr ?? ''} • {timeStr ?? ''}
        </Text>
      </View>
    </View>
  );

  return (
    <View className={`mb-6 flex-row gap-4 ${isNote ? 'flex-row-reverse' : ''}`}>
      <View className="mt-1 items-center">
        {isEvent ? (
          <View
            className={`h-8 w-8 items-center justify-center rounded-full shadow-md ${isPastEvent ? 'bg-stone-200' : 'bg-[#E8AA42]'}`}>
            {isPastEvent ? (
              <CheckCircle2 size={16} color="#78716C" />
            ) : (
              <Calendar size={16} color="#FFF" />
            )}
          </View>
        ) : (
          <View className="h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm">
            <User size={16} color="#A8A29E" />
          </View>
        )}
      </View>

      {isEvent && onPressEvent ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onPressEvent} style={{ flex: 1 }}>
          {innerContent}
        </TouchableOpacity>
      ) : (
        <View style={{ flex: 1 }}>{innerContent}</View>
      )}
    </View>
  );
}

export const TimelineItemRow = React.memo(TimelineItemRowInner);
