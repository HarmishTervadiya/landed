import React from 'react';
import { View, Text } from 'react-native';

export function StatCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'highlight' | 'default';
}) {
  if (variant === 'highlight') {
    return (
      <View className="relative flex aspect-square flex-col justify-between overflow-hidden rounded-[2rem] bg-[#F6EFE8] p-6">
        <View className="absolute right-0 top-0 -mr-10 -mt-10 h-24 w-24 rounded-full bg-white/40" />
        <Text className="font-medium leading-tight text-stone-600">
          {label.split(' ').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < label.split(' ').length - 1 ? '\n' : ''}
            </React.Fragment>
          ))}
        </Text>
        <Text className="font-serif text-5xl text-[#3A312B]">{value}</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1 flex-col justify-center rounded-[1.5rem] border border-stone-50 bg-white p-5 shadow-sm">
      <Text className="mb-1 text-sm text-stone-500">{label}</Text>
      <Text className="font-serif text-2xl text-[#3A312B]">{value}</Text>
    </View>
  );
}
