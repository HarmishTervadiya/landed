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
 * Converts a local datetime string in a given timezone to a UTC ISO string.
 * Uses Intl to compute the offset correctly — avoids the double-conversion bug.
 *
 * @param localIso - 'YYYY-MM-DDTHH:mm:ss' representing local time in `timezone`
 * @param timezone - IANA timezone string
 */
export const localToUTC = (localIso: string, timezone: string): string => {
  // Parse the local ISO as if it were UTC to get a reference Date
  const asIfUtc = new Date(localIso + 'Z');
  // Find what UTC time corresponds to this local time in the given timezone
  // by computing the offset at that approximate moment
  const offsetMs = getTimezoneOffsetMs(asIfUtc, timezone);
  return new Date(asIfUtc.getTime() - offsetMs).toISOString();
};

/**
 * Converts a UTC ISO string to local time parts in the given timezone,
 * returning a Date object set to those local components (for use in pickers).
 */
export const utcToLocalDate = (utcIso: string, timezone: string): Date => {
  const utcDate = new Date(utcIso);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(utcDate);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  const hour = get('hour') === 24 ? 0 : get('hour');
  return new Date(get('year'), get('month') - 1, get('day'), hour, get('minute'), 0);
};

/**
 * @deprecated Use localToUTC instead
 */
export const toUTC = localToUTC;

/**
 * @deprecated Use utcToLocalDate instead
 */
export const toLocalIso = (utcIso: string, timezone: string): string => {
  const date = new Date(utcIso);
  const localOffsetMs = getTimezoneOffsetMs(date, timezone);
  const localDate = new Date(date.getTime() + localOffsetMs);

  // Use local date components directly to avoid any UTC re-interpretation
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${localDate.getUTCFullYear()}-${pad(localDate.getUTCMonth() + 1)}-${pad(localDate.getUTCDate())}` +
    `T${pad(localDate.getUTCHours())}:${pad(localDate.getUTCMinutes())}:${pad(localDate.getUTCSeconds())}`
  );
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
