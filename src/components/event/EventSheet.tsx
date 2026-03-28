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
import { EventType } from '@/types';
import { getDeviceTimezone, localToUTC } from '@/utils/timezone';

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
  const [titleError, setTitleError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();

  const validate = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('Event title is required.');
      valid = false;
    } else if (title.trim().length < 2) {
      setTitleError('Must be at least 2 characters.');
      valid = false;
    } else setTitleError(undefined);

    if (eventDate <= new Date()) {
      setDateError('Event must be scheduled in the future.');
      valid = false;
    } else setDateError(undefined);

    return valid;
  };

  // Reset form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setEventType('Interview');
      setTitle('');
      setEventDate(new Date());
      setTitleError(undefined);
      setDateError(undefined);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    // The picker gives a local Date. Build local ISO from its components,
    // then convert to UTC using the device timezone so storage is correct.
    const tz = getDeviceTimezone();
    const pad = (n: number) => String(n).padStart(2, '0');
    const localIso = `${eventDate.getFullYear()}-${pad(eventDate.getMonth() + 1)}-${pad(eventDate.getDate())}T${pad(eventDate.getHours())}:${pad(eventDate.getMinutes())}:00`;
    const utcIso = localToUTC(localIso, tz);

    const result = await create({
      application_id: applicationId,
      type: eventType,
      title: title.trim(),
      event_time: utcIso,
    });

    if (result.success) onClose();
  }, [title, eventDate, eventType, applicationId, create, onClose]);

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
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: eventType === type ? '#FFFFFF' : 'transparent',
                    borderWidth: eventType === type ? 1 : 0,
                    borderColor: '#E7E5E4',
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: eventType === type ? '500' : '400',
                      color: eventType === type ? '#3A312B' : '#78716C',
                    }}>
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
            Event Title <Text className="text-red-400">*</Text>
          </Text>
          <TextInput
            className={`rounded-[1rem] border bg-white px-4 py-3.5 text-[#3A312B] ${titleError ? 'border-red-300' : 'border-stone-200'}`}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (titleError) setTitleError(undefined);
            }}
            placeholder="e.g. Technical Round 1"
            placeholderTextColor="#A8A29E"
            returnKeyType="done"
          />
          {titleError ? <Text className="mt-1 text-xs text-red-500">{titleError}</Text> : null}
        </View>

        {/* Date & time picker */}
        <View className="mb-8">
          <DateTimePicker
            value={eventDate}
            onChange={(d) => {
              setEventDate(d);
              if (dateError) setDateError(undefined);
            }}
          />
          {dateError ? <Text className="mt-2 text-xs text-red-500">{dateError}</Text> : null}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.8}
          style={{
            marginBottom: 16,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            paddingVertical: 16,
            backgroundColor: isSubmitDisabled ? 'rgba(232,170,66,0.5)' : '#E8AA42',
          }}>
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
