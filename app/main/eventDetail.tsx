import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore } from '@/store/eventStore';
import { useNoteStore } from '@/store/noteStore';
import { useProfileStore } from '@/store/profileStore';
import { NoteItem } from '@/components/notes/NoteItem';
import { NoteComposer } from '@/components/notes/NoteComposer';
import { DateTimePicker } from '@/components/shared/DateTimePicker';
import { EventType, EventStatus } from '@/types';
import { toUTC, toLocalIso } from '@/utils/timezone';

const EVENT_TYPES: EventType[] = ['Interview', 'Assessment', 'Follow_Up', 'Deadline', 'Start_Date'];
const EVENT_STATUSES: EventStatus[] = ['Upcoming', 'Done', 'Overdue'];

export default function EventDetailScreen() {
  const { mode, id, applicationId } = useLocalSearchParams<{
    mode: string;
    id: string;
    applicationId: string;
  }>();
  const router = useRouter();

  const {
    selectedEvent,
    loading: eventLoading,
    error: eventError,
    fetchOne,
    create,
    update,
    remove,
    clearSelected,
  } = useEventStore();
  const {
    eventNotes,
    loading: noteLoading,
    fetchForEvent,
    create: createNote,
    update: updateNote,
    remove: removeNote,
  } = useNoteStore();
  const { profile } = useProfileStore();

  const timezone = profile?.timezone ?? 'UTC';
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Interview');
  const [status, setStatus] = useState<EventStatus>('Upcoming');
  const [eventDate, setEventDate] = useState<Date>(new Date());

  useEffect(() => {
    if (isEdit && id) {
      fetchOne(id);
      fetchForEvent(id);
    }
    return () => clearSelected();
  }, []);

  // Populate form when event loads in edit mode
  useEffect(() => {
    if (!selectedEvent) return;
    setTitle(selectedEvent.title);
    setType(selectedEvent.type);
    setStatus(selectedEvent.status ?? 'Upcoming');
    // Convert stored UTC → local Date object for the picker
    const localIso = toLocalIso(selectedEvent.event_time, timezone);
    setEventDate(new Date(localIso));
  }, [selectedEvent, timezone]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing fields', 'Please enter a title.');
      return;
    }

    // Convert the local Date the picker gave us → UTC for storage
    const utcTime = toUTC(eventDate.toISOString().replace('Z', ''), timezone);

    if (isEdit && id) {
      const result = await update(id, { title: title.trim(), type, status, event_time: utcTime });
      if (result.success) router.back();
    } else {
      if (!applicationId) return;
      const result = await create({
        application_id: applicationId,
        title: title.trim(),
        type,
        status,
        event_time: utcTime,
      });
      if (result.success) router.back();
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete Event', 'This will also remove all linked notes.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await remove(id);
          if (result.success) router.back();
        },
      },
    ]);
  };

  const handleAddNote = async (content: string) => {
    if (!applicationId && !selectedEvent?.application_id) return;
    await createNote({
      application_id: applicationId ?? selectedEvent!.application_id,
      event_id: isEdit ? id : undefined,
      content,
    });
  };

  if (isEdit && eventLoading && !selectedEvent) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3a312b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-lg font-medium text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text text-xl font-bold">{isEdit ? 'Edit Event' : 'New Event'}</Text>
        {isEdit ? (
          <TouchableOpacity onPress={handleDelete}>
            <Text className="font-medium text-red-500">Delete</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-16" />
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {eventError ? (
          <View className="mb-4 rounded-xl bg-red-100 p-4">
            <Text className="text-red-700">{eventError}</Text>
          </View>
        ) : null}

        {/* Form card */}
        <View className="border-primary/10 mb-4 rounded-xl border bg-panel p-4">
          {/* Title */}
          <Text className="text-text-muted mb-1 text-xs font-medium uppercase tracking-wide">
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Technical Interview Round 1"
            placeholderTextColor="#a8a29e"
            className="text-text mb-4 border-b border-stone-200 pb-2 text-base"
          />

          {/* Type chips */}
          <Text className="text-text-muted mb-2 text-xs font-medium uppercase tracking-wide">
            Type
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                className={`rounded-full px-3 py-1 ${
                  type === t ? 'bg-primary' : 'border-primary/20 border bg-panel'
                }`}>
                <Text
                  className={`text-xs font-medium ${type === t ? 'text-background' : 'text-text'}`}>
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status chips */}
          <Text className="text-text-muted mb-2 text-xs font-medium uppercase tracking-wide">
            Status
          </Text>
          <View className="mb-4 flex-row gap-2">
            {EVENT_STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                className={`rounded-full px-3 py-1 ${
                  status === s ? 'bg-primary' : 'border-primary/20 border bg-panel'
                }`}>
                <Text
                  className={`text-xs font-medium ${
                    status === s ? 'text-background' : 'text-text'
                  }`}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date & time picker */}
          <DateTimePicker
            label="Date & Time"
            value={eventDate}
            onChange={setEventDate}
            hint={`Displayed in your timezone: ${timezone}`}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={eventLoading}
          className="mb-6 items-center rounded-xl bg-primary py-4">
          {eventLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-background">
              {isEdit ? 'Save Changes' : 'Create Event'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Notes — only in edit mode */}
        {isEdit && (
          <>
            <Text className="text-text mb-3 text-lg font-bold">Event Notes</Text>
            <NoteComposer onSubmit={handleAddNote} loading={noteLoading} />
            <View className="mt-3">
              {eventNotes.length === 0 ? (
                <Text className="text-text-muted py-4 text-center text-sm">
                  No notes for this event yet.
                </Text>
              ) : (
                eventNotes.map((note) => (
                  <NoteItem key={note.id} note={note} onUpdate={updateNote} onDelete={removeNote} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
