import React, { useCallback, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, Send } from 'lucide-react-native';
import { accentHex } from '@/constants/color';

interface NoteComposerProps {
  onSubmit: (text: string) => void;
  onCalendarPress: () => void;
}

export const NoteComposer = ({ onSubmit, onCalendarPress }: NoteComposerProps) => {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  }, [text, onSubmit]);

  const handleCalendarPress = useCallback(() => {
    onCalendarPress();
  }, [onCalendarPress]);

  const canSend = text.trim().length > 0;

  return (
    <View className="border-primary/10 flex-row items-center gap-2 border-t bg-background px-3 py-2">
      <TouchableOpacity onPress={handleCalendarPress} className="p-2">
        <Calendar size={22} color="#a8a29e" />
      </TouchableOpacity>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Add a note…"
        placeholderTextColor="#a8a29e"
        className="flex-1 text-sm leading-5 text-primary"
        multiline
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!canSend}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{
          backgroundColor: canSend ? accentHex : 'transparent',
          opacity: canSend ? 1 : 0.4,
        }}>
        <Send size={18} color={canSend ? '#fff' : '#a8a29e'} />
      </TouchableOpacity>
    </View>
  );
};
