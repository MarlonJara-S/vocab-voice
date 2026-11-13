import type { ReviewLogRecord } from "@/lib/db/types"

/**
 * New cards still allowed today for a deck. `todayLogs` must be the logs
 * since the start of the study day (4 AM). Undo deletes the log, so an
 * undone new card is given back.
 */
export function newCardsLeft(
  deckId: string,
  todayLogs: Iterable<ReviewLogRecord>,
  newPerDay: number
): number {
  let introduced = 0
  for (const log of todayLogs) {
    if (log.deckId === deckId && log.wasNew) introduced++
  }
  return Math.max(0, newPerDay - introduced)
}
