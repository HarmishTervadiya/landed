import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  /** Shown below the label, e.g. the user's timezone string */
  hint?: string;
}

export const DateTimePicker = ({ label, value, onChange, hint }: DateTimePickerProps) => {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // Temp date held while Android modal is open
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  const current = value ?? new Date();

  const displayDate = current.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displayTime = current.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // ─── iOS: inline pickers shown directly ───────────────────────────────────
  if (Platform.OS === 'ios') {
    return (
      <View>
        <Text className="text-text-muted mb-1 text-xs font-medium uppercase tracking-wide">
          {label}
        </Text>
        {hint ? <Text className="text-text-muted mb-2 text-xs">{hint}</Text> : null}

        <View className="border-primary/10 mb-2 rounded-xl border bg-panel">
          <RNDateTimePicker
            value={current}
            mode="date"
            display="spinner"
            onChange={(_: DateTimePickerEvent, date?: Date) => {
              if (!date) return;
              // Preserve existing time when only date changes
              const merged = new Date(date);
              merged.setHours(current.getHours(), current.getMinutes(), 0, 0);
              onChange(merged);
            }}
            textColor="#3a312b"
            style={{ height: 120 }}
          />
        </View>

        <View className="border-primary/10 rounded-xl border bg-panel">
          <RNDateTimePicker
            value={current}
            mode="time"
            display="spinner"
            onChange={(_: DateTimePickerEvent, date?: Date) => {
              if (!date) return;
              // Preserve existing date when only time changes
              const merged = new Date(current);
              merged.setHours(date.getHours(), date.getMinutes(), 0, 0);
              onChange(merged);
            }}
            textColor="#3a312b"
            style={{ height: 120 }}
          />
        </View>
      </View>
    );
  }

  // ─── Android: modal pickers triggered by tapping the display row ──────────
  const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
    if (!date) {
      setShowDate(false);
      return;
    }
    // Merge new date with existing time
    const merged = new Date(date);
    merged.setHours(current.getHours(), current.getMinutes(), 0, 0);
    setTempDate(merged);
    setShowDate(false);
    // Chain into time picker
    setShowTime(true);
  };

  const handleTimeChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowTime(false);
    if (!date) return;
    const merged = new Date(tempDate);
    merged.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(merged);
  };

  return (
    <View>
      <Text className="text-text-muted mb-1 text-xs font-medium uppercase tracking-wide">
        {label}
      </Text>
      {hint ? <Text className="text-text-muted mb-2 text-xs">{hint}</Text> : null}

      <TouchableOpacity
        onPress={() => {
          setTempDate(current);
          setShowDate(true);
        }}
        className="border-primary/10 flex-row items-center justify-between rounded-xl border bg-panel px-4 py-3">
        <View>
          <Text className="text-text text-sm font-medium">{displayDate}</Text>
          <Text className="text-text-muted mt-0.5 text-xs">{displayTime}</Text>
        </View>
        <Text className="text-sm font-medium text-primary">Change</Text>
      </TouchableOpacity>

      {showDate && (
        <RNDateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTime && (
        <RNDateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};
