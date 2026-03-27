import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApplicationStore } from '@/store/applicationStore';
import { useEventStore } from '@/store/eventStore';
import { useNoteStore } from '@/store/noteStore';
import { useProfileStore } from '@/store/profileStore';
import { ApplicationForm } from '@/components/application/ApplicationForm';
import { EventCard } from '@/components/event/EventCard';
import { NoteItem } from '@/components/notes/NoteItem';
import { NoteComposer } from '@/components/notes/NoteComposer';
import { useAuthStore } from '@/store/authStore';

type Tab = 'details' | 'events' | 'notes';

export default function ApplicationDetailScreen() {
  const { mode, id } = useLocalSearchParams<{ mode: string; id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    selectedApplication,
    loading: appLoading,
    error: appError,
    fetchOne,
    create,
    update,
    remove,
  } = useApplicationStore();
  const { events, loading: eventLoading, fetchAll: fetchEvents, syncStatuses } = useEventStore();
  const {
    notes,
    loading: noteLoading,
    fetchForApplication,
    create: createNote,
    update: updateNote,
    remove: removeNote,
  } = useNoteStore();
  const { profile } = useProfileStore();

  const timezone = profile?.timezone ?? 'UTC';
  const isEdit = mode === 'edit';
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  useEffect(() => {
    async function init() {
      if (isEdit && id) {
        await fetchOne(id);
        await syncStatuses(id);
        await fetchEvents(id);
        await fetchForApplication(id);
      }
      setIsReady(true);
    }
    init();
  }, [mode, id]);

  const handleSubmit = async (formData: any) => {
    if (!user?.id) return;

    if (!isEdit) {
      const result = await create({ ...formData, user_id: user.id });
      if (result.success) router.back();
    } else if (id) {
      const result = await update(id, formData);
      if (result.success) router.back();
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete', 'Are you sure?', [
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
    if (!id) return;
    await createNote({ application_id: id, content });
  };

  const handleNewEvent = () => {
    router.push({ pathname: '/main/eventDetail', params: { mode: 'create', applicationId: id } });
  };

  const handleEditEvent = (eventId: string) => {
    router.push({
      pathname: '/main/eventDetail',
      params: { mode: 'edit', id: eventId, applicationId: id },
    });
  };

  if (!isReady || (isEdit && appLoading && !selectedApplication)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3a312b" />
      </SafeAreaView>
    );
  }

  const initialValues = isEdit && selectedApplication ? selectedApplication : undefined;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-lg font-medium text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text flex-1 px-3 text-xl font-bold" numberOfLines={1}>
          {isEdit ? (selectedApplication?.company_name ?? 'Application') : 'New Application'}
        </Text>
        {isEdit && (
          <TouchableOpacity onPress={handleDelete}>
            <Text className="font-medium text-red-500">Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs — only shown in edit mode */}
      {isEdit && (
        <View className="border-primary/10 flex-row border-b px-4">
          {(['details', 'events', 'notes'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-4 pb-3 ${activeTab === tab ? 'border-b-2 border-primary' : ''}`}>
              <Text
                className={`text-sm font-semibold capitalize ${activeTab === tab ? 'text-primary' : 'text-text-muted'}`}>
                {tab}
                {tab === 'events' && events.length > 0 ? ` (${events.length})` : ''}
                {tab === 'notes' && notes.length > 0 ? ` (${notes.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Error */}
      {appError ? (
        <View className="mx-4 mt-3 rounded-xl bg-red-100 p-4">
          <Text className="text-red-700">{appError}</Text>
        </View>
      ) : null}

      {/* Tab content */}
      {activeTab === 'details' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <ApplicationForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            loading={appLoading}
          />
        </ScrollView>
      )}

      {activeTab === 'events' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <TouchableOpacity
            onPress={handleNewEvent}
            className="mb-4 items-center rounded-xl bg-primary py-3">
            <Text className="font-bold text-background">+ Add Event</Text>
          </TouchableOpacity>

          {eventLoading && events.length === 0 ? (
            <ActivityIndicator color="#3a312b" />
          ) : events.length === 0 ? (
            <Text className="text-text-muted py-8 text-center">No events yet.</Text>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                timezone={timezone}
                onPress={() => handleEditEvent(event.id)}
              />
            ))
          )}
        </ScrollView>
      )}

      {activeTab === 'notes' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <NoteComposer onSubmit={handleAddNote} loading={noteLoading} />
          <View className="mt-4">
            {noteLoading && notes.length === 0 ? (
              <ActivityIndicator color="#3a312b" />
            ) : notes.length === 0 ? (
              <Text className="text-text-muted py-8 text-center">No notes yet.</Text>
            ) : (
              notes.map((note) => (
                <NoteItem key={note.id} note={note} onUpdate={updateNote} onDelete={removeNote} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
