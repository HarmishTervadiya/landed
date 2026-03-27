import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface NoteComposerProps {
  onSubmit: (content: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export const NoteComposer = ({
  onSubmit,
  loading,
  placeholder = 'Add a note…',
}: NoteComposerProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <View className="border-primary/10 flex-row items-end gap-2 rounded-xl border bg-panel p-3">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#a8a29e"
        multiline
        className="text-text flex-1 text-sm leading-5"
      />
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !text.trim()}
        className="rounded-lg bg-primary px-3 py-2 disabled:opacity-40">
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-xs font-bold text-background">Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
