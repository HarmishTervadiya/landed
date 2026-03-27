import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Application } from '@/types';
import { StatusBadge } from '@/components/application/StatusBadge';

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
}

export const ApplicationCard = ({ application, onPress }: ApplicationCardProps) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const initial = application.company_name?.charAt(0).toUpperCase() ?? '?';

  return (
    <Pressable
      onPress={handlePress}
      className="mb-3 rounded-3xl bg-panel p-4 shadow-sm"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background">
          <Text
            className="text-lg text-primary"
            style={{ fontFamily: 'serif', textAlignVertical: 'center', lineHeight: 24 }}>
            {initial}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base text-primary" style={{ fontFamily: 'serif' }}>
            {application.company_name}
          </Text>
          {application.role_title ? (
            <Text className="mt-0.5 text-sm text-stone-500" numberOfLines={1}>
              {application.role_title}
            </Text>
          ) : null}
        </View>

        {/* Status badge */}
        {application.status ? <StatusBadge status={application.status} /> : null}
      </View>
    </Pressable>
  );
};
