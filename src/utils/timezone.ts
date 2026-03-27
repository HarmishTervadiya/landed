/**
 * Timezone utilities — all event times are stored as UTC timestamptz.
 * These helpers handle conversion between UTC storage and local display,
 * using the IANA timezone string from the user's profile.
 *
 * All functions are pure with zero side effects.
 */

/**
 * Returns the device's IANA timezone string (e.g. 'America/New_York').
 * Falls back to 'UTC' if the runtime cannot resolve it.
 */
export const getDeviceTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
};

/**
 * Converts a local datetime string (e.g. from a date picker) to a UTC ISO string
 * suitable for storing as a Supabase timestamptz.
 *
 * @param localIso - ISO-like string representing local time (e.g. '2025-06-09T14:30:00')
 * @param timezone - IANA timezone string (e.g. 'America/New_York')
 * @returns UTC ISO string (e.g. '2025-06-09T18:30:00.000Z')
 */
export const toUTC = (localIso: string, timezone: string): string => {
  // Intl doesn't parse — we use the trick of formatting a known UTC date
  // and finding the offset, then applying it.
  const date = new Date(localIso);

  const utcMs = date.getTime();
  const localOffsetMs = getTimezoneOffsetMs(date, timezone);

  return new Date(utcMs - localOffsetMs).toISOString();
};

/**
 * Converts a UTC ISO string from Supabase to a local ISO string in the given timezone.
 *
 * @param utcIso - UTC ISO string from the database (e.g. '2025-06-09T18:30:00.000Z')
 * @param timezone - IANA timezone string
 * @returns Local ISO-like string (e.g. '2025-06-09T14:30:00')
 */
export const toLocalIso = (utcIso: string, timezone: string): string => {
  const date = new Date(utcIso);
  const localOffsetMs = getTimezoneOffsetMs(date, timezone);
  const localDate = new Date(date.getTime() + localOffsetMs);

  // Return as a local ISO string without the Z suffix
  return localDate.toISOString().replace('Z', '');
};

/**
 * Returns a human-readable local time string for display.
 * e.g. 'Mon, Jun 9 at 2:30 PM'
 *
 * @param utcIso - UTC ISO string from the database
 * @param timezone - IANA timezone string
 */
export const formatEventTime = (utcIso: string, timezone: string): string => {
  const date = new Date(utcIso);

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Returns a short date string for display (e.g. 'Jun 9, 2025').
 *
 * @param utcIso - UTC ISO string from the database
 * @param timezone - IANA timezone string
 */
export const formatDate = (utcIso: string, timezone: string): string => {
  const date = new Date(utcIso);

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/**
 * Checks whether an event's time has already passed in the user's local timezone.
 *
 * @param utcIso - UTC ISO string of the event_time
 * @param timezone - IANA timezone string
 */
export const isOverdue = (utcIso: string, timezone: string): boolean => {
  const eventMs = new Date(utcIso).getTime();
  const nowMs = getNowInTimezone(timezone);
  return eventMs < nowMs;
};

/**
 * Returns the current UTC epoch ms, adjusted to represent "now" in the given timezone.
 * Used for overdue comparisons.
 */
export const getNowInTimezone = (timezone: string): number => {
  const now = new Date();
  const offsetMs = getTimezoneOffsetMs(now, timezone);
  return now.getTime() + offsetMs;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Computes the UTC offset in milliseconds for a given date in a given timezone.
 * Uses the Intl API to format the date in UTC and in the target timezone,
 * then diffs the two to get the offset.
 */
const getTimezoneOffsetMs = (date: Date, timezone: string): number => {
  const utcStr = formatInTimezone(date, 'UTC');
  const localStr = formatInTimezone(date, timezone);

  const utcParsed = new Date(utcStr).getTime();
  const localParsed = new Date(localStr).getTime();

  return localParsed - utcParsed;
};

/**
 * Formats a Date as a parseable ISO-like string in the given timezone.
 * Returns format: 'YYYY-MM-DDTHH:mm:ss'
 */
const formatInTimezone = (date: Date, timezone: string): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';

  // hour12: false can return '24' for midnight — normalize to '00'
  const hour = get('hour') === '24' ? '00' : get('hour');

  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}`;
};
