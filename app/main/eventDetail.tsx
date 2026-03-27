import React, { useCallback, useEffect, useState } from 'react';
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
import { EventType } from '@/types';
import { toUTC, toLocalIso } from '@/utils/timezone';

const EVENT_TYPES: EventType[] = ['Interview', 'Assessment', 'Follow_Up', 'Deadline', 'Start_Date'];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    selectedEvent,
    loading: eventLoading,
    error: eventError,
    fetchOne,
    update,
    remove,
    clearSelected,
  } = useEventStore();

  const { eventNotes, fetchForEvent, create: createNote } = useNoteStore();
  const { profile } = useProfileStore();
  const timezone = profile?.timezone ?? 'UTC';

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Interview');
  const [eventDate, setEventDate] = useState<Date>(new Date());

  useEffect(() => {
    if (id) {
      fetchOne(id);
      fetchForEvent(id);
    }
    return () => clearSelected();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setTitle(selectedEvent.title);
    setType(selectedEvent.type);
    const localIso = toLocalIso(selectedEvent.event_time, timezone);
    setEventDate(new Date(localIso));
  }, [selectedEvent, timezone]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/main/');
    }
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Missing fields', 'Please enter a title.');
      return;
    }
    if (!id) return;
    const utcTime = toUTC(eventDate.toISOString().replace('Z', ''), timezone);
    const result = await update(id, { title: title.trim(), type, event_time: utcTime });
    if (result.success) handleBack();
  }, [title, type, eventDate, timezone, id, update, handleBack]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    Alert.alert('Delete Event', 'This will also remove all linked notes.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await remove(id);
          if (result.success) handleBack();
        },
      },
    ]);
  }, [id, remove, handleBack, router]);

  const handleAddNote = useCallback(
    async (content: string) => {
      if (!selectedEvent) return;
      await createNote({
        application_id: selectedEvent.application_id,
        event_id: id,
        content,
      });
    },
    [selectedEvent, id, createNote]
  );

  if (eventLoading && !selectedEvent) {
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
        <TouchableOpacity onPress={handleBack}>
          <Text className="text-lg font-medium text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-primary">Edit Event</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text className="font-medium text-red-500">Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {eventError ? (
          <View className="mb-4 rounded-xl bg-red-100 p-4">
            <Text className="text-red-700">{eventError}</Text>
          </View>
        ) : null}

        {/* Form card */}
        <View className="mb-4 rounded-3xl bg-panel p-4">
          <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Technical Interview Round 1"
            placeholderTextColor="#a8a29e"
            className="mb-4 border-b border-stone-200 pb-2 text-base text-primary"
          />

          <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
            Type
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  backgroundColor: type === t ? '#3A312B' : 'transparent',
                  borderWidth: 1,
                  borderColor: type === t ? '#3A312B' : 'rgba(58,49,43,0.2)',
                }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: type === t ? '#FDFBF7' : '#3A312B' }}>
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <DateTimePicker
            value={eventDate}
            onChange={setEventDate}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={eventLoading}
          className="mb-6 items-center rounded-full bg-primary py-4">
          {eventLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-background">Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Event notes */}
        <Text className="mb-3 text-lg text-primary" style={{ fontFamily: 'serif' }}>
          Event Notes
        </Text>
        <NoteComposer onSubmit={handleAddNote} onCalendarPress={() => {}} />
        <View className="mt-3">
          {eventNotes.length === 0 ? (
            <Text className="py-4 text-center text-sm text-stone-400">
              No notes for this event yet.
            </Text>
          ) : (
            eventNotes.map((note) => <NoteItem key={note.id} note={note} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
