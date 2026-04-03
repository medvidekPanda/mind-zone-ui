import {
  CALENDAR_DAYS_PER_WEEK,
  CALENDAR_EVENT_MIN_HEIGHT_PX,
  CALENDAR_GRID,
  CALENDAR_GRID_HEIGHT_PX,
  CALENDAR_MINUTES_PER_HOUR,
  CALENDAR_MS_PER_HOUR,
  CALENDAR_WEEK_MONDAY_SHIFT,
} from "../constants/calendar.constants";
import type { CalendarBlock } from "../interfaces/calendar.interface";

/** Pixel height of a block on the week grid from its start/end timestamps. */
export const calendarEventHeight = (block: CalendarBlock): number => {
  const hours = (block.endMs - block.startMs) / CALENDAR_MS_PER_HOUR;

  return Math.max(hours * CALENDAR_GRID.PIXELS_PER_HOUR, CALENDAR_EVENT_MIN_HEIGHT_PX);
};

/**
 * Vertical offset in pixels from the top of a day column for a given instant.
 * Uses local wall-clock time on the date of `startMs`.
 */
export const calendarEventTopMillis = (startMs: number): number => {
  const date = new Date(startMs);
  const minutesSinceMidnight =
    date.getHours() * CALENDAR_MINUTES_PER_HOUR + date.getMinutes() + date.getSeconds() / CALENDAR_MINUTES_PER_HOUR;

  return (minutesSinceMidnight / CALENDAR_MINUTES_PER_HOUR) * CALENDAR_GRID.PIXELS_PER_HOUR;
};

/** Hour indices from `HOURS_START` through `HOURS_END - 1` for grid row labels. */
export const calendarHoursRange = Array.from(
  { length: CALENDAR_GRID.HOURS_END - CALENDAR_GRID.HOURS_START },
  (_, hourIndex) => CALENDAR_GRID.HOURS_START + hourIndex,
);

/** Total scrollable height of the time grid (same as Tailwind lane height wiring). */
export const calendarGridHeightPx = (): number => CALENDAR_GRID_HEIGHT_PX;

/**
 * Combines a local calendar day (`YYYY-MM-DD`) with wall-clock fields from a timepicker `Date`.
 * Does not use `new Date("YYYY-MM-DD")` (UTC midnight), which breaks local placement on the grid.
 *
 * @param isoDateKey — Day in `YYYY-MM-DD` interpreted in local timezone.
 * @param time — Same-day wall time from a picker (only H/M/S/ms are read).
 * @returns Local `Date`, or an **invalid** `Date` if the key is not three numeric segments.
 */
export const combineLocalDateKeyAndTime = (isoDateKey: string, time: Date): Date => {
  const segments = isoDateKey.split("-");

  if (segments.length !== 3) {
    return new Date(Number.NaN);
  }

  const year = Number.parseInt(segments[0]!, 10);
  const month = Number.parseInt(segments[1]!, 10);
  const day = Number.parseInt(segments[2]!, 10);

  if ([year, month, day].some((n) => Number.isNaN(n))) {
    return new Date(Number.NaN);
  }

  return new Date(year, month - 1, day, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
};

/**
 * Maps a calendar day plus a Y offset inside the column to a UTC milliseconds timestamp.
 * `yPx` is measured from the top of the grid using `PIXELS_PER_HOUR` and `HOURS_START`.
 */
export const composeDayTime = (day: Date, yPx: number): number => {
  const hours = CALENDAR_GRID.HOURS_START + yPx / CALENDAR_GRID.PIXELS_PER_HOUR;
  const base = stripTime(new Date(day)).getTime();

  return base + hours * CALENDAR_MS_PER_HOUR;
};

/** Rounds local minutes to the grid snap interval (`CALENDAR_GRID.SNAP_MINUTES`); zeroes seconds and ms. */
export const snapToGrid = (ms: number): number => {
  const date = new Date(ms);
  const stepped = Math.round(date.getMinutes() / CALENDAR_GRID.SNAP_MINUTES) * CALENDAR_GRID.SNAP_MINUTES;

  date.setMinutes(stepped, 0, 0);

  return date.getTime();
};

/** Monday 00:00:00.000 in local time for the week that contains `reference` (calendar truncated with {@link stripTime}). */
export const startOfWeek = (reference: Date): Date => {
  const date = stripTime(new Date(reference));
  const day = (date.getDay() + CALENDAR_WEEK_MONDAY_SHIFT) % CALENDAR_DAYS_PER_WEEK;

  date.setDate(date.getDate() - day);

  return date;
};

/** Copies `date` and sets local hours, minutes, seconds, and ms to zero. */
export const stripTime = (date: Date): Date => {
  const next = new Date(date);

  next.setHours(0, 0, 0, 0);

  return next;
};

/** `YYYY-MM-DD` for `date` in local timezone (month and day zero-padded). */
export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const dayNum = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${dayNum}`;
};
