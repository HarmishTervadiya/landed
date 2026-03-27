import React, { useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApplicationStore } from '@/store/applicationStore';
import { ApplicationCard } from '@/components/ApplicationCard';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applications, loading, error, fetchAll, remove } = useApplicationStore();

  useEffect(() => {
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => {
    router.push({ pathname: '/main/applicationDetail', params: { mode: 'create' } });
  };

  const handleEdit = (id: string) => {
    router.push({ pathname: '/main/applicationDetail', params: { mode: 'edit', id } });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background px-4">
      <View className="flex-row items-center justify-between py-4">
        <Text className="text-text text-3xl font-bold">Applications</Text>
        <TouchableOpacity onPress={handleCreate} className="rounded-full bg-primary px-4 py-2">
          <Text className="text-sm font-bold text-background">+ Add</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View className="mb-4 rounded-xl bg-red-100 p-4">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : null}

      {loading && applications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3a312b" />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ApplicationCard
              application={item}
              onPress={() => handleEdit(item.id)}
              onDelete={() => remove(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-text-muted text-center text-lg">No applications yet.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchAll}
        />
      )}
    </SafeAreaView>
  );
}
