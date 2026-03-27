import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIF_KEY_PREFIX = '@landed/notif_ids_';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('event-reminders', {
        name: 'Event Reminders',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        showBadge: true,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') {
      console.log('[Notifications] Permission already granted');
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    console.log('[Notifications] Permission status:', status);
    return status === 'granted';
  } catch (e) {
    console.error('[Notifications] Permission request failed:', e);
    return false;
  }
}

/**
 * Schedule up to 3 reminders for an event:
 * - 1 day before
 * - 1 hour before
 * - At event time
 */
export async function scheduleEventReminders(
  eventId: string,
  eventTitle: string,
  eventTimeUtc: string,
  companyName?: string
): Promise<void> {
  try {
    // Ensure permission is granted
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[Notifications] Permission not granted, skipping schedule');
      return;
    }

    // Ensure Android channel exists
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('event-reminders', {
        name: 'Event Reminders',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
      });
    }

    // Cancel any existing reminders for this event first
    await cancelEventReminders(eventId);

    const eventDate = new Date(eventTimeUtc);
    const now = new Date();
    const ids: string[] = [];
    const body = companyName ? `${companyName} — ${eventTitle}` : eventTitle;

    const reminders = [
      { label: '1 day before', title: '⏰ Tomorrow', offsetMs: 24 * 60 * 60 * 1000 },
      { label: '1 hour before', title: '⏰ In 1 hour', offsetMs: 60 * 60 * 1000 },
      { label: 'at event time', title: '🗓 Starting now', offsetMs: 0 },
    ];

    for (const reminder of reminders) {
      const triggerDate = new Date(eventDate.getTime() - reminder.offsetMs);

      if (triggerDate <= now) {
        console.log(`[Notifications] Skipping "${reminder.label}" — trigger is in the past`);
        continue;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${reminder.title}: ${eventTitle}`,
          body,
          sound: 'default',
          data: { eventId },
          ...(Platform.OS === 'android' && { channelId: 'event-reminders' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      ids.push(id);
      console.log(
        `[Notifications] Scheduled "${reminder.label}" at ${triggerDate.toISOString()} — id: ${id}`
      );
    }

    if (ids.length > 0) {
      await AsyncStorage.setItem(NOTIF_KEY_PREFIX + eventId, JSON.stringify(ids));
      console.log(`[Notifications] ${ids.length} reminder(s) scheduled for event: ${eventTitle}`);
    } else {
      console.log(`[Notifications] No future reminders to schedule for: ${eventTitle}`);
    }
  } catch (e) {
    console.error('[Notifications] Failed to schedule reminders:', e);
  }
}

/**
 * Cancel all scheduled notifications for a given event.
 */
export async function cancelEventReminders(eventId: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_KEY_PREFIX + eventId);
    if (!raw) return;

    const ids: string[] = JSON.parse(raw);
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    await AsyncStorage.removeItem(NOTIF_KEY_PREFIX + eventId);
    console.log(`[Notifications] Cancelled ${ids.length} reminder(s) for event: ${eventId}`);
  } catch (e) {
    console.error('[Notifications] Failed to cancel reminders:', e);
  }
}

/** Debug helper — list all currently scheduled notifications */
export async function listScheduledNotifications(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  console.log(`[Notifications] ${all.length} scheduled notification(s):`);
  all.forEach((n) => {
    console.log(`  - ${n.identifier}: "${n.content.title}" trigger:`, n.trigger);
  });
}
