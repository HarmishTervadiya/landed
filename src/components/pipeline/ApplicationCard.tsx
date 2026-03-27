import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Application } from '@/types';

export function ApplicationCard({
  application,
  onPress,
}: {
  application: Application;
  onPress: () => void;
}) {
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
      case 'Rejected':
      case 'Offer_Declined':
      case 'Ghosted':
        return 'bg-stone-100 text-stone-500';
      default:
        return 'bg-stone-100 text-stone-500';
    }
  };

  const statusColorClass = getStatusColor(application.status);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-[2rem] border border-stone-50 bg-white p-4 shadow-sm">
      <View className="mr-4 h-14 w-14 items-center justify-center rounded-[1.2rem] border border-stone-100 bg-[#FDFBF7]">
        <Text className="font-serif text-xl text-[#3A312B]">
          {application.company_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="mr-2 flex-1">
        <Text className="font-serif text-lg text-[#3A312B]" numberOfLines={1}>
          {application.company_name}
        </Text>
        <Text className="text-sm text-stone-500" numberOfLines={1}>
          {application.role_title || 'Unknown Role'}
        </Text>
      </View>
      <View className={`rounded-full px-3 py-1.5 ${statusColorClass.split(' ')[0]}`}>
        <Text className={`text-xs font-medium ${statusColorClass.split(' ')[1]}`}>
          {application.status?.replace('_', ' ') ?? ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
