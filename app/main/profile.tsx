import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { Bell, MapPin, ChevronRight, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading, error: authError } = useAuthStore();
  const {
    profile,
    load,
    syncTimezone,
    loading: profileLoading,
    error: profileError,
  } = useProfileStore();

  useEffect(() => {
    load();
  }, [load]);

  const loading = authLoading || profileLoading;
  const error = authError ?? profileError;

  const handleSyncTimezone = useCallback(() => {
    syncTimezone();
  }, [syncTimezone]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const avatarSeed = profile?.full_name ?? user?.email ?? 'User';
  // Use PNG format since standard RN Image doesn't support remote SVG without SvgUri
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=F6EFE8`;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#FDFBF7] px-6 pb-24 pt-12">
      <Text className="mb-8 font-serif text-4xl tracking-tight text-[#3A312B]">profile.</Text>

      <View className="mb-10 flex-row items-center gap-5">
        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#F6EFE8] shadow-md">
          <Image source={{ uri: avatarUrl }} style={{ width: 80, height: 80 }} />
        </View>
        <View className="flex-1">
          <Text className="font-serif text-2xl text-[#3A312B]">
            {profile?.full_name || 'Landed User'}
          </Text>
          <Text className="text-stone-500">{user?.email}</Text>
        </View>
      </View>

      <Text className="mb-4 ml-2 text-sm font-medium uppercase tracking-wider text-stone-400">
        Preferences
      </Text>

      <View className="flex flex-col gap-3">
        {/* Notifications */}
        <View className="flex-row items-center gap-4 rounded-[1.5rem] border border-stone-50 bg-white p-4 shadow-sm">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-stone-100">
            <Bell size={18} color="#78716C" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-[#3A312B]">Notifications</Text>
            <Text className="text-xs text-stone-500">Interview reminders</Text>
          </View>
          <View className="h-6 w-12 items-end rounded-full bg-[#E8AA42] p-1">
            <View className="h-4 w-4 rounded-full bg-white shadow-sm" />
          </View>
        </View>

        {/* Timezone */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSyncTimezone}
          className="flex-row items-center gap-4 rounded-[1.5rem] border border-stone-50 bg-white p-4 shadow-sm">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-stone-100">
            <MapPin size={18} color="#78716C" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-[#3A312B]">Timezone</Text>
            <Text className="text-xs text-stone-500">{profile?.timezone || 'Syncing...'}</Text>
          </View>
          {profileLoading ? (
            <ActivityIndicator size="small" color="#D6D3D1" />
          ) : (
            <ChevronRight size={18} color="#D6D3D1" />
          )}
        </TouchableOpacity>
      </View>

      {error ? <Text className="mt-4 text-center text-sm text-red-500">{error}</Text> : null}

      <TouchableOpacity
        onPress={handleSignOut}
        disabled={loading}
        activeOpacity={0.8}
        className="mt-12 flex-row items-center justify-center gap-3 rounded-[1.5rem] border border-rose-100 bg-white py-4 shadow-sm">
        {authLoading ? (
          <ActivityIndicator color="#F43F5E" />
        ) : (
          <>
            <LogOut size={18} color="#F43F5E" />
            <Text className="font-medium text-rose-500">Log out</Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
