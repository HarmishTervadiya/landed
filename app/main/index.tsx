import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApplicationStore } from '@/store/applicationStore';
import { useEventStore } from '@/store/eventStore';
import { extractHostname } from '@/utils/url';
import { formatEventTime, getDeviceTimezone } from '@/utils/timezone';
import { useProfileStore } from '@/store/profileStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { Plus, Link as LinkIcon, ChevronRight, Calendar, AlertCircle } from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter();
  const applications = useApplicationStore((s) => s.applications);
  const fetchAllApplications = useApplicationStore((s) => s.fetchAll);
  const appLoading = useApplicationStore((s) => s.loading);
  const createApplication = useApplicationStore((s) => s.create);
  const upcomingEvents = useEventStore((s) => s.upcomingEvents);
  const fetchUpcoming = useEventStore((s) => s.fetchUpcoming);
  const timezone = useProfileStore((s) => s.profile?.timezone ?? getDeviceTimezone());

  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchAllApplications(), fetchUpcoming()]);
    setRefreshing(false);
  }, [fetchAllApplications, fetchUpcoming]);

  useEffect(() => {
    fetchAllApplications();
    fetchUpcoming();
  }, [fetchAllApplications, fetchUpcoming]);

  const stats = useMemo(
    () => ({
      active: applications.filter(
        (a) => !['Rejected', 'Ghosted', 'Offer_Declined'].includes(a.status ?? '')
      ).length,
      interviews: applications.filter((a) => a.status === 'Interviewing').length,
      offers: applications.filter((a) => a.status === 'Offered' || a.status === 'Offer_Accepted')
        .length,
    }),
    [applications]
  );

  const futureUpcomingEvents = useMemo(
    () => upcomingEvents.filter((e) => new Date(e.event_time) > new Date()),
    [upcomingEvents]
  );

  const wishlistApps = useMemo(
    () =>
      applications
        .filter((a) => a.status === 'Wishlist')
        .sort(
          (a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()
        )
        .slice(0, 5),
    [applications]
  );

  const handleCapture = useCallback(async () => {
    let trimmed = url.trim();
    if (!trimmed) {
      setUrlError('Please paste a job link to continue.');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) trimmed = `https://${trimmed}`;
    if (!/^https?:\/\/.+\..+/.test(trimmed)) {
      setUrlError('Enter a valid job link (e.g. https://company.com/jobs/…)');
      return;
    }
    setUrlError(null);
    const hostname = extractHostname(trimmed);
    setCapturing(true);
    await createApplication({
      company_name: hostname ?? trimmed,
      jd_url: trimmed,
      status: 'Wishlist',
    } as Parameters<typeof createApplication>[0]);
    setCapturing(false);
    setUrl('');
  }, [url, createApplication]);

  const showStatsLoader = appLoading && applications.length === 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3A312B" />
        }>
        {/* Header */}
        <View className="mb-8 pl-1">
          <Text className="mb-1 text-sm font-medium uppercase tracking-wider text-stone-500">
            Your Tracker
          </Text>
          <Text className="font-serif text-4xl tracking-tight text-[#3A312B]">landed.</Text>
        </View>

        {/* URL capture */}
        <View className="relative mb-10">
          <View className="absolute left-4 top-4 z-10">
            <LinkIcon size={18} color="#A8A29E" />
          </View>
          <TextInput
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              if (urlError) setUrlError(null);
            }}
            onSubmitEditing={handleCapture}
            placeholder="Paste a job link to save..."
            placeholderTextColor="#A8A29E"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            className="w-full rounded-[2rem] bg-white py-4 pl-12 pr-14 text-[#3A312B] shadow-sm"
          />
          <TouchableOpacity
            onPress={handleCapture}
            disabled={capturing || !url.trim()}
            className="absolute right-2 top-2 z-10 h-10 w-10 items-center justify-center rounded-full border border-stone-100 bg-[#FDFBF7] shadow-sm">
            {capturing ? (
              <ActivityIndicator color="#E8AA42" size="small" />
            ) : (
              <Plus size={20} color="#E8AA42" />
            )}
          </TouchableOpacity>
          {urlError && <Text className="ml-2 mt-2 text-xs text-red-500">{urlError}</Text>}
        </View>

        {/* Stats */}
        <View className="mb-10 flex-row gap-4">
          <View className="w-1/2">
            <StatCard label="Active Applications" value={stats.active} variant="highlight" />
          </View>
          <View className="flex flex-1 flex-col gap-4">
            {showStatsLoader ? (
              <View className="flex-1 items-center justify-center rounded-[1.5rem] border border-stone-50 bg-white">
                <ActivityIndicator color="#3A312B" />
              </View>
            ) : (
              <>
                <StatCard label="Interviews" value={stats.interviews} />
                <StatCard label="Offers" value={stats.offers} />
              </>
            )}
          </View>
        </View>

        {/* ── Upcoming Events ─────────────────────────────── */}
        <Text className="mb-4 font-serif text-xl text-[#3A312B]">upcoming</Text>
        {futureUpcomingEvents.length === 0 ? (
          <View className="mb-8 rounded-[2rem] border border-stone-50 bg-white p-6 shadow-sm">
            <Text className="text-center text-stone-400">No upcoming events.</Text>
          </View>
        ) : (
          <View className="mb-8">
            {futureUpcomingEvents.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/eventDetail', params: { id: item.id } })}
                className="mb-3 rounded-[2rem] bg-white p-2 shadow-sm">
                <View className="flex-row items-center gap-4 rounded-[1.5rem] p-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F6EFE8]">
                    <Calendar size={20} color="#E8AA42" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-serif text-lg font-medium text-[#3A312B]">
                      {item.title ?? ''}
                    </Text>
                    <Text className="text-sm text-stone-500">
                      {item.type?.replace('_', ' ') ?? ''} •{' '}
                      {formatEventTime(item.event_time, timezone)}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#D6D3D1" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Action Required ──────────────────────────────── */}
        {wishlistApps.length > 0 && (
          <>
            <View className="mb-4 flex-row items-center gap-2">
              <Text className="font-serif text-xl text-[#3A312B]">action required</Text>
              <View className="rounded-full bg-rose-100 px-2 py-0.5">
                <Text className="text-xs font-medium text-rose-600">{wishlistApps.length}</Text>
              </View>
            </View>
            {wishlistApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({ pathname: '/applicationDetail', params: { id: app.id } })
                }
                className="mb-3 rounded-[2rem] bg-white p-2 shadow-sm">
                <View className="flex-row items-center gap-4 rounded-[1.5rem] p-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                    <Text className="font-serif text-xl text-rose-400">
                      {app.company_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-serif text-base font-medium text-[#3A312B]"
                      numberOfLines={1}>
                      {app.company_name}
                    </Text>
                    <Text className="text-xs text-stone-400">
                      {app.role_title || 'Unknown Role'} · Saved, not applied
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#D6D3D1" />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
