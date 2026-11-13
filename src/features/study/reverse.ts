import { Rating } from "ts-fsrs"

import type { ReviewLogRecord } from "@/lib/db/types"

/**
 * A reverse card (ES → EN) unlocks after its EN → ES card has this many
 * successful reviews, so beginners don't get double the load from day one.
 */
export const REVERSE_UNLOCK_REVIEWS = 2

/** cardId → number of "Remembered" answers on the EN → ES side. */
export function countSuccessfulReviews(
  logs: Iterable<ReviewLogRecord>
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const log of logs) {
    if (log.direction !== "en-es" || log.rating !== Rating.Good) continue
    counts.set(log.cardId, (counts.get(log.cardId) ?? 0) + 1)
  }
  return counts
}

export function isReverseUnlocked(
  cardId: string,
  successfulReviews: ReadonlyMap<string, number>
): boolean {
  return (successfulReviews.get(cardId) ?? 0) >= REVERSE_UNLOCK_REVIEWS
}
