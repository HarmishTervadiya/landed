import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { DateTimePicker } from '@/components/shared/DateTimePicker';
import { useEventStore } from '@/store/eventStore';
import { toUTC } from '@/utils/timezone';
import { EventType } from '@/types';

interface EventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  timezone: string;
}

const EVENT_TYPES: EventType[] = ['Interview', 'Assessment', 'Follow_Up', 'Deadline', 'Start_Date'];

export const EventSheet = ({ isOpen, onClose, applicationId, timezone }: EventSheetProps) => {
  const { create, loading, error } = useEventStore();

  const [eventType, setEventType] = useState<EventType>('Interview');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState<Date>(new Date());

  // Reset form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setEventType('Interview');
      setTitle('');
      setEventDate(new Date());
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;

    // Convert picker Date to local ISO string (strip the Z), then convert to UTC
    const localIso = eventDate.toISOString().replace('Z', '');
    const utcIso = toUTC(localIso, timezone);

    const result = await create({
      application_id: applicationId,
      type: eventType,
      title: title.trim(),
      event_time: utcIso,
    });

    if (result.success) onClose();
  }, [title, eventDate, eventType, applicationId, timezone, create, onClose]);

  const isSubmitDisabled = !title.trim() || loading;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Schedule Event" snapHeight={580}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Error message */}
        {error ? (
          <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        ) : null}

        {/* Event type segmented control */}
        <View className="mb-6 rounded-full border border-stone-200/60 bg-stone-50 p-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-1">
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setEventType(type)}
                  activeOpacity={0.7}
                  className={`rounded-full px-4 py-2 ${eventType === type ? 'border border-stone-100 bg-white shadow-sm' : 'bg-transparent'}`}>
                  <Text
                    className={`text-sm ${eventType === type ? 'font-medium text-[#3A312B]' : 'text-stone-500'}`}>
                    {type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Title input */}
        <View className="mb-6">
          <Text className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-500">
            Event Title
          </Text>
          <TextInput
            className="rounded-[1rem] border border-stone-200 bg-white px-4 py-3.5 text-[#3A312B]"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Technical Round 1"
            placeholderTextColor="#A8A29E"
            returnKeyType="done"
          />
        </View>

        {/* Date & time picker */}
        <View className="mb-8">
          <DateTimePicker value={eventDate} onChange={setEventDate} />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.8}
          className={`mb-4 w-full items-center justify-center rounded-[1.5rem] py-4 shadow-md ${isSubmitDisabled ? 'bg-[#E8AA42]/50' : 'bg-[#E8AA42]'}`}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-semibold text-white">Add to Timeline</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
};
