import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Note } from '@/types';

interface NoteItemProps {
  note: Note;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const NoteItem = ({ note, onUpdate, onDelete }: NoteItemProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);

  const handleSave = () => {
    if (!draft.trim()) return;
    onUpdate(note.id, draft.trim());
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Remove this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(note.id) },
    ]);
  };

  return (
    <View className="border-primary/10 mb-2 rounded-xl border bg-panel p-4">
      {editing ? (
        <>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            autoFocus
            className="text-text mb-3 min-h-[60px] text-sm leading-5"
          />
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 items-center rounded-lg bg-primary py-2">
              <Text className="text-xs font-bold text-background">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDraft(note.content);
                setEditing(false);
              }}
              className="border-primary/20 flex-1 items-center rounded-lg border py-2">
              <Text className="text-text text-xs font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text className="text-text mb-2 text-sm leading-5">{note.content}</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-muted text-xs">
              {new Date(note.created_at ?? '').toLocaleDateString()}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text className="text-xs font-medium text-primary">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Text className="text-xs font-medium text-red-500">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};
