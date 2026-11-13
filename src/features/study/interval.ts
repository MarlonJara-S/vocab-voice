const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`

/** "1 min", "3 h", "1 day", "12 days", "2 mo", "1.5 yr" */
export function formatInterval(from: Date, to: Date): string {
  const ms = to.getTime() - from.getTime()
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))} min`
  if (ms < DAY) return `${Math.round(ms / HOUR)} h`

  const days = Math.round(ms / DAY)
  if (days < 30) return plural(days, "day")
  if (days < 365) return `${Math.round(days / 30)} mo`

  const years = Math.round((days / 365) * 10) / 10
  return `${years} yr`
}
