/**
 * Opening-hours model and open-now logic.
 *
 * Times are wall-clock in Asia/Yangon (UTC+06:30). A `close` that is
 * numerically <= `open` means the shift runs past midnight. Multiple entries
 * for the same day model a split shift (e.g. lunch and dinner service).
 *
 * PRD BR-03 / US-05. Hours themselves are DS-01 and are NOT invented here:
 * a branch with no confirmed hours renders an honest "not yet confirmed"
 * state rather than a guess.
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface HoursEntry {
  day: Weekday;
  open: string; // "HH:MM"
  close: string; // "HH:MM"
  isClosed?: boolean;
}

export interface SpecialHours {
  date: string; // YYYY-MM-DD
  isClosed?: boolean;
  open?: string;
  close?: string;
  noteEn?: string;
  noteMy?: string;
}

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** schema.org day names, indexed to match `Weekday`. */
export const SCHEMA_DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function hasConfirmedHours(hours: HoursEntry[] | undefined | null): boolean {
  return Array.isArray(hours) && hours.length > 0;
}

/** All entries for a weekday, in start order. */
export function entriesForDay(hours: HoursEntry[], day: Weekday): HoursEntry[] {
  return hours
    .filter((h) => h.day === day && !h.isClosed)
    .sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
}

/**
 * Is the branch open at a given Yangon wall-clock moment?
 * `day` is the weekday of that moment, `minutes` minutes since midnight.
 * Handles shifts crossing midnight by also testing the previous day's shifts.
 */
export function isOpenAt(hours: HoursEntry[], day: Weekday, minutes: number): boolean {
  if (!hasConfirmedHours(hours)) return false;
  const prevDay = ((day + 6) % 7) as Weekday;

  for (const e of entriesForDay(hours, day)) {
    const o = toMinutes(e.open);
    const c = toMinutes(e.close);
    if (c > o) {
      if (minutes >= o && minutes < c) return true;
    } else if (minutes >= o) {
      // Opens today, closes after midnight.
      return true;
    }
  }
  // A shift that started yesterday and has not closed yet.
  for (const e of entriesForDay(hours, prevDay)) {
    const o = toMinutes(e.open);
    const c = toMinutes(e.close);
    if (c <= o && minutes < c) return true;
  }
  return false;
}

/** "10:00 – 22:00" strings for one day, or null when closed/unconfirmed. */
export function formatDay(hours: HoursEntry[], day: Weekday): string | null {
  const entries = entriesForDay(hours, day);
  if (entries.length === 0) return null;
  return entries.map((e) => `${e.open}–${e.close}`).join(', ');
}

/** Current weekday + minutes in Asia/Yangon, computed without a date library. */
export function yangonNow(now: Date = new Date()): { day: Weekday; minutes: number } {
  // UTC+06:30, no DST in Myanmar.
  const shifted = new Date(now.getTime() + (6 * 60 + 30) * 60_000);
  return {
    day: shifted.getUTCDay() as Weekday,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

/** openingHoursSpecification for Restaurant schema (PRD §19.4). */
export function toSchemaHours(hours: HoursEntry[]) {
  return entriesGrouped(hours).map(({ days, open, close }) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: days.map((d) => SCHEMA_DAYS[d]),
    opens: open,
    closes: close,
  }));
}

/** Collapse identical open/close pairs across days so schema stays compact. */
function entriesGrouped(hours: HoursEntry[]) {
  const map = new Map<string, { days: Weekday[]; open: string; close: string }>();
  for (const e of hours) {
    if (e.isClosed) continue;
    const key = `${e.open}-${e.close}`;
    if (!map.has(key)) map.set(key, { days: [], open: e.open, close: e.close });
    map.get(key)!.days.push(e.day);
  }
  return [...map.values()];
}
