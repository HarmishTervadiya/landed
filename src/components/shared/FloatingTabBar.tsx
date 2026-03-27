import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HIDDEN_ROUTES = ['applicationDetail', 'eventDetail'];

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Hide the entire bar when a detail screen is active
  const activeRouteName = state.routes[state.index]?.name;
  if (HIDDEN_ROUTES.includes(activeRouteName)) return null;

  return (
    <View
      className="absolute left-6 right-6 flex-row rounded-full bg-white/90 px-2 py-2 shadow-lg"
      style={{ bottom: Math.max(insets.bottom, 24) }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if (HIDDEN_ROUTES.includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        const iconEl = options.tabBarIcon?.({
          focused: isFocused,
          color: isFocused ? '#fdfbf7' : '#a8a29e',
          size: 20,
        });

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            className={`flex-1 items-center justify-center rounded-full py-3 ${
              isFocused ? 'bg-primary' : ''
            }`}>
            {iconEl}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
