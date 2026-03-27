import { create } from 'zustand';
import { BaseState, ActionResult, createSafeAction } from '@/utils/safeAction';
import { Profile, ProfileUpdate } from '@/types';
import { fetchProfile, upsertProfile, updatePushToken, updateTimezone } from '@/lib/profile';
import { getDeviceTimezone } from '@/utils/timezone';

export interface ProfileState extends BaseState {
  profile: Profile | null;
  load: () => Promise<ActionResult<void>>;
  update: (data: ProfileUpdate) => Promise<ActionResult<void>>;
  savePushToken: (token: string) => Promise<ActionResult<void>>;
  syncTimezone: () => Promise<ActionResult<void>>;
}

export const useProfileStore = create<ProfileState>((set, get) => {
  const safeAction = createSafeAction(set);

  return {
    profile: null,
    loading: false,
    error: null,

    load: () =>
      safeAction(async () => {
        const profile = await fetchProfile();
        if (!profile) return;

        const deviceTimezone = getDeviceTimezone();

        if (profile.timezone !== deviceTimezone) {
          await updateTimezone(deviceTimezone);
          set({ profile: { ...profile, timezone: deviceTimezone } });
          return;
        }

        set({ profile });
      }),

    update: (data: ProfileUpdate) =>
      safeAction(async () => {
        const updated = await upsertProfile(data);
        set({ profile: updated });
      }),

    savePushToken: (token: string) =>
      safeAction(async () => {
        await updatePushToken(token);
        const { profile } = get();
        if (profile) set({ profile: { ...profile, expo_push_token: token } });
      }),

    syncTimezone: () =>
      safeAction(async () => {
        const deviceTimezone = getDeviceTimezone();
        const { profile } = get();

        if (profile?.timezone === deviceTimezone) return;

        await updateTimezone(deviceTimezone);
        if (profile) set({ profile: { ...profile, timezone: deviceTimezone } });
      }),
  };
});
