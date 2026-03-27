import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApplicationStore } from '@/store/applicationStore';
import { useEventStore } from '@/store/eventStore';
import { useNoteStore } from '@/store/noteStore';
import { useProfileStore } from '@/store/profileStore';
import { ApplicationSheet } from '@/components/application/ApplicationSheet';
import { EventSheet } from '@/components/event/EventSheet';
import { TimelineItemRow } from '@/components/timeline/TimelineItemRow';
import { useTimeline } from '@/hooks/useTimeline';
import {
  ArrowLeft,
  Link as LinkIcon,
  Calendar,
  Send,
  PencilIcon,
  FileText,
} from 'lucide-react-native';
import { getJDSignedUrl } from '@/lib/storage';
import { TimelineItem } from '@/types';

const keyExtractor = (item: TimelineItem) => `${item.kind}-${item.data.id}`;

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { selectedApplication, loading: appLoading, fetchOne } = useApplicationStore();
  const { loading: eventLoading, fetchAll: fetchEvents, syncStatuses } = useEventStore();
  const { loading: noteLoading, fetchForApplication, create: createNote } = useNoteStore();
  const { profile } = useProfileStore();

  const timezone = profile?.timezone ?? 'UTC';
  const timeline = useTimeline(id ?? '');
  const insets = useSafeAreaInsets();

  // Height of the absolute bottom bar: p-2 (8px) * 2 + icon (40px) + border = ~60px
  // Add safe area bottom + 24px (bottom-6) + extra breathing room
  const bottomBarHeight = 60 + Math.max(insets.bottom, 16) + 24 + 16;

  const [appSheetOpen, setAppSheetOpen] = React.useState(false);
  const [eventSheetOpen, setEventSheetOpen] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');

  useEffect(() => {
    if (!id) return;
    fetchOne(id);
    syncStatuses(id);
    fetchEvents(id);
    fetchForApplication(id);
  }, [id, fetchOne, syncStatuses, fetchEvents, fetchForApplication]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAppSheetClose = useCallback(() => {
    setAppSheetOpen(false);
    if (!selectedApplication) {
      router.back();
    }
  }, [selectedApplication, router]);

  const handleViewJD = useCallback(async () => {
    if (selectedApplication?.jd_storage_path) {
      const url = await getJDSignedUrl(selectedApplication.jd_storage_path);
      if (url) Linking.openURL(url);
    } else if (selectedApplication?.jd_url) {
      Linking.openURL(selectedApplication.jd_url);
    }
  }, [selectedApplication?.jd_storage_path, selectedApplication?.jd_url]);

  const handleNoteSubmit = useCallback(() => {
    if (!id || !noteText.trim()) return;
    createNote({ application_id: id, content: noteText.trim() });
    setNoteText('');
  }, [id, noteText, createNote]);

  const renderItem = useCallback(
    ({ item }: { item: TimelineItem }) => {
      return (
        <View className="px-6">
          <TimelineItemRow
            item={item}
            timezone={timezone}
            onPressEvent={
              item.kind === 'event'
                ? () => router.push({ pathname: '/eventDetail', params: { id: item.data.id } })
                : undefined
            }
          />
        </View>
      );
    },
    [timezone, router]
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Wishlist':
        return 'bg-rose-100 text-rose-800';
      case 'Applied':
        return 'bg-stone-200 text-stone-700';
      case 'Interviewing':
        return 'bg-amber-100 text-amber-800';
      case 'Offered':
      case 'Offer_Accepted':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-stone-100 text-stone-500';
    }
  };

  const app = selectedApplication;
  const initial = app?.company_name?.charAt(0).toUpperCase() ?? '?';
  const statusColorClass = getStatusColor(app?.status ?? null);
  const [statusBg = 'bg-stone-100', statusText = 'text-stone-500'] = statusColorClass.split(' ');

  if (appLoading && !app) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FDFBF7]">
        <ActivityIndicator size="large" color="#3A312B" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#FDFBF7]">
        {/* Timeline List (Entire Screen is vertically scrollable) */}
        <FlatList
          data={timeline}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: bottomBarHeight }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          extraData={timeline.length}
          ListHeaderComponent={
            <>
              {/* Top Header Card */}
              <View className="z-20 mb-8 rounded-b-[3rem] border-b border-stone-50 bg-white px-6 pb-6 pt-6 shadow-sm">
                <View className="mb-6 flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={handleBack}
                    className="-ml-2 rounded-full bg-stone-50 p-2">
                    <ArrowLeft size={20} color="#3A312B" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAppSheetOpen(true)} className="-mr-2 p-2">
                    <PencilIcon size={20} color="#A8A29E" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-5">
                  <View className="h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[#F6EFE8]">
                    <Text
                      className="font-serif text-4xl text-[#3A312B]"
                      style={{ textAlignVertical: 'center', lineHeight: 48 }}>
                      {initial}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-serif text-3xl leading-tight text-[#3A312B]"
                      numberOfLines={2}>
                      {app?.company_name || '—'}
                    </Text>
                    <Text className="mt-1 text-stone-500" numberOfLines={1}>
                      {app?.role_title || 'Unknown Role'}
                    </Text>
                  </View>
                </View>

                <View className="mt-6 flex-row items-center gap-3">
                  <View
                    className={`flex-row items-center rounded-full border border-white px-2 py-2 ${statusBg}`}>
                    <View
                      className={`h-2 w-2 self-center rounded-full ${statusText.replace('text-', 'bg-')}`}
                    />
                    <Text className={`text-sm font-medium ${statusText}`}>
                      {app?.status?.replace('_', ' ') ?? ''}
                    </Text>
                  </View>
                  {(app?.jd_storage_path || app?.jd_url) && (
                    <TouchableOpacity
                      onPress={handleViewJD}
                      className="flex-row items-center gap-2 rounded-full bg-stone-100 px-4 py-2">
                      <FileText size={14} color="#44403C" />
                      <Text className="text-sm font-medium text-stone-700">View JD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text className="mb-8 px-6 text-center text-sm font-medium uppercase tracking-wider text-stone-400">
                Your Journey
              </Text>
            </>
          }
          ListEmptyComponent={
            !eventLoading && !noteLoading ? (
              <Text className="px-6 text-center text-stone-400">No events or notes yet.</Text>
            ) : (
              <ActivityIndicator color="#3A312B" />
            )
          }
        />

        {/* Bottom Input Area */}
        <View
          className="absolute left-6 right-6 z-30"
          style={{ bottom: Math.max(insets.bottom, 16) + 8 }}>
          <View className="flex-row items-center gap-2 rounded-[2rem] border border-stone-100 bg-white p-2 shadow-lg">
            <TouchableOpacity
              onPress={() => setEventSheetOpen(true)}
              className="h-10 w-10 items-center justify-center rounded-full bg-stone-50">
              <Calendar size={18} color="#78716C" />
            </TouchableOpacity>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a note or memory..."
              placeholderTextColor="#A8A29E"
              className="flex-1 border-0 bg-transparent px-2 text-sm text-[#3A312B]"
              onSubmitEditing={handleNoteSubmit}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleNoteSubmit}
              disabled={!noteText.trim()}
              className={`h-10 w-10 items-center justify-center rounded-full pl-1 shadow-md ${!noteText.trim() ? 'bg-stone-300' : 'bg-[#3A312B]'}`}>
              <Send size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ApplicationSheet
        isOpen={appSheetOpen}
        onClose={handleAppSheetClose}
        application={app ?? undefined}
      />
      {id ? (
        <EventSheet
          isOpen={eventSheetOpen}
          onClose={() => setEventSheetOpen(false)}
          applicationId={id}
          timezone={timezone}
        />
      ) : null}
    </>
  );
}
