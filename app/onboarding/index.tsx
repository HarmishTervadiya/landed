import React, { useState, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FileSpreadsheet, Sparkles, BellRing, CheckCircle2 } from 'lucide-react-native';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Onboarding() {
  const router = useRouter();
  const { markComplete } = useOnboarding();
  const [onboardingStep, setOnboardingStep] = useState(1);

  const finish = useCallback(async () => {
    await markComplete();
    router.replace('/auth/login');
  }, [markComplete, router]);

  return (
    <View className="flex-1 flex-col bg-[#FDFBF7] px-8 pt-20">
      <View className="mb-12 flex-row gap-2">
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            className={`h-1.5 flex-1 rounded-full ${step <= onboardingStep ? 'bg-[#E8AA42]' : 'bg-stone-200'}`}
          />
        ))}
      </View>

      {onboardingStep === 1 && (
        <View className="flex-1 flex-col">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[#F6EFE8] shadow-sm">
            <FileSpreadsheet size={28} color="#E8AA42" />
          </View>
          <Text className="mb-4 font-serif text-3xl leading-tight text-[#3A312B]">
            ditch the{'\n'}spreadsheets.
          </Text>
          <Text className="mb-8 text-lg leading-relaxed text-stone-500">
            Job hunting is chaotic. Tracking hundreds of applications, tabs, and deadlines shouldn
            {"'"}t feel like a second full-time job.
          </Text>

          <View className="mt-auto pb-12">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOnboardingStep(2)}
              className="w-full items-center justify-center rounded-[1.5rem] bg-[#3A312B] py-4 shadow-lg">
              <Text className="text-base font-medium text-white">Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {onboardingStep === 2 && (
        <View className="flex-1 flex-col">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[#F6EFE8] shadow-sm">
            <Sparkles size={28} color="#E8AA42" />
          </View>
          <Text className="mb-4 font-serif text-3xl leading-tight text-[#3A312B]">
            find your{'\n'}focus.
          </Text>
          <Text className="mb-8 text-lg leading-relaxed text-stone-500">
            Landed brings everything into one peaceful place. Your wishlist, interviews, and
            notes—organized into a beautifully simple timeline.
          </Text>

          <View className="mb-auto flex-row items-center gap-4 rounded-[1.5rem] border border-stone-100 bg-white p-5 shadow-sm">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8AA42]">
              <CheckCircle2 size={18} color="#FFF" />
            </View>
            <View>
              <Text className="text-sm font-medium text-[#3A312B]">System Design Interview</Text>
              <Text className="mt-0.5 text-xs text-stone-500">Stripe • Scheduled</Text>
            </View>
          </View>

          <View className="mt-auto pb-12">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOnboardingStep(3)}
              className="w-full items-center justify-center rounded-[1.5rem] bg-[#3A312B] py-4 shadow-lg">
              <Text className="text-base font-medium text-white">Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {onboardingStep === 3 && (
        <View className="flex-1 flex-col pb-20">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[#F6EFE8] shadow-sm">
            <BellRing size={28} color="#E8AA42" />
          </View>
          <Text className="mb-4 font-serif text-3xl leading-tight text-[#3A312B]">
            never miss{'\n'}a beat.
          </Text>
          <Text className="mb-8 text-lg leading-relaxed text-stone-500">
            Just paste a job link, log your interviews, and relax. We{"'"}ll gently remind you of
            upcoming events so you can focus on landing the role.
          </Text>

          <View className="mt-auto">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={finish}
              className="w-full items-center justify-center rounded-[1.5rem] bg-[#E8AA42] py-4 shadow-lg">
              <Text className="text-base font-medium text-white">Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
