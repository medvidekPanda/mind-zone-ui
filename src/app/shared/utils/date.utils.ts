/**
 * Rounds the time to the nearest next five-minute interval.
 * E.g., 14:32 -> 14:35, 14:34 -> 14:35, 14:35 -> 14:35 (only resets seconds).
 */
export function roundToNext5Min(date: Date): Date {
  const roundedDate = new Date(date);
  const minutes = roundedDate.getMinutes();
  const remainder = minutes % 5;

  if (remainder > 0) {
    roundedDate.setMinutes(minutes + (5 - remainder), 0, 0);
  } else {
    roundedDate.setSeconds(0, 0);
  }

  return roundedDate;
}
