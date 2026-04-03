export const CALENDAR_DND_SCOPE = "calendarSession";

/** Matches Tailwind `w-14` (3.5rem) — time-axis gutter width in px. */
export const CALENDAR_TIME_GUTTER_PX = 56;

/** Minimum day column width; narrower viewports scroll horizontally. */
export const CALENDAR_MIN_DAY_COLUMN_PX = 72;

export const CALENDAR_MS_PER_HOUR = 60 * 60 * 1000;

export const CALENDAR_MINUTES_PER_HOUR = 60;

/** Minimum rendered height for a calendar event block (px). */
export const CALENDAR_EVENT_MIN_HEIGHT_PX = 18;

/** `(date.getDay() + CALENDAR_WEEK_MONDAY_SHIFT) % CALENDAR_DAYS_PER_WEEK` → days since Monday (Monday = 0). */
export const CALENDAR_WEEK_MONDAY_SHIFT = 6;

export const CALENDAR_DAYS_PER_WEEK = 7;

export const CALENDAR_GRID = {
  PIXELS_PER_HOUR: 48,
  HOURS_START: 0,
  HOURS_END: 24,
  SNAP_MINUTES: 15,
} as const;

export const CALENDAR_GRID_HEIGHT_PX =
  (CALENDAR_GRID.HOURS_END - CALENDAR_GRID.HOURS_START) * CALENDAR_GRID.PIXELS_PER_HOUR;

export const CALENDAR_DURATION_OPTIONS = [
  { label: "30 minut", value: 30 },
  { label: "45 minut", value: 45 },
  { label: "50 minut", value: 50 },
  { label: "60 minut", value: 60 },
] as const;
