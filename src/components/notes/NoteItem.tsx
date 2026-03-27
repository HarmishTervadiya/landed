import React from 'react';
import { View, Text } from 'react-native';
import { Note } from '@/types';
import { formatDate } from '@/utils/timezone';

interface TimelineNoteItemProps {
  note: Note;
}

export const NoteItem = ({ note }: TimelineNoteItemProps) => {
  return (
    <View className="mb-3 items-end">
      <View className="max-w-[85%] rounded-3xl bg-panel px-4 py-3">
        <Text className="mb-1 text-sm leading-5 text-primary">{note.content}</Text>
        <Text className="text-xs text-stone-400">{formatDate(note.created_at ?? '', 'UTC')}</Text>
      </View>
    </View>
  );
};
