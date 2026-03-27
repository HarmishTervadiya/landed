import React, { useCallback } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const { signInWithGoogle, loading, error } = useAuthStore();

  const handleGoogleSignIn = useCallback(async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      console.error('Sign-in failed:', result.error);
    }
  }, [signInWithGoogle]);

  return (
    <View className="flex-1 flex-col items-center justify-center bg-[#FDFBF7] px-8 pt-10 text-center">
      <View className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#F6EFE8] shadow-sm">
        <Briefcase size={40} color="#E8AA42" strokeWidth={2} />
      </View>

      <Text className="mb-3 font-serif text-5xl tracking-tight text-[#3A312B]">landed.</Text>
      <Text className="mb-12 text-lg text-stone-500">your personal job companion</Text>

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex-row items-center justify-center gap-3 rounded-[2rem] bg-[#3A312B] py-4 shadow-md"
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color="#FDFBF7" />
        ) : (
          <Text className="text-base font-medium text-white">Continue with Google</Text>
        )}
      </TouchableOpacity>

      {error ? <Text className="mt-4 text-center text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
