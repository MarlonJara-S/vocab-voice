/**
 * The study day starts at 4:00 AM local time, so a late-night session
 * (e.g. 1 AM) still counts for the previous day.
 */
export const DAY_START_HOUR = 4

/** 4:00 AM local time of the study day that contains `now`. */
export function startOfStudyDay(now: Date): Date {
  const start = new Date(now)
  start.setHours(DAY_START_HOUR, 0, 0, 0)
  if (now < start) start.setDate(start.getDate() - 1)
  return start
}

/** 4:00 AM local time of the next study day (exclusive end). */
export function endOfStudyDay(now: Date): Date {
  const end = startOfStudyDay(now)
  // setDate (not +24h) keeps 4:00 AM across daylight saving changes.
  end.setDate(end.getDate() + 1)
  return end
}

/** "2026-11-13": the calendar date of the study day (for streaks). */
export function studyDayKey(now: Date): string {
  const start = startOfStudyDay(now)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
}
