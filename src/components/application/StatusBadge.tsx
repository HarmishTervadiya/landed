import React from 'react';
import { View, Text } from 'react-native';
import { AppStatus } from '@/types';

const getStatusStyles = (status: AppStatus) => {
  switch (status) {
    case 'Wishlist':
      return { bg: 'bg-stone-200', text: 'text-stone-600' };
    case 'Applied':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'Interviewing':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'Offered':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Offer_Accepted':
      return { bg: 'bg-green-200', text: 'text-green-800' };
    case 'Offer_Declined':
      return { bg: 'bg-stone-300', text: 'text-stone-800' };
    case 'Rejected':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'Ghosted':
      return { bg: 'bg-stone-200', text: 'text-stone-500' };
    default:
      return { bg: 'bg-stone-200', text: 'text-stone-600' };
  }
};

export const StatusBadge = ({ status }: { status: AppStatus }) => {
  const styles = getStatusStyles(status);

  return (
    <View className={`w-auto self-start rounded px-2 py-1 ${styles.bg}`}>
      <Text className={`text-xs font-medium ${styles.text}`}>{status.replace('_', ' ')}</Text>
    </View>
  );
};
