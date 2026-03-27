import React, { useEffect } from 'react';
import { TouchableWithoutFeedback, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedProps,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  snapHeight?: number;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  snapHeight = 500,
}: BottomSheetProps) => {
  const translateY = useSharedValue(snapHeight);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 350 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(snapHeight, { duration: 250 });
    }
  }, [isOpen, snapHeight, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Always render but use pointerEvents to block interaction when closed
  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 50, elevation: 5 }]}
      pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }, backdropStyle]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[sheetStyle, { height: snapHeight }]}
        className="absolute bottom-0 left-0 right-0 rounded-t-[2.5rem] bg-white pb-12 shadow-2xl">
        {/* Drag handle */}
        <View className="items-center pb-2 pt-4">
          <View className="h-1.5 w-12 rounded-full bg-stone-200" />
        </View>

        {/* Title and Close Button */}
        <View className="flex-row items-center justify-between px-6 pb-6 pt-4">
          <Text className="font-serif text-2xl text-[#3A312B]">{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-100">
            <X size={16} color="#78716C" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">{children}</View>
      </Animated.View>
    </View>
  );
};
