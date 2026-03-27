import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApplicationStore } from '@/store/applicationStore';
import { ApplicationCard } from '@/components/pipeline/ApplicationCard';
import { ApplicationSheet } from '@/components/application/ApplicationSheet';
import { Plus } from 'lucide-react-native';
import { Application, AppStatus } from '@/types';
import { useRouter } from 'expo-router';

type FilterChip = 'All' | AppStatus;
const FILTER_CHIPS: FilterChip[] = ['All', 'Interviewing', 'Applied', 'Wishlist'];

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applications, loading, fetchAll } = useApplicationStore();

  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | undefined>(
    undefined
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'All') return applications;
    return applications.filter((app) => app.status === activeFilter);
  }, [applications, activeFilter]);

  const handleCardPress = useCallback(
    (application: Application) => {
      router.push({ pathname: '/applicationDetail', params: { id: application.id } });
    },
    [router]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background px-6 pt-12">
      <View className="mb-8 flex-row items-end justify-between">
        <View>
          <Text className="font-serif text-4xl tracking-tight text-[#3A312B]">pipeline.</Text>
          <Text className="mt-2 text-sm text-stone-500">Track your progress</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedApplication(undefined);
            setSheetOpen(true);
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3A312B] shadow-md">
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View className="mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2 px-2 pb-4">
          <View className="flex-row gap-2">
            {FILTER_CHIPS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-full border px-5 py-2 shadow-sm ${
                    isActive ? 'border-[#3A312B] bg-[#3A312B]' : 'border-stone-100 bg-white'
                  }`}>
                  <Text
                    className={`text-sm font-medium ${isActive ? 'text-white' : 'text-stone-600'}`}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {loading && applications.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-24">
          <ActivityIndicator size="large" color="#3A312B" />
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ApplicationCard application={item} onPress={() => handleCardPress(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-center text-lg text-stone-400">
                {activeFilter === 'All'
                  ? 'No applications yet. Tap + to add one.'
                  : `No ${activeFilter} applications.`}
              </Text>
            </View>
          }
        />
      )}

      <ApplicationSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        application={selectedApplication}
      />
    </SafeAreaView>
  );
}
