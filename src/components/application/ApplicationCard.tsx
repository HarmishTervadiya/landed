import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Application } from '@/types';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
  onDelete: () => void;
}

export const ApplicationCard = ({ application, onPress, onDelete }: ApplicationCardProps) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Application',
      `Are you sure you want to delete your application to ${application.company_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleDelete}
      className="border-primary/10 mb-3 rounded-xl border bg-panel p-4 shadow-sm">
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-text text-lg font-bold">{application.company_name}</Text>
          {application.role_title && (
            <Text className="text-text-muted mt-1">{application.role_title}</Text>
          )}
        </View>
        {application.status && <StatusBadge status={application.status} />}
      </View>

      <View className="border-primary/5 mt-2 flex-row items-center justify-between border-t pt-2">
        <Text className="text-text-muted text-xs">
          {new Date(application.created_at || '').toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};
