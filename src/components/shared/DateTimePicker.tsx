import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock, X } from 'lucide-react-native';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value);

  const displayDate = value
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '.'); // Format to dd.mm.yyyy

  const displayTime = value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (!date) return;

    const merged = new Date(date);
    merged.setHours(value.getHours(), value.getMinutes(), 0, 0);
    setTempDate(merged);

    if (Platform.OS === 'android') {
      onChange(merged);
    }
  };

  const handleTimeChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (!date) return;

    const merged = new Date(value);
    merged.setHours(date.getHours(), date.getMinutes(), 0, 0);
    setTempDate(merged);

    if (Platform.OS === 'android') {
      onChange(merged);
    }
  };

  const renderPickerModal = (
    mode: 'date' | 'time',
    visible: boolean,
    setVisible: (v: boolean) => void,
    handleChange: any
  ) => {
    if (!visible) return null;

    if (Platform.OS === 'android') {
      return (
        <RNDateTimePicker value={tempDate} mode={mode} display="default" onChange={handleChange} />
      );
    }

    // iOS Modal Wrapper for Spinners
    return (
      <Modal transparent visible={visible} animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-[2.5rem] bg-white p-6 pb-12 shadow-2xl">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="font-serif text-xl text-[#3A312B]">
                {mode === 'date' ? 'Select Date' : 'Select Time'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  onChange(tempDate);
                  setVisible(false);
                }}
                className="h-8 w-8 items-center justify-center rounded-full bg-stone-100">
                <Text className="w-full text-center text-xs font-medium text-[#3A312B]">OK</Text>
              </TouchableOpacity>
            </View>
            <RNDateTimePicker
              value={tempDate}
              mode={mode}
              display="spinner"
              onChange={handleChange}
              textColor="#3A312B"
              style={{ height: 200 }}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View className="flex-row gap-4">
      <View className="flex-1">
        <Text className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-500">
          Date
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setTempDate(value);
            setShowDate(true);
          }}
          className="flex-row items-center justify-between rounded-[1rem] border border-stone-200 bg-white px-4 py-3.5">
          <Text className="text-sm font-medium text-[#3A312B]">{displayDate}</Text>
          <Calendar size={16} color="#A8A29E" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Text className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-500">
          Time
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setTempDate(value);
            setShowTime(true);
          }}
          className="flex-row items-center justify-between rounded-[1rem] border border-stone-200 bg-white px-4 py-3.5">
          <Text className="text-sm font-medium text-[#3A312B]">{displayTime}</Text>
          <Clock size={16} color="#A8A29E" />
        </TouchableOpacity>
      </View>

      {renderPickerModal('date', showDate, setShowDate, handleDateChange)}
      {renderPickerModal('time', showTime, setShowTime, handleTimeChange)}
    </View>
  );
};
