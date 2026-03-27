import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApplicationStore } from '@/store/applicationStore';
import { ApplicationForm } from '@/components/ApplicationForm';
import { useAuthStore } from '@/store/authStore';

export default function ApplicationDetailScreen() {
  const { mode, id } = useLocalSearchParams<{ mode: string; id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const { selectedApplication, loading, error, fetchOne, create, update, remove } =
    useApplicationStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      if (mode === 'edit' && id) {
        await fetchOne(id);
      }
      setIsReady(true);
    }
    init();
  }, [mode, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (formData: any) => {
    if (!user?.id) return;

    if (mode === 'create') {
      const result = await create({ ...formData, user_id: user.id });
      if (result.success) {
        router.back();
      }
    } else if (mode === 'edit' && id) {
      const result = await update(id, formData);
      if (result.success) {
        router.back();
      }
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
          if (result.success) {
            router.back();
          }
        },
      },
    ]);
  };

  if (!isReady || (mode === 'edit' && loading && !selectedApplication)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3a312b" />
      </SafeAreaView>
    );
  }

  const initialValues = mode === 'edit' && selectedApplication ? selectedApplication : undefined;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background px-4">
      <View className="mb-2 flex-row items-center py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-lg font-medium text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text flex-1 text-2xl font-bold">
          {mode === 'create' ? 'New Application' : 'Edit Application'}
        </Text>
        {mode === 'edit' && (
          <TouchableOpacity onPress={handleDelete}>
            <Text className="font-medium text-red-500">Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View className="mb-4 rounded-xl bg-red-100 p-4">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : null}

      <ApplicationForm initialValues={initialValues} onSubmit={handleSubmit} loading={loading} />
    </SafeAreaView>
  );
}
